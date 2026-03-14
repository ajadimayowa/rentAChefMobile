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
    lat: string
}


const initialState: ILocations = {
    states: [],
    userLocation: 'All Nigeria',
    tempLocation: '',
    tempState: '',
    userState: '',
    long: '',
    lat: ''
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
        }
    },
});

export const { setStates,setUserLocation,setUserState,setLongandLat,setTempState } = locationSlice.actions;
export default locationSlice.reducer;