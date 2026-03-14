// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface IChefProfile {
    chefData: {
        "id": string,
        "staffId": string,
        "name": string,
        "email": string,
        "gender": string,
        "profilePic": string,
        "isPasswordUpdated": boolean | null
    }
}


const initialState: IChefProfile = {
    chefData: {
        "id": "",
        "staffId": "",
        "name": "",
        "email": "",
        "gender": 'm',
        "profilePic": '',
        "isPasswordUpdated": null
    }
}

const chefSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setChefProfile: (
            state,
            action: PayloadAction<any>
        ) => {
            state.chefData = action.payload;
        }
    },
});

export const { setChefProfile } = chefSlice.actions;
export default chefSlice.reducer;