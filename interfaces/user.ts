export interface IUser{
  email: string;
  emailVerificationOtp: string;
  isEmailVerified: boolean;
  password: string;
  loginOtp?: string;
  loginOtpExpires: Date | any;
  fullName?: string;
  profilePic?: string;  // Made optional
  firstName: string;
  gender:'m'|'f';
  phone?: string;
  maritalStatus?: 'Single'|'Married'|'Divorced'|'Widowed'; // Made optional
  dob?:Date;
  isAdmin: boolean;
  createdAt: Date;
  location?: {  // Made optional
    home: string;
    office: string;
    state: string;
    city: string;
    long: string;
    lat: string;
  };
  kyc?: {  // Made optional
    idType: string;
    idNumber: string;
    idPicture: string;
    isVerified: boolean;
  };
  nok?: {  // Made optional
    fullName: string;
    phone: string;
    relationship: string;
  };
  healthInformation?: {  // Made optional
    allergies: string[];  // Fixed typo from 'allegies' to 'allergies'
    healthDetails: string;
  };
}