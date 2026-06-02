import { useState } from "react";
import { initiateRefund, retryFinalizePayment } from "../../api/admin.payment.api";

const STATUS_OPTIONS = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrderDetails({
  order,
  detail,
  detailLoading,
  detailError,
  statusUpdating,
  onClose,
  onRefresh,
  onChangeStatus,
}) {
  const [refundAmount, setRefundAmount] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState("");
  const [repairLoading, setRepairLoading] = useState(false);
  const [repairMessage, setRepairMessage] = useState("");

  const orderData = detail?.order || order;
  const payment = detail?.payment || orderData?.payment || null;
  const paymentLogs = detail?.paymentLogs || [];
  const refunds = detail?.refunds || [];
  const canRetryFinalize =
    Boolean(payment?._id) &&
    payment?.finalizationState !== "COMPLETED" &&
    !payment?.order;

  const canRefund =
    orderData?.paymentStatus === "PAID" ||
    orderData?.paymentStatus === "PARTIALLY_REFUNDED";

  const paidAmount = payment?.amount || 0;
  const refundedAmount = payment?.refundedAmount || 0;
  const maxRefund = paidAmount - refundedAmount;

  const submitStatusChange = async (nextStatus) => {
    if (!orderData?._id || !onChangeStatus) return;
    await onChangeStatus(orderData._id, nextStatus);
  };

  const handleRefund = async () => {
    setRefundError("");

    const amount = refundAmount ? Number(refundAmount) : maxRefund;

    if (!payment?._id) {
      setRefundError("Payment information missing");
      return;
    }

    if (amount <= 0 || amount > maxRefund) {
      setRefundError(`Invalid amount. Max refundable ₹${maxRefund}`);
      return;
    }

    try {
      setRefundLoading(true);
      await initiateRefund({
        paymentId: payment._id,
        amount,
      });
      setRefundAmount("");
      await onRefresh?.();
    } catch (err) {
      setRefundError(err.response?.data?.message || "Refund failed");
    } finally {
      setRefundLoading(false);
    }
  };

  const handleRetryFinalize = async () => {
    if (!payment?._id) return;

    setRepairMessage("");

    try {
      setRepairLoading(true);
      const result = await retryFinalizePayment(payment._id);
      setRepairMessage(result?.message || "Finalization retry completed");
      await onRefresh?.();
    } catch (err) {
      setRepairMessage(err.response?.data?.message || "Retry failed");
    } finally {
      setRepairLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-end z-50">
      <div className="w-full max-w-xl bg-[#0b0b0b] p-6 overflow-y-auto space-y-8 border-l border-white/10">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg tracking-wide">
              Order #{orderData?._id?.slice(-6).toUpperCase()}
            </h2>
            <p className="text-xs text-gray-500 font-mono">
              {orderData?._id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* CUSTOMER */}
        <section className="space-y-1">
          <h3 className="text-xs text-gray-500 uppercase tracking-wide">
            Customer
          </h3>
          <p className="text-sm">{orderData?.user?.name || "Unnamed user"}</p>
          <p className="text-sm text-gray-400">{orderData?.user?.email || "No email"}</p>
          <p className="text-xs text-gray-500 font-mono">
            User ID: {orderData?.user?._id || "N/A"}
          </p>
        </section>

        {/* ITEMS */}
        <section className="space-y-3">
          <h3 className="text-xs text-gray-500 uppercase tracking-wide">
            Items ({orderData?.items?.length || 0})
          </h3>

          <div className="space-y-2">
            {(orderData?.items || []).map((item) => (
              <div
                key={String(item.product)}
                className="flex justify-between text-sm border-b border-[#1f1f1f] pb-2"
              >
                <div>
                  <p>{item.title}</p>
                  <p className="text-xs text-gray-500 font-mono">
                    Product ID: {item.product}
                  </p>
                </div>

                <div className="text-right text-gray-400">
                  <p>
                    ₹{item.price} × {item.quantity}
                  </p>
                  <p className="text-white">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PAYMENT SUMMARY */}
        <section className="border border-[#1f1f1f] rounded p-4 space-y-2">
          <h3 className="text-xs text-gray-500 uppercase tracking-wide">
            Payment Summary
          </h3>

          <div className="flex justify-between text-sm">
            <span>Total Paid</span>
            <span>₹{paidAmount}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-400">
            <span>Already Refunded</span>
            <span>₹{refundedAmount}</span>
          </div>

          <div className="flex justify-between text-sm font-medium">
            <span>Refundable</span>
            <span>₹{maxRefund}</span>
          </div>

          <div className="text-xs text-gray-500 pt-2">
            Payment Status: <span className="text-white">{orderData?.paymentStatus || "N/A"}</span>
          </div>

          <div className="text-xs text-gray-500 pt-1">
            Fulfillment Status: <span className="text-white">{orderData?.fulfillmentStatus || "N/A"}</span>
          </div>
        </section>

        {/* ACTIONS */}
        <section className="space-y-3">
          <h3 className="text-xs text-gray-500 uppercase tracking-wide">
            Quick Actions
          </h3>

          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={orderData?.fulfillmentStatus || "PENDING"}
              onChange={(e) => submitStatusChange(e.target.value)}
              className="bg-transparent border border-white/20 p-2 text-sm"
              disabled={detailLoading || statusUpdating || !onChangeStatus}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status} className="bg-black">
                  {status}
                </option>
              ))}
            </select>

            {canRetryFinalize && (
              <button
                onClick={handleRetryFinalize}
                disabled={repairLoading}
                className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] hover:border-white/40 disabled:opacity-40 transition"
              >
                {repairLoading ? "Retrying…" : "Retry Finalization"}
              </button>
            )}
          </div>

          {repairMessage && (
            <p className="text-xs text-white/50">{repairMessage}</p>
          )}
        </section>

        {/* REFUND – DANGER ZONE */}
        {canRefund && (
          <section className="border-t border-red-500/30 pt-6 space-y-3">
            <h3 className="text-sm text-red-400">
              Initiate Refund
            </h3>

            <div className="flex gap-3 items-center">
              <input
                type="number"
                placeholder={`Max ₹${maxRefund}`}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="bg-[#0b0b0b] border border-[#2a2a2a] p-2 w-40 text-sm"
              />

              <button
                onClick={handleRefund}
                disabled={refundLoading || !payment?._id}
                className="border border-red-500 text-red-400 px-4 py-2 text-sm
                  hover:bg-red-500 hover:text-black transition
                  disabled:opacity-50"
              >
                {refundLoading ? "Processing…" : "Refund"}
              </button>
            </div>

            {refundError && (
              <p className="text-xs text-red-400">{refundError}</p>
            )}
          </section>
        )}

        <section className="space-y-3 border-t border-white/10 pt-5">
          <h3 className="text-xs text-gray-500 uppercase tracking-wide">
            Payment Logs
          </h3>

          {detailLoading ? (
            <p className="text-sm text-gray-400">Loading details…</p>
          ) : detailError ? (
            <p className="text-sm text-red-400">{detailError}</p>
          ) : paymentLogs.length === 0 ? (
            <p className="text-sm text-gray-400">No payment logs available.</p>
          ) : (
            <div className="space-y-2">
              {paymentLogs.slice(0, 8).map((log) => (
                <div key={log._id} className="border border-white/10 rounded p-3 text-xs text-gray-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="uppercase tracking-wide text-white/70">{log.eventType}</span>
                    <span className="text-white/40">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-gray-400">{log.providerRef || "No provider ref"}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3 border-t border-white/10 pt-5">
          <h3 className="text-xs text-gray-500 uppercase tracking-wide">
            Refund History
          </h3>

          {refunds.length === 0 ? (
            <p className="text-sm text-gray-400">No refunds recorded.</p>
          ) : (
            <div className="space-y-2">
              {refunds.map((refund) => (
                <div key={refund._id} className="border border-white/10 rounded p-3 text-xs text-gray-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="uppercase tracking-wide text-white/70">{refund.status}</span>
                    <span className="text-white/40">{new Date(refund.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-gray-400">
                    ₹{refund.amount}{refund.providerRefundId ? ` • ${refund.providerRefundId}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="text-xs text-gray-500 space-y-1">
          <p>Created: {orderData?.createdAt ? new Date(orderData.createdAt).toLocaleString() : "N/A"}</p>
          <p>Last Updated: {orderData?.updatedAt ? new Date(orderData.updatedAt).toLocaleString() : "N/A"}</p>
        </section>
      </div>
    </div>
  );
}
