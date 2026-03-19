export interface Booking {
  id: string;
  clientId: Client;
  bookingType: string;
  clientNote: string;
  chefId: Chef;
  serviceId: Service;
  categoryId: string;
  startDate: string;
  endDate: string;
  bookingFeePaid: boolean;
  procurementPaid: boolean;
  bookingFeeAmount: number;
  numberOfPeople: number;
  procurementAmount: number;
  totalAmount: number;
  specialMenuId:{
    title:string
  }
  paymentChannel: string;
  paymentReference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  procurementId?:any
}

export interface Client {
  id: string;
  location: Location;
  kyc: KYC;
  nok: NextOfKin;
  healthInformation: HealthInformation;
  email: string;
  emailVerificationOtp: string;
  isEmailVerified: boolean;
  password: string;
  fullName: string;
  firstName: string;
  phone: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  profilePic: string;
  maritalStatus: string;
  dob: string;
  gender: string;
  loginOtp: string;
  loginOtpExpires: string;
}

export interface Location {
  home: string;
  office: string;
  state: string;
  city: string;
  long: string;
  lat: string;
}

export interface KYC {
  idType: string;
  idNumber: string;
  idPicture: string;
  isVerified: boolean;
}

export interface NextOfKin {
  fullName: string;
  phone: string;
  relationship: string;
}

export interface HealthInformation {
  allergies: string[];
  healthDetails: string;
}

export interface Chef {
  id: string;
  staffId: string;
  name: string;
  gender: string;
  email: string;
  bio: string;
  specialties: string[];
  category: string;
  phoneNumber: number;
  location: string;
  state: string;
  stateId: number;
  profilePic: string;
  menus: any[];
  password: string;
  isPasswordUpdated: boolean;
  isActive: boolean;
  dob: string;
  yearsOfExperience: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
