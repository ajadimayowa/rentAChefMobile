import api from "./apiConfig";

interface GetMenusParams {
  chefId?: string;
  packageId?: string;
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


export const getSpecialMenus = async () => {
  const res = await api.get("/specialmenu/menus");
  return res?.data?.payload || [];
};




export const getChefMenus = async (chefId: string) => {
  const res = await api.get(`/menu/getMenus?chefId=${chefId}`);
  return res?.data|| [];
};

export const getMenuTypes = async ({
  packageId,
  search,
  sortBy,
  sortOrder,
  limit = 20,
  page = 1,
}: GetMenusParams = {}) => {
  const params = new URLSearchParams();

  if (packageId) params.append("packageId", packageId);

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

  const res = await api.get(`/menu-types?${params.toString()}`);

  return {
    data: res.data
  };
};

