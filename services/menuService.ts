import api from "./apiConfig";

interface GetMenusParams {
  chefId?: string;
  packageId?: string;
  menuClass?: "nigerian" | "continental";
  pricingModel?: "perhead" | "plater";
  isSignatureMenu?: boolean;
  hasGroceries?: boolean;
  menuCreatorType?: "chef" | "organization";
  menuType?: "breakfast" | "lunch" | "dinner";
  menuCategory?: "appetizer" | "maindish" | "sides";
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "title" | "pricePerHead" | "totalGroceryCost";
  sortOrder?: "asc" | "desc";
  limit?: number;
  page?: number;
}

type GetMenusInput = string | GetMenusParams;

interface GetSpecialMenusParams {
  name?: string;
  search?: string;
  q?: string;
  limit?: number;
  page?: number;
}

interface SpecialMenusMeta {
  total: number;
  limit: number;
  page: number;
  totalPages: number;
}


export const getSpecialMenus = async ({
  name,
  search,
  q,
  limit = 10,
  page = 1,
}: GetSpecialMenusParams = {}) => {
  const params = new URLSearchParams();

  if (name) {
    params.append("name", name);
  } else if (search) {
    params.append("search", search);
  } else if (q) {
    params.append("q", q);
  }

  params.append("limit", String(limit));
  params.append("page", String(page));

  const res = await api.get(`/specialmenu/menus?${params.toString()}`);

  return {
    data: res?.data?.payload || res?.data?.data || [],
    meta: (res?.data?.meta || {
      total: 0,
      limit,
      page,
      totalPages: 0,
    }) as SpecialMenusMeta,
  };
};




export const getChefMenu = async (chefId: string) => {
  const res = await api.get(`/menu/getMenus?chefId=${chefId}`);
  return res?.data|| [];
};

export const getMenus = async (input: GetMenusInput = {}) => {
  const {
    chefId,
    packageId,
    menuClass,
    pricingModel,
    isSignatureMenu,
    hasGroceries,
    menuCreatorType,
    menuType,
    menuCategory,
    search,
    sortBy,
    sortOrder,
    limit = 20,
    page = 1,
  } = typeof input === "string" ? { chefId: input } : input;

  const params = new URLSearchParams();

  if (chefId) params.append("chefId", chefId);

  if (packageId) params.append("packageId", packageId);

  if (menuClass) {
    params.append("menuClass", menuClass);
  }

  if (pricingModel) {
    params.append("pricingModel", pricingModel);
  }

  if (isSignatureMenu !== undefined) {
    params.append("isSignatureMenu", String(isSignatureMenu));
  }

  if (hasGroceries !== undefined) {
    params.append("hasGroceries", String(hasGroceries));
  }

  if (menuCreatorType) {
    params.append("menuCreatorType", menuCreatorType);
  }

  if (menuType) {
    params.append("menuType", menuType);
  }

  if (menuCategory) {
    params.append("menuCategory", menuCategory);
  }

  if (search) {
    params.append("search", search);
  }

  if (sortBy) {
    params.append("sortBy", sortBy);
  }

  if (sortOrder) {
    params.append("sortOrder", sortOrder);
  }

  params.append("limit", String(limit));
  params.append("page", String(page));

  const res = await api.get(`/menus?${params.toString()}`);

  return {
    data: res.data
  };
};

