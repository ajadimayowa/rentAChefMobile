// Mirrors rentAChefBackend/src/models/Booking.ts (IBooking), adapted for JSON
// responses. Status/payment enums mirror
// rentAChefBackend/src/platform/domain/enums.ts, which is the enum this
// booking model is kept in sync with.

import { IUser } from "./user";
import { IService } from "./service";

export type BookingStatus =
  | "Submitted"
  | "Admin Reviewed"
  | "Quotation Sent"
  | "Payment Pending"
  | "Paid"
  | "Chef Assigned"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export type PaymentStatus = "Unpaid" | "Pending" | "Paid" | "Failed" | "Refunded";

export type BookingType = "INSTANT" | "QUOTATION";

export type ModeOfPayment = "Paystack" | "Transfer" | "Cash" | "Unpaid";

export type MenuSelectionType = "CHEF_MENU" | "CUSTOMER_UPLOAD";

export interface IMenuSelection {
  source: "chef" | "customer";
  chefMenuId?: string;
  uploadedMenuUrl?: string;
  uploadedMenuType?: "pdf" | "docx" | "jpg" | "png";
}

export interface IProcurement {
  option: "customer" | "chef";
  estimatedCost?: number;
  finalCost?: number;
  procurementFee?: number;
}

export interface IBookingTimelineEntry {
  status: BookingStatus;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface IBookingComment {
  text: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
}

export interface IBookingPaymentDetails {
  mode: "Cash" | "Transfer";
  transactionRef: string;
  bankName?: string;
  accountNumber?: string;
  amount: number;
  date: string;
  recordedBy: string;
  recordedAt: string;
}

export interface IBookingPricingSnapshot {
  baseChefFeeMinor: number;
  estimatedTotalMinor: number;
  currency: string;
}

export interface IBooking {
  id: string;
  bookingNumber: string;

  // Populated when the customerId/chefId/serviceId refs are populated, otherwise the raw id.
  customerId: IUser | string;
  chefId?: IUser | string;
  serviceId?: IService | string;

  specialServiceId?: string;
  chefCategory?: string;
  workflow?: string;

  termsAccepted: boolean;

  bookingType?: BookingType;
  modeOfPayment?: ModeOfPayment;

  status: BookingStatus;
  paymentStatus: PaymentStatus;

  startDate?: string;
  endDate?: string;

  bookingData: Record<string, any>;
  pricingSnapshot?: IBookingPricingSnapshot;
  timeline?: IBookingTimelineEntry[];

  menuSelection?: IMenuSelection;
  menuSelectionType?: MenuSelectionType;
  chefMenuId?: string;
  customerUploadedMenuFileId?: string;

  procurement?: IProcurement;
  comments?: IBookingComment[];
  paymentDetails?: IBookingPaymentDetails;

  quotationId?: string;
  transactnRef?: string;

  createdAt: string;
  updatedAt: string;
}
