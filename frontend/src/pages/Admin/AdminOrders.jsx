import { useEffect, useState } from "react";
import { fetchAdminOrders, updateOrderStatus } from "../../api/admin.order.api";
import useDebounce from "../../hooks/useDebounce";
import AdminOrderDetails from "./AdminOrderDetails";

const STATUS_OPTIONS = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

const badgeStyles = {
  PAID: "bg-green-500/10 text-green-400 border-green-500/30",
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/30",
  REFUNDED: "bg-red-500/10 text-red-400 border-red-500/30",
  SHIPPED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // ✅ NEW

  useEffect(() => {
    loadOrders();
  }, [page, debouncedSearch]);

  const loadOrders = async () => {
    setLoading(true);
    const res = await fetchAdminOrders({ page, search: debouncedSearch });
    setOrders(res.data);
    setPagination(res.pagination);
    setLoading(false);
  };

  const changeStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    await updateOrderStatus(orderId, status);
    await loadOrders();
    setUpdatingId(null);
  };

  return (
    <div className="flex flex-col h-full space-y-8">
      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        placeholder="Search by email, name or order ID"
        className="p-3 bg-[#0b0b0b] border border-[#2a2a2a] rounded w-96 text-sm"
      />

      {/* ORDERS */}
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading orders…</p>
        ) : (
          orders.map((order) => {
            const refundable =
              order.paymentStatus === "PAID" ||
              order.paymentStatus === "PARTIALLY_REFUNDED";

            return (
              <div
                key={order._id}
                className="border border-[#2a2a2a] rounded bg-[#0b0b0b]"
              >
                {/* HEADER */}
                <div
                  className="p-4 flex justify-between cursor-pointer hover:bg-[#141414]"
                  onClick={() =>
                    setExpanded(expanded === order._id ? null : order._id)
                  }
                >
                  <div>
                    <p className="text-sm">{order.user?.email}</p>
                    <p className="text-xs text-gray-500">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span
                      className={`px-2 py-1 text-xs border rounded ${badgeStyles[order.paymentStatus]}`}
                    >
                      {order.paymentStatus}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs border rounded ${badgeStyles[order.fulfillmentStatus]}`}
                    >
                      {order.fulfillmentStatus}
                    </span>
                  </div>
                </div>

                {/* DETAILS */}
                {expanded === order._id && (
                  <div className="border-t border-[#2a2a2a] p-4 space-y-4">
                    {/* CUSTOMER */}
                    <section className="mb-6">
                      <h3 className="text-sm mb-2">Customer</h3>
                      <p className="text-sm text-gray-300">
                        {order.user?.name || "Unnamed user"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {order.user?.email}
                      </p>
                    </section>

                    {/* ITEMS */}
                    {order.items.map((item) => (
                      <div
                        key={item.product}
                        className="flex justify-between text-sm text-gray-400"
                      >
                        <span>
                          {item.title} × {item.quantity}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}

                    {/* ACTIONS */}
                    <div className="flex gap-4 pt-4">
                      <select
                        value={order.fulfillmentStatus}
                        onChange={(e) =>
                          changeStatus(order._id, e.target.value)
                        }
                        className="bg-[#0b0b0b] border border-[#2a2a2a] p-2 text-sm"
                        disabled={updatingId === order._id}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      {refundable && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="border border-red-500 text-red-400 px-4 py-2 text-sm hover:bg-red-500 hover:text-black transition"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* REFUND MODAL */}
      {selectedOrder && (
        <AdminOrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
