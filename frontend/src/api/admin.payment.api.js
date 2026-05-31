import api from "./axios";

export const getPaymentLogsByOrder = async (orderId) => {
  const res = await api.get(`/admin/payment-logs/${orderId}`);
  return res.data;
};

export const initiateRefund = async ({ paymentId, amount }) => {
  const res = await api.post("/payments/refund", {
    paymentId,
    amount,
  });
  return res.data;
};

export const retryFinalizePayment = async (paymentId) => {
  const res = await api.post(`/admin/payments/${paymentId}/retry-finalize`);
  return res.data;
};

export const runAdminReconcile = async () => {
  const res = await api.post("/admin/reconcile");
  return res.data;
};
