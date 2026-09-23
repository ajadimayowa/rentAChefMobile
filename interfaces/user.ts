// Mirrors rentAChefBackend/src/models/User.model.ts (IUser), adapted for JSON
// responses: ObjectId -> string, Date -> ISO string, and Mongoose Document
// members dropped.

export type UserType = "Admin" | "Customer" | "Chef";

export type Gender = "Male" | "Female";

export type MaritalStatus = "Single" | "Married" | "Divorced" | "Widowed";

export type AdminRole = "super_admin" | "admin";

export interface IUserAddress {
  homeAddress?: string;
  officeAddress?: string;
  stateId?: string;
  stateName?: string;
  city?: string;
  long?: string;
  lat?: string;
}

export interface IUserKyc {
  idType?: string;
  idNumber?: string;
  idPicture?: string;
  isVerified?: boolean;
}

export interface IUserNok {
  fullName?: string;
  phone?: string;
  relationship?: string;
}

export interface IHealthInformation {
  allergies?: string[];
  healthDetails?: string;
}

export interface ICustomerDetails {
  healthInformation?: IHealthInformation;
}

export interface IAdminDetails {
  role?: AdminRole;
}

// Chef level as populated from the `Category` collection
// (chefDetails.chefLevel is populated with "name description").
export interface IChefLevel {
  id: string;
  name: string;
  description?: string;
}

export interface IChefAvailability {
  start: string;
  end: string;
  isBooked: boolean;
  zone?: string;
}

export interface IChefDetails {
  staffId?: string;
  rating?: number;
  yearsOfExperience?: number;
  specialties?: string[];
  bio?: string;

  // Populated object when `chefDetails.chefLevel` is populated, otherwise the raw id.
  chefLevel?: IChefLevel | string;

  chefMenus?: string[];

  // Raw ChefService ids — see IChef/IChefProfile for the populated
  // {id, name} form returned by the chef-detail endpoint.
  servicesOffered?: string[];

  availability?: IChefAvailability[];

  isPasswordUpdated?: boolean;

  certifications?: string[];
}

export interface IUser {
  id: string;

  userType: UserType;

  fullName: string;
  firstName: string;
  email: string;
  phoneNumber?: string;

  gender?: Gender;
  dob?: string;
  profilePic?: string;

  maritalStatus?: MaritalStatus;
  address?: IUserAddress;
  kyc?: IUserKyc;
  nok?: IUserNok;

  isActive: boolean;
  isEmailVerified: boolean;

  adminDetails?: IAdminDetails;
  chefDetails?: IChefDetails;
  customerDetails?: ICustomerDetails;

  createdAt: string;
  updatedAt: string;
}
