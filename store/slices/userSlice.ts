// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface IUserProfile {
    bioData: {
        "id": string,
        "email": string,
        "fullName": string,
        "gender": string,
        "profilePic": string,
        "isAdmin": boolean | null
    }
}


const initialState: IUserProfile = {
    bioData: {
        "id": "",
        "email": "",
        "fullName": "",
        "gender": 'm',
        "profilePic": '',
        "isAdmin": null
    }
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUserProfile: (
            state,
            action: PayloadAction<any>
        ) => {
            state.bioData = action.payload;
        }
    },
});

export const { setUserProfile } = authSlice.actions;
export default authSlice.reducer;