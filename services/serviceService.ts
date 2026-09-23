import api from "./apiConfig";

export interface ServicePayload {
  id: string;
  name: string;
  description?: string;
  workflow?: string;
  bookingType?: string;
  icon?: string;
  category?: {
    id?: string;
    name?: string;
    slug?: string;
  };
}

const normalizeService = (service: any): ServicePayload => {
  const category = service?.categoryId;

  return {
    ...service,
    categoryId:
      typeof category === "object" && category !== null
        ? category?.id || category?._id || ""
        : String(category || ""),
    category:
      typeof category === "object" && category !== null
        ? {
            id: category?.id || category?._id,
            name: category?.name,
            slug: category?.slug,
          }
        : undefined,
    workflow: String(service?.workflow || ""),
    icon: String(service?.icon || "restaurant"),
  };
};

export const getServicesByCategory = async (serviceCategoryId: string, limit = 50, page = 1) => {
  const params = new URLSearchParams({
    categoryId: serviceCategoryId,
    limit: String(limit),
    page: String(page),
  });
  const res = await api.get(`/service/services?${params.toString()}`);

  const services = res?.data?.payload || res?.data?.data || [];

  return Array.isArray(services)
    ? services.map((service: any) => normalizeService(service))
    : [];
};

export const getServiceById = async (serviceId: string) => {
  const res = await api.get(`/service/${serviceId}`);
  const payload = res?.data?.payload || res?.data?.data;

  if (!payload) {
    return null;
  }

  return payload;
};

export const getSpecialServiceById = async (specialServiceId: string) => {
  const res = await api.get(`/specialmenu/${specialServiceId}`);
  const payload = res?.data?.payload || res?.data?.data;

  if (!payload) {
    return null;
  }

  return payload;
};

export const getServiceCategoryById = async (serviceCategoryId: string) => {
  const res = await api.get(`/service-category/categories/${serviceCategoryId}`);
  const payload = res?.data?.payload || res?.data?.data;

  if (!payload) {
    return null;
  }

  return payload;
};
