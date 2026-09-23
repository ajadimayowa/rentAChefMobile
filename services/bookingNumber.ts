import api from "./apiConfig";

export interface CreateAssignedBookingNumberPayload {
	serviceId: string;
	customerId: string;
	bookingId?: string;
}

export interface AssignedBookingNumberRecord {
	id: string;
	assignedNumber: number;
	serviceId: string;
	customerId: string;
	bookingId?: string;
	createdAt?: string;
	updatedAt?: string;
}

export const createBookingNumberWaitTime = async (
	payload: CreateAssignedBookingNumberPayload
) => {
	const response = await api.post("/assigned-booking-number", payload);
	return response?.data?.data as AssignedBookingNumberRecord;
};
