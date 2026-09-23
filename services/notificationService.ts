import api from "./apiConfig";

export const getNotifications = async (userId: string) => {
  const res = await api.get(`/notifications?userId=${userId}`);
  return res?.data?.payload || [];
};
