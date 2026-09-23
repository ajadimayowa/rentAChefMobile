import { s } from "react-native-size-matters";
import api from "./apiConfig";

export interface TermsAndConItem {
  id: string;
  description: string;
  termsUrl?: string;
  serviceId?: string;
  serviceName?: string;
}

const normalizeRef = (value: any): { id?: string; name?: string } => {
  if (!value) return {};

  if (typeof value === "object") {
    return {
      id: value?.id || value?._id,
      name: value?.name,
    };
  }

  return { id: String(value) };
};

interface GetTermsAndConsParams {
  serviceId?: string;
  specialMenuId?: string;
  page?: number;
  limit?: number;
}

export const getTermsAndCons = async ({
  serviceId,
  specialMenuId,
  page = 1,
  limit = 20,
}: GetTermsAndConsParams = {}) => {
  const params = new URLSearchParams();

  if (serviceId) {
    params.append("serviceId", serviceId);
  }

  if (specialMenuId) {
    params.append("specialMenuId", specialMenuId);
  }

  params.append("page", String(page));
  params.append("limit", String(limit));

  const endpoint = `/terms-and-con/records?${params.toString()}`;
  const res = await api.get(endpoint);
//   console.log("API response for terms and cons:", res.data);

  const payload = res?.data?.payload || [];
  return payload
};

export const getServiceCatTermsAndCons = async (serviceCatId: string) => {
  const endpoint = `/terms-and-con/records?categoryId=${serviceCatId}`;
  const res = await api.get(endpoint);
//   console.log("API response for terms and cons:", res.data);

  const payload = res?.data?.payload || [];

  return payload
};
