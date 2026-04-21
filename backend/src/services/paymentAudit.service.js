import PaymentLog from "../models/PaymentLog.model.js";

export const logPaymentEvent = async ({
  order,
  user,
  eventType,
  providerRef,
  amount,
  metadata = {},
}) => {
  try {
    await PaymentLog.create({
      order,
      user,
      eventType,
      providerRef,
      amount,
      metadata,
    });
  } catch (error) {
    // Audit logs should NEVER break payment flow
    console.error("Payment audit log failed:", error);
  }
};
