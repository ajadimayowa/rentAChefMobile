// src/hooks/useLocation.ts

import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useDispatch } from 'react-redux';
import { setLongandLat, setUserLocation, setUserState } from '@/store/slices/locationSlice';


// Define types for the location data
interface LocationData {
    latitude: number;
    longitude: number;
}

interface UseLocationResult {
    long:string,
    lat:string,
    // location: LocationData | null;
    error: string | null;
    isLoading: boolean;
}

// Custom Hook: useLocation
const useLocation = (): UseLocationResult => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [lat,setLat]=useState("");
    const [long,setLong]=useState("");
    const dispatch = useDispatch();

    useEffect(() => {
        const getLocation = async () => {
            try {
                // Request permission for location access
                const { status } = await Location.requestForegroundPermissionsAsync();

                if (status !== 'granted') {
                    setError('Permission to access location was denied');
                    setIsLoading(false);
                    return;
                }
                let {coords}:any =  await Location.getCurrentPositionAsync();
                if(coords){
                    const {latitude,longitude}=coords;
                    setLat(latitude);
                    setLong(longitude);
                    let response:any = await Location.reverseGeocodeAsync({latitude,longitude});
                    console.log('Location is :',response);
                    dispatch(setUserLocation(response[0]?.subregion));
                    dispatch(setUserState(response[0]?.city));
                    dispatch(setLongandLat({long:longitude,lat:latitude}));
                }

                // Get the current location
                // const currentLocation:any = await Location.getCurrentPositionAsync({});
                // const locInfo = await Location.
                // setLocation(currentLocation.coords);
            } catch (err) {
                setError('Error fetching location');
            } finally {
                setIsLoading(false);
            }
        };

        getLocation();
    }, []); // Empty dependency array means this effect runs only once when the component mounts

    return { lat,long, error, isLoading };
};

export default useLocation;