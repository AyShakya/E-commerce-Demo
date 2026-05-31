import { useEffect, useMemo, useState } from "react";
import { fetchAdminLogs } from "../../api/admin.logs.api";
import useDebounce from "../../hooks/useDebounce";
import AdminRowSkeleton from "../../components/AdminRowSkeleton";

const EVENT_OPTIONS = [
  "",
  "PAYMENT_INTENT_CREATED",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "REFUND_REQUESTED",
  "REFUND_SUCCESS",
  "REFUND_FAILED",
  "AUTO_RECLAIMED",
  "AUTO_EXPIRED",
  "CHECKOUT_CANCELLED_BY_USER",
  "CHECKOUT_AUTO_EXPIRED",
  "CHECKOUT_FAILED_EXPIRED",
  "CHECKOUT_QUANTITY_CHANGED",
];

const EVENT_STYLES = {
  PAYMENT_INTENT_CREATED: "text-slate-200 border-slate-200/20 bg-slate-200/5",
  PAYMENT_SUCCESS: "text-emerald-300 border-emerald-400/20 bg-emerald-400/5",
  PAYMENT_FAILED: "text-red-300 border-red-400/20 bg-red-400/5",
  REFUND_REQUESTED: "text-amber-300 border-amber-400/20 bg-amber-400/5",
  REFUND_SUCCESS: "text-emerald-300 border-emerald-400/20 bg-emerald-400/5",
  REFUND_FAILED: "text-red-300 border-red-400/20 bg-red-400/5",
  AUTO_RECLAIMED: "text-cyan-300 border-cyan-400/20 bg-cyan-400/5",
  AUTO_EXPIRED: "text-violet-300 border-violet-400/20 bg-violet-400/5",
  CHECKOUT_CANCELLED_BY_USER: "text-orange-300 border-orange-400/20 bg-orange-400/5",
  CHECKOUT_AUTO_EXPIRED: "text-orange-300 border-orange-400/20 bg-orange-400/5",
  CHECKOUT_FAILED_EXPIRED: "text-red-300 border-red-400/20 bg-red-400/5",
  CHECKOUT_QUANTITY_CHANGED: "text-fuchsia-300 border-fuchsia-400/20 bg-fuchsia-400/5",
};

const PAGE_SIZE = 20;

const prettyTime = (value) => new Date(value).toLocaleString();

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventType, setEventType] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const debouncedEventType = useDebounce(eventType, 200);

  const loadLogs = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const res = await fetchAdminLogs({
        page,
        limit: PAGE_SIZE,
        eventType: debouncedEventType,
      });

      setLogs(Array.isArray(res?.data) ? res.data : []);
      setPagination({
        page: res?.pagination?.page || page,
        totalPages: res?.pagination?.totalPages || 1,
        total: res?.pagination?.total || 0,
      });
      setLastUpdated(new Date());
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedEventType]);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedEventType]);

  useEffect(() => {
    if (!isLive) return undefined;

    const interval = setInterval(() => {
      loadLogs({ silent: true });
    }, 8000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, page, debouncedEventType]);

  const totalCount = pagination.total || 0;
  const totalLabel = useMemo(() => totalCount.toLocaleString(), [totalCount]);

  return (
    <div className="space-y-6">
      <header className="border border-white/10 rounded bg-white/[0.02] p-5 md:p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-[9px] uppercase tracking-[0.55em] text-white/35">Activity Console</p>
          <h2 className="font-serif italic text-3xl tracking-tight text-white">Live Logs</h2>
          <p className="text-sm text-white/50 max-w-2xl">
            A continuous feed of payment, refund and stock recovery events. The panel refreshes on a short interval so admin operators can keep watching activity without leaving the page.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3 items-center">
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="bg-transparent border border-white/15 p-3 text-sm text-white/80"
          >
            {EVENT_OPTIONS.map((option) => (
              <option key={option || "all"} value={option} className="bg-black">
                {option || "ALL EVENTS"}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsLive((value) => !value)}
            className={`border px-4 py-3 text-[10px] uppercase tracking-[0.35em] transition ${
              isLive
                ? "border-emerald-400/30 text-emerald-200 bg-emerald-400/5"
                : "border-white/15 text-white/55 hover:text-white hover:border-white/30"
            }`}
          >
            {isLive ? "Live Refresh On" : "Live Refresh Off"}
          </button>

          <button
            onClick={() => loadLogs()}
            className="border border-white/15 px-4 py-3 text-[10px] uppercase tracking-[0.35em] text-white/70 hover:text-white hover:border-white/30 transition"
          >
            Refresh Now
          </button>
        </div>

        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.25em] text-white/40">
          <span>Total: {totalLabel}</span>
          <span>Page {pagination.page} / {pagination.totalPages || 1}</span>
          <span>{isLive ? "Auto-refresh every 8s" : "Manual refresh only"}</span>
          <span>{lastUpdated ? `Updated ${prettyTime(lastUpdated)}` : "Awaiting data"}</span>
        </div>
      </header>

      <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => <AdminRowSkeleton key={index} />)
        ) : logs.length === 0 ? (
          <p className="text-sm text-white/45">No logs found for the selected filter.</p>
        ) : (
          logs.map((log) => (
            <article key={log._id} className="border border-white/10 rounded bg-white/[0.02] p-4 md:p-5 hover:bg-white/[0.03] transition">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] border rounded-full ${EVENT_STYLES[log.eventType] || "text-white/60 border-white/15 bg-white/[0.03]"}`}>
                      {log.eventType}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                      {log.provider || "RAZORPAY"}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-white/90">
                      {log.user?.name || log.user?.email || "System event"}
                    </p>
                    <p className="text-xs text-white/45 mt-1">
                      {log.user?.email || "No user linked"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-white/50">
                    <span>{prettyTime(log.createdAt)}</span>
                    <span>{log.providerRef || "No provider ref"}</span>
                    <span>₹{typeof log.amount === "number" ? log.amount : 0}</span>
                  </div>
                </div>

                <div className="text-right text-xs text-white/45 space-y-2 md:min-w-44">
                  <div>
                    <p className="uppercase tracking-[0.25em] text-white/30">Order</p>
                    <p className="mt-1 text-white/70">
                      {log.order?._id ? `#${String(log.order._id).slice(-6).toUpperCase()}` : "No order"}
                    </p>
                  </div>
                  {log.order && (
                    <div className="space-y-1">
                      <p>{log.order.paymentStatus}</p>
                      <p>{log.order.fulfillmentStatus}</p>
                    </div>
                  )}
                </div>
              </div>

              {log.metadata && (
                <details className="mt-4 border-t border-white/8 pt-3">
                  <summary className="cursor-pointer text-[10px] uppercase tracking-[0.25em] text-white/35 hover:text-white/60 transition">
                    View metadata
                  </summary>
                  <pre className="mt-3 overflow-x-auto text-[11px] leading-5 text-white/55 whitespace-pre-wrap break-words">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </article>
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
          Showing {Math.min(totalCount, (page - 1) * PAGE_SIZE + logs.length)} of {totalLabel}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || loading}
            className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs text-white/60 px-2">Page {page} / {pagination.totalPages || 1}</span>
          <button
            onClick={() => setPage((current) => Math.min(pagination.totalPages || 1, current + 1))}
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