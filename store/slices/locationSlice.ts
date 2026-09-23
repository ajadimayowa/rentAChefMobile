// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ILocations {
    states: ILocation[],
    userLocation: string,
    userState: string,
}

interface ILocation {
    "id": string,
    "state": string,
    "localGovernmentAreas": string[]
}
interface ILocations {
    states: ILocation[],
    userLocation: string,
    tempLocation: string,
    userState: string,
    tempState: string,
    long: string,
    lat: string,
    /** Reverse-geocoded from the device's live GPS position, distinct from the manually picked userLocation/userState above */
    detectedCity: string,
    detectedState: string,
}


const initialState: ILocations = {
    states: [],
    userLocation: 'All Nigeria',
    tempLocation: '',
    tempState: '',
    userState: '',
    long: '',
    lat: '',
    detectedCity: '',
    detectedState: '',
}


const locationSlice = createSlice({
    name: "location",
    initialState,
    reducers: {
        setStates: (
            state,
            action: PayloadAction<any>
        ) => {
            state.states = action.payload;
        },
        setUserLocation: (
            state,
            action: PayloadAction<any>
        ) => {
            state.userLocation = action.payload;
        },
        setTempState: (
            state,
            action: PayloadAction<any>
        ) => {
            state.tempState = action.payload;
        },
        setLongandLat: (
            state,
            action: PayloadAction<any>
        ) => {
            state.lat = action.payload?.lat;
            state.long = action.payload?.long;
        },
        setUserState: (
            state,
            action: PayloadAction<any>
        ) => {
            state.userState = action.payload;
        },
        setDetectedCity: (
            state,
            action: PayloadAction<any>
        ) => {
            state.detectedCity = action.payload;
        },
        setDetectedState: (
            state,
            action: PayloadAction<any>
        ) => {
            state.detectedState = action.payload;
        }
    },
});

export const { setStates,setUserLocation,setUserState,setLongandLat,setTempState,setDetectedCity,setDetectedState } = locationSlice.actions;
export default locationSlice.reducer;