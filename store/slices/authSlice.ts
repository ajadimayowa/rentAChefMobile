// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface IUserProfile {
    biodata: {
        id: string
        fullName: string,
        firstName:string,
        email: string,
        phoneNumber: string
        address: string;
        passportPhotograph: string;
        isVerified: boolean;
        isDisable: boolean;
        status: string;
        staffType: string;
        staffLevel: string
        kyc: {
            modeOfIdentification?: string
            idCardPicture?: string;
            idNumber?: string
        };
        nok?: {
            fullName?: string,
            email?: string,
            phoneNumber?: string
            address?: string;
            passportPhotograph?: string;
            isVerified?: boolean
            isDisable?: boolean
            modeOfIdentification?: string
            idCardPicture?: string;
            idNumber?: string
        };
    };



}
interface AuthState {
    token: string | null;
    userId: string | null;
    userProfile: IUserProfile| null
}


const initialState: AuthState = {
  token: null,
  userId: null,
  userProfile: {
    biodata: {
      id: "",
      fullName: "",
      firstName:'',
      email: "",
      phoneNumber: "",
      address: "",
      passportPhotograph: "",
      isVerified: false,
      isDisable: false,
      status: "",
      staffType: "",
      staffLevel: "",
      kyc: {
        modeOfIdentification: "",
        idCardPicture: "",
        idNumber: "",
      },
      nok: {
        fullName: "",
        email: "",
        phoneNumber: "",
        address: "",
        passportPhotograph: "",
        isVerified: false,
        isDisable: false,
        modeOfIdentification: "",
        idCardPicture: "",
        idNumber: "",
      },
    }
  },
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ token: string; userId: string }>
        ) => {
            state.token = action.payload.token;
            state.userId = action.payload.userId;
        },
        setStaffProfile: (
            state,
            action: PayloadAction<IUserProfile>
        ) => {
            state.userProfile = action.payload;
        },
        logout: (state) => {
            state.token = null;
            state.userId = null;
        },
    },
});

export const { setCredentials, setStaffProfile, logout } = authSlice.actions;
export default authSlice.reducer;