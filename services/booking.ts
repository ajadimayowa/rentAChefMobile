import api from "./apiConfig";

export const getBookings = async (customerId: string, status: string = "ongoing", limit = 50, page = 1) => {
  const params = new URLSearchParams({
    customerId,
    status,
    limit: String(limit),
    page: String(page),
  });
  const res = await api.get(`/bookings?${params.toString()}`);

  return res?.data
};

export const getBookingDetail = async (bookingId: string) => {
  try {
    const response = await api.get(`/bookings?bookingNumber=${bookingId}`);
    return response?.data?.data;
  } catch (error) {
    console.error("Error fetching booking details:", error);
    throw error;
  }
};

export const updateBooking = async (bookingId: string, updatedData: any) => {
  try {
    const response = await api.put(`/bookings/${bookingId}`, updatedData);
    return response?.data?.data;
  } catch (error) {
    console.error("Error updating booking:", error);
    throw error;
  }
}



export const getSpecialServiceBookingSummary = async (bookingId: string) => {
  try {
    const response = await api.get(`/bookings/${bookingId}/special-service-summary`);
    return response?.data?.data;
  } catch (error) {
    console.error("Error fetching special service booking summary:", error);
    throw error;
  }
};

