import api from "./apiConfig";

export interface IChefLevelOption {
  id: string;
  name: string;
}

// GET /chef/levels — the raw Category list used as chef categories/levels,
// independent of any particular service's pricing (see chefLevel.controller.ts).
export const getChefLevels = async (): Promise<IChefLevelOption[]> => {
  const res = await api.get("/chef/levels");
  return res?.data?.payload || [];
};

export interface IGetChefServicesParams {
  chefId?: string;
  isAvailable?: boolean;
  limit?: number;
  page?: number;
}

export interface IChefServiceItem {
  id: string;
  chefId: {
    id?: string;
    name?: string;
    profilePic?: string;
    state?: string;
    location?: string;
  } | null;
  serviceId: {
    id?: string;
    name?: string;
    description?: string;
    icon?: string;
    workflow?: string;
    bookingType?: string;
    supportsProcurement?: boolean;
  };
  name: string;
  description?: string;
  icon?: string;
  workflow?: string;
  bookingType?: string;
  supportsProcurement?: boolean;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const getChefs = async (categoryId?: string, location?: string, state?: string, name?: string, limit:number = 50) => {
  const filter = `${categoryId ? `?categoryId=${categoryId}` : ""}${location ? `${categoryId ? "&" : "?"}location=${location}` : ""}${state ? `${categoryId || location ? "&" : "?"}state=${state}` : ""}${name ? `${categoryId || location || state ? "&" : "?"}name=${name}` : ""}${limit ? `${categoryId || location || state || name ? "&" : "?"}limit=${limit}` : ""}`;
  const res = await api.get(`/chefs${filter}`);
  return res?.data?.payload || [];
};

export const getChefsWithChefCategory = async (categoryId: string,limit = 20, page = 1) => {
  const res = await api.get(`/chefs?category=${categoryId}&limit=${limit}&page=${page}`);
  const payload = res?.data?.payload || [];

  // Chefs are now `User` documents (userType: "Chef") — chef-specific fields
  // live under `chefDetails`, address under `address`, and the chef's category
  // is the populated `chefDetails.chefLevel` (not a top-level `category`).
  const formated = payload.map((item: any) => {
    const chefDetails = item.chefDetails || {};
    const chefLevel = chefDetails.chefLevel || {};
    const specialties = chefDetails.specialties || [];

    return {
      id: item.id,
      name: item.fullName,
      staffId: chefDetails.staffId,
      chefCatId: chefLevel.id || chefLevel._id || "",
      chefCatName: chefLevel.name || "",
      gender: item.gender,
      email: item.email,
      phone: item.phoneNumber,
      description: [
        chefDetails.yearsOfExperience ? `${chefDetails.yearsOfExperience} years of experience` : "",
        specialties.length ? specialties.join(", ") : "",
      ].filter(Boolean).join(" | "),
      specialties,
      location: item.address?.city,
      state: item.address?.stateName,
      profilePic: item.profilePic,
      yearsOfExperience: chefDetails.yearsOfExperience,
      rating: chefDetails.rating,
    }
  })
  return formated
};

export const getChefServices = async ({
  chefId,
  isAvailable,
  limit = 20,
  page = 1,
}: IGetChefServicesParams): Promise<IChefServiceItem[]> => {
  const params = new URLSearchParams();

  if (chefId) params.append("chefId", chefId);
  if (typeof isAvailable === "boolean") params.append("isAvailable", String(isAvailable));
  params.append("limit", String(limit));
  params.append("page", String(page));

  const res = await api.get(`/chefServices?${params.toString()}`);
  const payload = res?.data?.payload || [];

  const formatted = payload
    .filter((item: any) => item?.serviceId && (item?.serviceId?._id || item?.serviceId?.id || item?.serviceId?.name))
    .map((item: any) => ({
      id: item?._id || item?.id,
      chefId: item?.chefId
        ? {
            id: item?.chefId?._id || item?.chefId?.id,
            name: item?.chefId?.name,
            profilePic: item?.chefId?.profilePic,
            state: item?.chefId?.state,
            location: item?.chefId?.location,
          }
        : null,
      serviceId: {
        id: item?.serviceId?._id || item?.serviceId?.id,
        name: item?.serviceId?.name || "Unnamed service",
        description: item?.serviceId?.description || "",
        icon: item?.serviceId?.icon,
        workflow: item?.serviceId?.workflow,
        bookingType: item?.serviceId?.bookingType,
        supportsProcurement: Boolean(item?.serviceId?.supportsProcurement),
      },
      name: item?.serviceId?.name || "Unnamed service",
      description: item?.serviceId?.description || "",
      icon: item?.serviceId?.icon,
      workflow: item?.serviceId?.workflow,
      bookingType: item?.serviceId?.bookingType,
      supportsProcurement: Boolean(item?.serviceId?.supportsProcurement),
      isAvailable: Boolean(item?.isAvailable),
      createdAt: item?.createdAt,
      updatedAt: item?.updatedAt,
    }));

  return formatted;
};
