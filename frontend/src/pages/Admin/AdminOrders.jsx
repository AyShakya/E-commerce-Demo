import { useEffect, useState } from "react";
import {
  fetchAdminOrders,
  fetchAdminOrderDetail,
  updateOrderStatus,
} from "../../api/admin.order.api";
import { runAdminReconcile } from "../../api/admin.payment.api";
import useDebounce from "../../hooks/useDebounce";
import AdminOrderDetails from "./AdminOrderDetails";

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
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [reconcileResult, setReconcileResult] = useState(null);

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
      if (selectedOrderDetail?.order?._id === orderId) {
        await loadSelectedOrderDetail(orderId);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const loadSelectedOrderDetail = async (orderId) => {
    setDetailLoading(true);
    setDetailError("");

    try {
      const res = await fetchAdminOrderDetail(orderId);
      setSelectedOrderDetail(res || null);
    } catch (err) {
      setDetailError(err.response?.data?.message || "Failed to load order details");
    } finally {
      setDetailLoading(false);
    }
  };

  const openOrderDrawer = async (order) => {
    setSelectedOrder(order);
    setSelectedOrderDetail(null);
    setDetailError("");
    await loadSelectedOrderDetail(order._id);
  };

  const closeOrderDrawer = () => {
    setSelectedOrder(null);
    setSelectedOrderDetail(null);
    setDetailLoading(false);
    setDetailError("");
  };

  const handleReconcile = async () => {
    setReconcileLoading(true);
    setReconcileResult(null);

    try {
      const result = await runAdminReconcile();
      setReconcileResult(result);
      await loadOrders();
      if (selectedOrder) {
        await loadSelectedOrderDetail(selectedOrder._id);
      }
    } finally {
      setReconcileLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email, name or order ID"
          className="p-3 bg-transparent border border-white/20 rounded w-full lg:w-[26rem] text-sm focus:outline-none focus:border-white/40"
        />

        <button
          onClick={handleReconcile}
          disabled={reconcileLoading}
          className="border border-white/20 px-4 py-3 text-xs uppercase tracking-[0.2em] disabled:opacity-40 hover:border-white/40 transition"
        >
          {reconcileLoading ? "Reconciling…" : "Run Reconcile"}
        </button>
      </div>

      {reconcileResult && (
        <div className="border border-white/10 rounded bg-white/[0.02] p-4 text-xs text-white/70 space-y-2">
          <p className="uppercase tracking-[0.2em] text-white/45">Reconcile Result</p>
          <p>
            Expired reservations scanned: {reconcileResult.scanned?.expiredReservations ?? 0}
          </p>
          <p>
            Stale payments scanned: {reconcileResult.scanned?.stalePayments ?? 0}
          </p>
          <p>
            Captured without order scanned: {reconcileResult.scanned?.capturedWithoutOrder ?? 0}
          </p>
          <p>
            Stock reclaimed: {reconcileResult.reclaimedStock ?? 0}
          </p>
        </div>
      )}

      <div className={`space-y-4 max-h-[65vh] overflow-y-auto pr-2 transition-opacity duration-300 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
        {loading ? (
          <p className="text-white/60 text-sm">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-white/50 text-sm">No orders found.</p>
        ) : (
          orders.map((order) => {
            return (
              <div
                key={order._id}
                className="border border-white/15 rounded bg-white/[0.02] hover:bg-white/[0.04] transition cursor-pointer"
                onClick={() => openOrderDrawer(order)}
              >
                <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm">{order.user?.email || "No email"}</p>
                    <p className="text-xs text-white/45 mt-1">{order.user?.name || "Unnamed user"}</p>
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
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                    Open details
                  </div>
                </div>
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
        <AdminOrderDetails
          order={selectedOrder}
          detail={selectedOrderDetail}
          detailLoading={detailLoading}
          detailError={detailError}
          statusUpdating={updatingId === selectedOrder._id}
          onClose={closeOrderDrawer}
          onChangeStatus={changeStatus}
          onRefresh={() => loadSelectedOrderDetail(selectedOrder._id)}
          onReconcile={handleReconcile}
        />
      )}
    </div>
  );
}
