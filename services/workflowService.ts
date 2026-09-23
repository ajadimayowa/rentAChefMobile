import api from "./apiConfig";

export interface WorkflowStartPayload {
  serviceId?: string;
  serviceCategoryId?: string;
  userId?: string;
}

export interface WorkflowStepPayload {
  id: string;
  stepKey: string;
  title: string;
  description?: string;
  type: string;
  config?: Record<string, any>;
  data?: any;
  response?: any;
}

export interface WorkflowSessionPayload {
  id: string;
  status: string;
  currentStepId?: string;
}

export const startWorkflow = async (payload: WorkflowStartPayload) => {
  const res = await api.post("/booking-workflows/start", payload);
  return res?.data?.data;
};

export const getCurrentStep = async (sessionId: string) => {
  const res = await api.get(`/booking-workflows/${sessionId}/step`);
  return res?.data?.data;
};

export const submitStep = async (sessionId: string, stepId: string, response: Record<string, any>) => {
  const res = await api.post(`/booking-workflows/${sessionId}/steps/${stepId}/submit`, { response });
  return res?.data?.data;
};

export const completeWorkflow = async (sessionId: string) => {
  const res = await api.post(`/booking-workflows/${sessionId}/complete`);
  return res?.data?.data;
};

export const cancelWorkflow = async (sessionId: string) => {
  const res = await api.post(`/booking-workflows/${sessionId}/cancel`);
  return res?.data?.data;
};
