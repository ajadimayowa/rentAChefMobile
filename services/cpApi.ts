import api from './apiConfig';

export type CPWorkflowCode =
  | 'ALASE_SERVICE'
  | 'DAILY_CHEF'
  | 'DATE_NIGHT'
  | 'DINNER_PARTY'
  | 'EVENT_CATERING'
  | 'STORAGE_PACKAGE'
  | 'HOME_CHEF'
  | 'RESIDENTIAL_CHEF'
  | 'EVENT_CHEF';
export type CPChefLevel = 'JUNIOR' | 'SENIOR' | 'EXECUTIVE';
export type CPPaymentModel = 'Paystack' | 'Transfer' | 'Unpaid';

export interface CPCreateBookingInput {
  customerId: string;
  serviceId: string;
  specialMenuId?:string;
  serviceCategoryId: string;
  categoryId?: string;
  workflow: CPWorkflowCode | string;
  chefLevel?: CPChefLevel;
  bookingType?: 'instant' | 'quotation';
  modeOfPayment?: CPPaymentModel;
  transactnRef?: string;
  bookingData: Record<string, unknown> & { modeOfPayment?: CPPaymentModel };
}



export const cpApi = {
//   async getWorkflows() {
//     const res = await api.get('/workflows');
//     return res?.data?.data || [];
//   },

  async createBooking(payload: CPCreateBookingInput) {
   

    const requestPayload = {
      customerId: payload.customerId,
      serviceId: payload.serviceId,
      serviceCategoryId: payload.serviceCategoryId || payload.categoryId || '',
      transactnRef: (payload.transactnRef || payload.bookingData?.transactnRef || payload.bookingData?.paymentReference || payload.bookingData?.paymentRef || payload.bookingData?.trxref || payload.bookingData?.reference) as string | undefined,
      workflow: payload.workflow,
      modeOfPayment: payload.modeOfPayment || payload.bookingData?.paymentMethod || payload.bookingData?.payment_model || payload.bookingData?.payment_model_type || payload.bookingData?.payment_type || payload.bookingData?.payment_method || payload.bookingData?.payment_method_type || payload.bookingData?.payment_method_name || payload.bookingData?.payment_method_code || payload.bookingData?.payment_method_id || payload.bookingData?.payment_method_key || payload.bookingData?.payment_method_value || payload.bookingData?.payment_method_label || payload.bookingData?.payment_method_description || payload.bookingData?.payment_method_title || payload.bookingData?.payment_method_subtitle || payload.bookingData?.payment_method_text || payload.bookingData?.payment_method_html || payload.bookingData?.payment_method_json || payload.bookingData?.payment_method_xml || payload.bookingData?.payment_method_yaml || payload.bookingData?.payment_method_ini || payload.bookingData?.payment_method_conf || payload.bookingData?.payment_method_cfg || payload.bookingData?.payment_method_properties || payload.bookingData?.payment_method_settings || payload.bookingData?.payment_method_options || payload.bookingData?.payment_method_params || payload.bookingData?.payment_method_arguments || payload.bookingData?.payment_method_flags || payload.bookingData?.payment_method_attributes || payload.bookingData?.payment_method_values || payload.bookingData?.payment_method_data || payload.bookingData?.payment_method_info || payload.bookingData?.payment_model_type,
      ...(payload.chefLevel ? { chefLevel: payload.chefLevel } : {}),
      bookingData: {
        ...(payload.bookingData || {}),
      },
    };

    console.log(`sending booking creation request payload:`, requestPayload);

    const res = await api.post('/bookings', requestPayload);
    console.log(`received booking creation response:`, res?.data?.data);
    return res?.data?.data;
  },

  async listBookings(customerId?: string) {
    const query = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
    const res = await api.get(`/bookings${query}`);
    return res?.data?.data || [];
  },

  async initializeInstantPayment(payload: { bookingId: string; customerId: string; customerEmail: string }) {
    const res = await api.post('/payments/instant/init', payload);
    return res?.data?.data;
  },
};
