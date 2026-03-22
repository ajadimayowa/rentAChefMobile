export interface IChef {
  chef: Chef;
  totalChefBooking: number;
  totalCompletedBooking: number;
  totalUpcoming: number;
  getTheChefMenu: ChefMenu[];
  servicesOffered: ServiceOffered[];
}

// -------------------- CHEF --------------------
export interface Chef {
  id: string;
  staffId: string;
  name: string;
  gender: string;
  email: string;
  bio: string;
  specialties: string[];
  category: Category;
  phoneNumber: number;
  location: string;
  state: string;
  stateId: number;
  profilePic: string;
  menus: any[]; // refine if structure is known
  isPasswordUpdated: boolean;
  isActive: boolean;
  yearsOfExperience: number;
  rating: number;
  createdAt: string; // or Date
  updatedAt: string; // or Date
}

export interface Category {
  id: string;
  name: string;
}

// -------------------- MENU --------------------
export interface ChefMenu {
  _id: string;
  chefId: string;
  month: string;
  weeks: Week[];
  menuPic: string;
  createdBy: string;
  approved: boolean;
  procurement: any[]; // refine if needed
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Week {
  weekNumber: number;
  days: DayMenu[];
}

export interface DayMenu {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

// -------------------- SERVICES --------------------
export interface ServiceOffered {
  id: string;
  name: string;
}




export interface IChefList {
  id: string;
  staffId: string;
  name: string;
  gender: string; // you can narrow to "m" | "f" if needed
  email: string;
  bio: string;
  specialties: string[];
  category: ListCategory;
  phoneNumber: number;
  location: string;
  state: string;
  stateId: number;
  profilePic: string;
  menus: any[]; // refine when structure is known
  isPasswordUpdated: boolean;
  isActive: boolean;
  yearsOfExperience: number;
  rating: number;
  createdAt: string; // or Date
  updatedAt: string; // or Date
}

export interface ListCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  services: any[]; // refine if you know the structure
  createdAt: string;
  updatedAt: string;
  slug: string;
}