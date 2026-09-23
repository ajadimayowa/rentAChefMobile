import { IServicePricingResponse } from "@/interfaces/service-pricing";
import api from "./apiConfig";


export const getServicePricing = async (serviceId: string,limit = 20, page = 1) => {
  const res = await api.get(`/servicePricings?serviceId=${serviceId}&limit=${limit}&page=${page}`);
  const formated = res?.data?.data.map((item: any) => {
    return{
      name: item.chefCategoryId.name,
      chefCatId: item.chefCategoryId.id,
      id: item.id,
      value: item.basePriceMinor,
      description: item.chefCategoryId.description,
    }
  })
  return formated
};

export const getResidentialServicePricing = async (
  serviceId: string,
  limit = 20,
  page = 1
) => {
  const res = await api.get(
    `/servicePricings?serviceId=${serviceId}&pricingType=daybased&limit=${limit}&page=${page}`
  );

  console.log(
    "Rendering getServicePricing with serviceId:",
    res?.data?.data
  );

  const formatted = res?.data?.data?.map((item: any) => ({
    id: item.id,
    chefCatName: item.chefCategoryId?.name,
    chefCatId: item.chefCategoryId?.id,
    monthlySubFee: item.monthlySubFee,
    numberOfDays: item.numberOfDays,
    basePriceMinor: item.basePriceMinor,
    chefCatDesc: item.chefCategoryId?.description,
    chefCatTasks: item.chefCategoryId?.tasks,
  }));

  return formatted;
};

export const getSpecialServicePricing = async (specialServiceId: string,limit = 20, page = 1) => {
  const res = await api.get(`/servicePricings?specialServiceId=${specialServiceId}&limit=${limit}&page=${page}`);
  const formated = res?.data?.data.map((item: any) => {
    return{
      name: item.chefCategoryId.name,
      chefCatId: item.chefCategoryId.id,
      id: item.id,
      value: item.basePriceMinor,
      description: item.chefCategoryId.description,
    }
  })
  return formated
};

export const getServiceCategoryPricing = async (serviceCategoryId: string,limit = 20, page = 1) => {
  const res = await api.get(`/servicePricings?serviceCategoryId=${serviceCategoryId}&limit=${limit}&page=${page}`);
  const formated = res?.data?.data.map((item: any) => {
    return{
      name: item.chefCategoryId.name,
      chefCatId: item.chefCategoryId.id,
      id: item.id,
      value: item.basePriceMinor,
      description: item.chefCategoryId.description,
    }
  })
  return formated
};

