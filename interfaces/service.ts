// Mirrors rentAChefBackend/src/models/Service.ts, ServiceCategoryModel.ts and
// ChefService.ts, adapted for JSON responses.

export type ChefLevelCode =
  | "sous"
  | "executive"
  | "junior"
  | "senior"
  | "pro"
  | "head";

export type ServiceBookingType = "instant" | "quotation";

// -------------------- SERVICE CATEGORY --------------------
export interface IServiceCategory {
  id: string;
  code?: string;
  name: string;
  description?: string;
  slug?: string;
  sortOrder?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// -------------------- SERVICE --------------------
export interface IService {
  id: string;

  // Populated object when `categoryId` is populated, otherwise the raw id.
  categoryId: IServiceCategory | string;

  code?: string;
  name: string;
  description?: string;
  icon?: string;
  workflow?: string;

  supportsChefMenu?: boolean;
  supportsCustomerMenuUpload?: boolean;
  supportsProcurement?: boolean;

  allowedChefLevels?: ChefLevelCode[];
  bookingType?: ServiceBookingType;

  isActive: boolean;
  active?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

// -------------------- CHEF <-> SERVICE ASSIGNMENT --------------------
export interface IChefServiceChefRef {
  id: string;
  fullName?: string;
  profilePic?: string;
}

export interface IChefService {
  id: string;

  // Populated when the chefId/serviceId refs are populated, otherwise the raw id.
  chefId: IChefServiceChefRef | string;
  serviceId: IService | string;

  isAvailable: boolean;

  createdAt?: string;
  updatedAt?: string;
}
