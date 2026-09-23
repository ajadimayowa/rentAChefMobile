import api from "../apiConfig";

/**
 * ============================================================
 * SHARED TYPES
 * ============================================================
 */

export interface IApiEnvelope<T = any> {
  success: boolean;
  message?: string;
  payload?: T;
}

/**
 * ============================================================
 * REGISTER (SIGNUP)
 * ============================================================
 */

export interface IRegisterPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface IRegisterResult {
  id: string;
  email: string;
  fullName: string;
  userType: string;
}

export const registerCustomer = async (
  payload: IRegisterPayload
): Promise<IApiEnvelope<IRegisterResult>> => {
  const res = await api.post("/auth/register", payload);
  return res.data;
};

/**
 * ============================================================
 * VERIFY EMAIL OTP (post-registration)
 * ============================================================
 */

export interface IVerifyEmailOtpPayload {
  email: string;
  otp: string;
}

export const verifyEmailOtp = async (
  payload: IVerifyEmailOtpPayload
): Promise<IApiEnvelope> => {
  const res = await api.post("/auth/verify-email", payload);
  return res.data;
};

/**
 * ============================================================
 * LOGIN
 * ============================================================
 */

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface ILoginOtpResult {
  email: string;
  expiresAt: string;
}

export const login = async (
  payload: ILoginPayload
): Promise<IApiEnvelope<ILoginOtpResult>> => {
  const res = await api.post("/auth/login", payload);
  return res.data;
};

/**
 * ============================================================
 * VERIFY LOGIN OTP
 * ============================================================
 */

export interface IVerifyLoginOtpPayload {
  email: string;
  otp: string;
}

export interface IVerifyLoginOtpResult extends IApiEnvelope {
  token: string;
}

export const verifyLoginOtp = async (
  payload: IVerifyLoginOtpPayload
): Promise<IVerifyLoginOtpResult> => {
  const res = await api.post("/auth/verify-loginOtp", payload);
  return res.data;
};

/**
 * ============================================================
 * PASSWORD RESET
 * ============================================================
 */

export interface IRequestPasswordResetOtpPayload {
  email: string;
}

export const requestPasswordResetOtp = async (
  payload: IRequestPasswordResetOtpPayload
): Promise<IApiEnvelope> => {
  const res = await api.post("/auth/request-password-reset-otp", payload);
  return res.data;
};

export const resendPasswordResetOtp = async (
  payload: IRequestPasswordResetOtpPayload
): Promise<IApiEnvelope> => {
  const res = await api.post("/auth/resend-password-reset-otp", payload);
  return res.data;
};

export interface IResetPasswordWithOtpPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export const resetPasswordWithOtp = async (
  payload: IResetPasswordWithOtpPayload
): Promise<IApiEnvelope> => {
  const res = await api.post("/auth/reset-password-with-otp", payload);
  return res.data;
};
