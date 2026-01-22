// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ILocation {
    "id": string,
    "state": string,
    "localGovernmentAreas": string[]
}
interface ILocations {
    states: ILocation[],
    userLocation:string,
    userState:string,
}


const initialState: ILocations = {
    states: [],
    userLocation:'Eti-Osa',
    userState:'Lagos'
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
        setUserLoaction: (
            state,
            action: PayloadAction<any>
        ) => {
            state.userLocation = action.payload;
        },
        setUserState: (
            state,
            action: PayloadAction<any>
        ) => {
            state.userState = action.payload;
        }
    },
});

export const { setStates,setUserLoaction,setUserState } = locationSlice.actions;
export default locationSlice.reducer;