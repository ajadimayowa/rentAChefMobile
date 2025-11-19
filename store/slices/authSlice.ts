// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface IStaffProfile {
    biodata: {
        id: string
        fullName: string,
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
    organization?: {
        id: string;
        fullName: string
        address: string;
        status: string;
    };
    branch?: {
        id: string;
        fullName: string
        address: string;
        bankAccountInformation: {
            accountName: string;
            accountNumber: string;
            nameOfBank: string;
            isActive: boolean
        }
        status: string;
        manager: {
            id: string;
            fullName: string;
            phoneNumber: string;
            isActive: boolean
        }
    };
    role?: {
        id?: string;
        fullName?: string;
        isActive: boolean
    }
    department?: {
        id?: string;
        fullName?: string;
        isActive?: boolean
    };



}
interface AuthState {
    token: string | null;
    userId: string | null;
    staffProfile: IStaffProfile| null
}


const initialState: AuthState = {
  token: null,
  userId: null,
  staffProfile: {
    biodata: {
      id: "",
      fullName: "",
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
    },
    organization: {
      id: "",
      fullName: "",
      address: "",
      status: "",
    },
    branch: {
      id: "",
      fullName: "",
      address: "",
      bankAccountInformation: {
        accountName: "",
        accountNumber: "",
        nameOfBank: "",
        isActive: false,
      },
      status: "",
      manager: {
        id: "",
        fullName: "",
        phoneNumber: "",
        isActive: false,
      },
    },
    role: {
      id: "",
      fullName: "",
      isActive: false,
    },
    department: {
      id: "",
      fullName: "",
      isActive: false,
    },
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
            action: PayloadAction<IStaffProfile>
        ) => {
            state.staffProfile = action.payload;
        },
        logout: (state) => {
            state.token = null;
            state.userId = null;
        },
    },
});

export const { setCredentials, setStaffProfile, logout } = authSlice.actions;
export default authSlice.reducer;