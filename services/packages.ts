import { IServicePricingResponse } from "@/interfaces/service-pricing";
import api from "./apiConfig";


// export const getPackages = async (serviceId: string,limit = 20, page = 1) => {
//   // const res = await api.get(`/servicePricings?serviceId=${serviceId}&limit=${limit}&page=${page}`);
//   const res = await api.get(`/packages`);
//   const formated = res?.data?.data.map((item: any) => {
//     return{
//       name: item.title,
//       description: item.description,
//       id: item.id,
//       displayPicture: item.packageImage
//     }
//   })
//   return formated
// };

export const getPackages = async () => {
  // const res = await api.get(`/servicePricings?serviceId=${serviceId}&limit=${limit}&page=${page}`);
  const res = await api.get(`/packages`);
  const formated = res?.data?.data.map((item: any) => {
    return{
      name: item.title,
      description: item.description,
      id: item.id,
      value:item.id,
      displayPicture: item.packageImage
    }
  })
  return formated
};

