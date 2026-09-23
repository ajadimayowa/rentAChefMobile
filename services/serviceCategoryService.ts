import api from "./apiConfig";

export const getServiceCategories = async () => {
  const res = await api.get("/service-category/categories");
  return res?.data?.payload || res?.data?.data || [];
};

export const getServiceCategoryById = async (categoryId: string) => {
  const res = await api.get(`/service-category/${categoryId}`);
  return res?.data?.data;
};
