export interface IServiceReference {
  id: string;
  name: string;
}

export interface IChefCategoryReference {
  id: string;
  name: string;
  slug: string;
}

export interface IServicePricingOption {
  _id: string;
  name: string;
  price: number;
  description: string;
}

export interface IServicePricing {
  id: string;
  isActive: boolean;

  serviceId: IServiceReference | null;
  chefCategoryId: IChefCategoryReference;

  currency: string;

  // Some records use basePriceMinor, others use price
  basePriceMinor?: number;
  price?: number;

  servicePricingOptions: IServicePricingOption[];

  effectiveFrom: string;
  effectiveTo?: string;

  createdAt: string;
  updatedAt: string;
}

export interface IServicePricingResponse {
  data: IServicePricing[];
}