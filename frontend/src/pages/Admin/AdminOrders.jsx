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
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminOrders({ page, search: debouncedSearch, limit: 10 });
      setOrders(Array.isArray(res?.data) ? res.data : []);
      setPagination({
        page: res?.pagination?.page || page,
        totalPages: res?.pagination?.totalPages || 1,
        total: res?.pagination?.total || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by email, name or order ID"
        className="p-3 bg-transparent border border-white/20 rounded w-full lg:w-[26rem] text-sm focus:outline-none focus:border-white/40"
      />

      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
        {loading ? (
          <p className="text-white/60 text-sm">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-white/50 text-sm">No orders found.</p>
        ) : (
          orders.map((order) => {
            const refundable =
              order.paymentStatus === "PAID" || order.paymentStatus === "PARTIALLY_REFUNDED";

            return (
              <div key={order._id} className="border border-white/15 rounded bg-white/[0.02]">
                <div
                  className="p-4 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer hover:bg-white/[0.04]"
                  onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                >
                  <div>
                    <p className="text-sm">{order.user?.email || "No email"}</p>
                    <p className="text-xs text-white/50 mt-1">Order #{order._id.slice(-6).toUpperCase()}</p>
                  </div>

                  <div className="flex gap-3 mt-3 md:mt-0">
                    <span className={`px-2 py-1 text-xs border rounded ${badgeStyles[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </span>
                    <span className={`px-2 py-1 text-xs border rounded ${badgeStyles[order.fulfillmentStatus]}`}>
                      {order.fulfillmentStatus}
                    </span>
                  </div>
                </div>

                {expanded === order._id && (
                  <div className="border-t border-white/10 p-4 space-y-4">
                    <section>
                      <h3 className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Customer</h3>
                      <p className="text-sm text-white/80">{order.user?.name || "Unnamed user"}</p>
                      <p className="text-sm text-white/60">{order.user?.email}</p>
                    </section>

                    {order.items.map((item) => (
                      <div key={item.product} className="flex justify-between text-sm text-white/70">
                        <span>
                          {item.title} × {item.quantity}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}

                    <div className="flex flex-wrap gap-4 pt-2">
                      <select
                        value={order.fulfillmentStatus}
                        onChange={(e) => changeStatus(order._id, e.target.value)}
                        className="bg-transparent border border-white/20 p-2 text-sm"
                        disabled={updatingId === order._id}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-black">
                            {s}
                          </option>
                        ))}
                      </select>

                      {refundable && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="border border-red-500/60 text-red-400 px-4 py-2 text-sm hover:bg-red-500 hover:text-black transition"
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

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Total Orders: {pagination.total}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs text-white/60 px-2">
            Page {page} / {pagination.totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages || 1, p + 1))}
            disabled={page >= (pagination.totalPages || 1) || loading}
            className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {selectedOrder && (
        <AdminOrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
