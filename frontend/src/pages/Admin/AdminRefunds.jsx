import { useEffect, useState } from "react";
import { fetchAdminRefunds } from "../../api/admin.refund.api";
import AdminRowSkeleton from "../../components/AdminRowSkeleton";

const STATUS_STYLE = {
  REQUESTED: "text-yellow-400",
  PROCESSING: "text-blue-400",
  COMPLETED: "text-green-400",
  FAILED: "text-red-400",
};

const FILTERS = ["", "REQUESTED", "PROCESSING", "COMPLETED", "FAILED"];

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    setPage(1);
  }, [status]);

  useEffect(() => {
    loadRefunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminRefunds({ page, status, limit: 10 });
      const refundList = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
      setRefunds(refundList);
      setPagination({
        page: res?.pagination?.page || page,
        totalPages: res?.pagination?.totalPages || 1,
        total: res?.pagination?.total || refundList.length,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg tracking-wide">Refund Queue</h2>
          <p className="text-sm text-white/50 mt-1">Track refund lifecycle and payment reversals</p>
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-transparent border border-white/20 p-2 text-sm"
        >
          {FILTERS.map((filterStatus) => (
            <option key={filterStatus || "all"} value={filterStatus} className="bg-black">
              {filterStatus || "ALL STATUSES"}
            </option>
          ))}
        </select>
      </header>

      <div className="max-h-[62vh] overflow-y-auto space-y-3 pr-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <AdminRowSkeleton key={i} />)
        ) : refunds.length === 0 ? (
          <p className="text-sm text-white/50">No refunds found for this filter.</p>
        ) : (
          refunds.map((refund) => (
            <div key={refund._id} className="border border-white/15 p-4 rounded bg-white/[0.02]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-white">₹{refund.amount}</p>
                  <p className="text-xs text-white/50 mt-1">Refund #{refund._id.slice(-6).toUpperCase()}</p>
                </div>

                <span className={`text-xs tracking-wide ${STATUS_STYLE[refund.status] || "text-white/60"}`}>
                  {refund.status}
                </span>
              </div>

              <div className="mt-3 text-xs text-white/40">
                Created {new Date(refund.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Total Refunds: {pagination.total}</p>
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
    </div>
  );
}
