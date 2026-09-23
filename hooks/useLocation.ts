// src/hooks/useLocation.ts

import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLongandLat, setDetectedCity, setDetectedState } from '@/store/slices/locationSlice';

interface UseLocationResult {
    lat: number | null;
    long: number | null;
    city: string | null;
    state: string | null;
    error: string | null;
    isLoading: boolean;
    /** true once the user has permanently denied access (OS won't show the native prompt again) */
    isBlocked: boolean;
    requestLocation: () => Promise<void>;
    openLocationSettings: () => void;
}

/**
 * Several unrelated screens (auth screen, login, edit profile, the payment
 * modals…) each mount this hook and ask it to fetch the user's location on
 * their own mount — e.g. landing on the auth screen and then tapping through
 * to login fires two independent GPS + reverse-geocode requests seconds
 * apart. The device geocoder rate-limits that ("Geocoding rate limit
 * exceeded"), so a fetch that's still fresh is reused instead of repeated:
 * a module-level (shared across every mounted instance of this hook, not
 * per-component) in-flight guard collapses simultaneous requests into one,
 * and a short TTL skips re-fetching entirely right after a successful one.
 */
const LOCATION_CACHE_TTL_MS = 5 * 60 * 1000;
const REVERSE_GEOCODE_RETRY_DELAYS_MS = [1500, 3000];

let lastFetchedAt = 0;
let inFlightRequest: Promise<void> | null = null;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (err: any) =>
    /rate limit/i.test(err?.message ?? '') || /rate limit/i.test(err?.cause?.message ?? '');

// Reverse geocoding is a transient, best-effort lookup — a rate limit is
// worth a couple of short retries before giving up on it.
const reverseGeocodeWithRetry = async (latitude: number, longitude: number) => {
    for (let attempt = 0; ; attempt++) {
        try {
            return await Location.reverseGeocodeAsync({ latitude, longitude });
        } catch (err: any) {
            if (!isRateLimitError(err) || attempt >= REVERSE_GEOCODE_RETRY_DELAYS_MS.length) {
                throw err;
            }
            await sleep(REVERSE_GEOCODE_RETRY_DELAYS_MS[attempt]);
        }
    }
};

const useLocation = (): UseLocationResult => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    const [lat, setLat] = useState<number | null>(null);
    const [long, setLong] = useState<number | null>(null);
    const [city, setCity] = useState<string | null>(null);
    const [state, setStateName] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    const cachedLocation = useAppSelector((s) => s.location);

    const hydrateFromCache = useCallback(() => {
        const cachedLat = parseFloat(cachedLocation.lat);
        const cachedLong = parseFloat(cachedLocation.long);
        if (!Number.isNaN(cachedLat)) setLat(cachedLat);
        if (!Number.isNaN(cachedLong)) setLong(cachedLong);
        setCity(cachedLocation.detectedCity || null);
        setStateName(cachedLocation.detectedState || null);
    }, [cachedLocation]);

    const fetchLocation = useCallback(async () => {
        // Only shows the native OS prompt the first time; once the user has
        // answered (on this install), the OS resolves this instantly with
        // the earlier decision and no dialog appears again.
        const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            setIsBlocked(!canAskAgain);
            setError(
                canAskAgain
                    ? 'Permission to access location was denied'
                    : 'Location access is disabled for this app. Enable it from device Settings.'
            );
            return;
        }

        setIsBlocked(false);
        const position = await Location.getCurrentPositionAsync({});
        const coords: any = position?.coords;
        if (!coords) return;

        const { latitude, longitude } = coords;
        setLat(latitude);
        setLong(longitude);
        dispatch(setLongandLat({ long: longitude, lat: latitude }));
        lastFetchedAt = Date.now();

        try {
            const response: any = await reverseGeocodeWithRetry(latitude, longitude);
            const place = response?.[0] || {};

            setCity(place.city || null);
            setStateName(place.region || null);

            dispatch(setDetectedCity(place.city || null));
            dispatch(setDetectedState(place.region || null));
        } catch (revErr) {
            // Reverse geocode failure shouldn't break the hook — fall back to
            // whatever city/state we last resolved successfully, if any.
            console.warn('Reverse geocode failed', revErr);
            setCity(cachedLocation.detectedCity || null);
            setStateName(cachedLocation.detectedState || null);
        }
    }, [dispatch, cachedLocation.detectedCity, cachedLocation.detectedState]);

    const getLocation = useCallback(async () => {
        setIsLoading(true);
        try {
            // A fetch from another mounted instance of this hook is already
            // in flight — wait for it instead of firing a second one.
            if (inFlightRequest) {
                await inFlightRequest;
                hydrateFromCache();
                return;
            }

            // We already have a recent-enough position (this session, or
            // persisted from the last one) — reuse it.
            if (cachedLocation.lat && cachedLocation.long && Date.now() - lastFetchedAt < LOCATION_CACHE_TTL_MS) {
                hydrateFromCache();
                return;
            }

            const request = fetchLocation();
            inFlightRequest = request;
            try {
                await request;
            } finally {
                inFlightRequest = null;
            }
        } catch (err: any) {
            setError(err?.message || 'Error fetching location');
        } finally {
            setIsLoading(false);
        }
    }, [cachedLocation.lat, cachedLocation.long, fetchLocation, hydrateFromCache]);

    // expose a request function so callers can trigger on demand
    const requestLocation = getLocation;

    const openLocationSettings = useCallback(() => {
        Linking.openSettings();
    }, []);

    return { lat, long, city, state, error, isLoading, isBlocked, requestLocation, openLocationSettings };
};

export default useLocation;
