export interface IMenuItem {
    name: string;
    price: number;
    menuPic?: string;
    description?: string;
}


export interface IMenu {
    id:string,
    chef: {
        "name": string,
        "email": string,
        "id": string,
    },
    title: string;
    image:string;
    menuPic: string;
    items: IMenuItem[];
    basePrice:number;
    createdAt: Date;
    description:string;
}

export interface ISpecialMenu {
  id: string;
  title: string;
  description: string;
  minimumGuests: number;
  numberOfDishes: number;
  image: string;
  price: number;
  procurements: any[]; // you can replace `any` with a proper type if you know the structure
  createdAt: string; // or Date if you parse it
  updatedAt: string; // or Date if you parse it
}


export interface IChef {
  id: string;
  name: string;
  email: string;
}

export interface IService {
  id: string;
  name: string;
}

export interface IGroceryItem {
  item: string;
  quantity: string;
  price: number;
}

export interface IMealPlan {
  title: string;
  groceryList: IGroceryItem[];
  ingredientTotal: number;
}

export interface IUpdatedChefMenu {
  id: string;
  chefId: IChef;
  serviceId: IService;
  title: string;
  description: string;
  breakfast: IMealPlan;
  lunch: IMealPlan;
  dinner: IMealPlan;
  grandTotal: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IMenuUpdated {
  id: string;
  menuCreatorType: "chef" | "organization";
  title: string;
  description: string;
  isSignatureMenu: boolean;
  menuType: "breakfast" | "lunch" | "dinner";
  samplePicture: string;
  menuCategory: IMenuCategory[];
  pricePerHead: number;
  chefId: IChef;
  packages: any[]; // Replace with IPackage[] when package model is available
  totalGroceryCost: number;
  groceries: IGrocery[];
  createdAt: string;
  updatedAt: string;
  menuClass: string;
  pricingModel: "perhead" | "fixed";
}

export interface IMenuCategory {
  id: string;
  title: string;
  description: string;
  packageId: string;
}

export interface IChef {
  id: string;
  staffId: string;
  name: string;
  gender: "m" | "f";
  email: string;
  bio: string;
  specialties: string[];
  category: string;
  phoneNumber: number;
  location: string;
  state: string;
  stateId: number;
  profilePic: string;

  servicesOffered: any[];
  experienceYears: number;
  certifications: any[];
  menus: any[];
  availability: any[];

  password: string | null;
  isPasswordUpdated: boolean;
  isActive: boolean;
  yearsOfExperience: number;
  rating: number;

  createdAt: string;
  updatedAt: string;
}

export interface IGrocery {
  id?: string;
  groceryName: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  totalPrice?: number;
}