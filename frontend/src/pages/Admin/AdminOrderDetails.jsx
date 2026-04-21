import { useState } from "react";
import { initiateRefund } from "../../api/admin.payment.api";

export default function AdminOrderDetails({ order, onClose }) {
  const [refundAmount, setRefundAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canRefund =
    order.paymentStatus === "PAID" ||
    order.paymentStatus === "PARTIALLY_REFUNDED";

  const paidAmount = order.payment?.amount || 0;
  const refundedAmount = order.payment?.refundedAmount || 0;
  const maxRefund = paidAmount - refundedAmount;

  const handleRefund = async () => {
    setError("");

    const amount = refundAmount ? Number(refundAmount) : maxRefund;

    if (!order.payment?._id) {
      setError("Payment information missing");
      return;
    }

    if (amount <= 0 || amount > maxRefund) {
      setError(`Invalid amount. Max refundable ₹${maxRefund}`);
      return;
    }

    try {
      setLoading(true);
      await initiateRefund({
        paymentId: order.payment._id,
        amount,
      });
      setRefundAmount("");
      alert("Refund initiated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Refund failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-end z-50">
      <div className="w-full max-w-lg bg-[#0b0b0b] p-6 overflow-y-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg tracking-wide">
              Order #{order._id.slice(-6).toUpperCase()}
            </h2>
            <p className="text-xs text-gray-500 font-mono">
              {order._id}
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
          <p className="text-sm">{order.user?.name}</p>
          <p className="text-sm text-gray-400">{order.user?.email}</p>
          <p className="text-xs text-gray-500 font-mono">
            User ID: {order.user?._id}
          </p>
        </section>

        {/* ADDRESS */}
        {order.shippingAddress && (
          <section className="space-y-1">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide">
              Shipping Address
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              <br />
              {order.shippingAddress.city},{" "}
              {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
              <br />
              Phone: {order.shippingAddress.phone}
            </p>
          </section>
        )}

        {/* ITEMS */}
        <section className="space-y-3">
          <h3 className="text-xs text-gray-500 uppercase tracking-wide">
            Items ({order.items.length})
          </h3>

          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.product}
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

        {/* PAYMENT SUMMARY
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
            Payment Status:{" "}
            <span className="text-white">{order.paymentStatus}</span>
          </div>
        </section> */}

        {/* META */}
        <section className="text-xs text-gray-500 space-y-1">
          <p>Fulfillment: {order.fulfillmentStatus}</p>
          <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
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
                disabled={loading}
                className="border border-red-500 text-red-400 px-4 py-2 text-sm
                  hover:bg-red-500 hover:text-black transition
                  disabled:opacity-50"
              >
                {loading ? "Processing…" : "Refund"}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
