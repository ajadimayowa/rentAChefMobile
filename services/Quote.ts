import api from "./apiConfig";

export type QuoteStatus = "PENDING" | "RESPONDED" | "CLOSED";

export interface QuoteUser {
	id?: string;
	_id?: string;
	fullName?: string;
	firstName?: string;
	email?: string;
	phone?: string;
}

export interface QuoteAdminResponse {
	message: string;
	respondedBy?: QuoteUser;
	respondedAt?: string;
}

export interface QuotePayload {
	id?: string;
	_id?: string;
	title: string;
	description: string;
	customerId?: string | QuoteUser;
	status?: QuoteStatus;
	adminResponse?: QuoteAdminResponse;
	createdAt?: string;
	updatedAt?: string;
}

export interface QuoteMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface GetQuotesParams {
	page?: number;
	limit?: number;
	status?: QuoteStatus;
	customerId?: string;
}

export interface CreateQuoteInput {
	title: string;
	description: string;
}

export interface UpdateQuoteInput {
	title?: string;
	description?: string;
	status?: QuoteStatus;
	adminResponse?: {
		message: string;
	};
	responseMessage?: string;
}

export interface ReplyToQuoteInput {
	message: string;
}

export const createQuote = async (payload: CreateQuoteInput) => {
	const res = await api.post(`/quote/create`, payload);
	return res?.data?.payload || null;
};

export const getQuotes = async ({
	page = 1,
	limit = 10,
	status,
	customerId,
}: GetQuotesParams = {}) => {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	if (status) {
		params.append("status", status);
	}

	if (customerId) {
		params.append("customerId", customerId);
	}

	const res = await api.get(`/quotes?${params.toString()}`);

	return {
		data: (res?.data?.payload || []) as QuotePayload[],
		meta: (res?.data?.meta || {
			total: 0,
			page,
			limit,
			totalPages: 0,
		}) as QuoteMeta,
	};
};

export const getQuoteById = async (quoteId: string) => {
	const res = await api.get(`/quote/${quoteId}`);
	return (res?.data?.payload || null) as QuotePayload | null;
};

export const updateQuote = async (quoteId: string, payload: UpdateQuoteInput) => {
	const res = await api.put(`/quote/${quoteId}`, payload);
	return (res?.data?.payload || null) as QuotePayload | null;
};

export const replyToQuote = async (quoteId: string, payload: ReplyToQuoteInput) => {
	const res = await api.patch(`/quote/${quoteId}/reply`, payload);
	return (res?.data?.payload || null) as QuotePayload | null;
};

export const deleteQuote = async (quoteId: string) => {
	const res = await api.delete(`/quote/${quoteId}`);
	return {
		success: Boolean(res?.data?.success),
		message: res?.data?.message || "Quote deleted successfully",
	};
};
