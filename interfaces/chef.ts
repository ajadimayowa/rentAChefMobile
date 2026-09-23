// A "chef" is a `User` document with `userType: "Chef"` — see
// rentAChefBackend/src/models/User.model.ts. IChef narrows IUser to that case.
// IChefProfile mirrors the payload of GET /chef/:id
// (rentAChefBackend/src/controllers/chef.controller.ts -> getChefById).

import { IChefDetails, IUser } from "./user";

export interface IChef extends IUser {
  userType: "Chef";
  chefDetails: IChefDetails;
}

// GET /chef/:id resolves servicesOffered via the ChefService collection and
// returns it populated as {id, name}, separate from the raw
// chefDetails.servicesOffered id list on IChef.
export interface IChefServiceOffered {
  id: string;
  name: string;
}

// GET /chef/:id fetches the chef's last 3 menus with `.lean()`, so these come
// back with a raw `_id` rather than the `id` the toJSON transform would add.
export interface IChefMenuSummary {
  _id: string;
  title: string;
  description?: string;
  menuType?: "breakfast" | "lunch" | "dinner";
  menuClass?: "nigerian" | "continental";
  pricingModel?: "perhead" | "plater";
  pricePerHead?: number;
  isSignatureMenu?: boolean;
  samplePicture?: string | null;
  totalGroceryCost?: number;
  chefId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IChefProfile {
  chef: IChef;
  totalChefBooking: number;
  totalCompletedBooking: number;
  totalUpcoming: number;
  getTheChefMenu: IChefMenuSummary[];
  servicesOffered: IChefServiceOffered[];
}
