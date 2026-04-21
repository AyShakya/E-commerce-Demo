import { useEffect, useState } from "react";
import { fetchAdminRefunds } from "../../api/admin.refund.api";
import AdminRowSkeleton from "../../components/AdminRowSkeleton";

const STATUS_STYLE = {
  REQUESTED: "text-yellow-400",
  PROCESSING: "text-blue-400",
  COMPLETED: "text-green-400",
  FAILED: "text-red-400",
};

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminRefunds({ limit: 50 });
      const refundList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setRefunds(refundList);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1c1c1c] p-6 rounded space-y-6">
      {/* HEADER */}
      <header>
        <h2 className="text-lg tracking-wide">
          Refunds
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Track refund lifecycle and payment reversals
        </p>
      </header>

      {/* LIST */}
      <div className="max-h-[65vh] overflow-y-auto space-y-3 pr-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <AdminRowSkeleton key={i} />
          ))
        ) : refunds.length === 0 ? (
          <p className="text-sm text-gray-400">
            No refunds yet.
          </p>
        ) : (
          refunds.map((refund) => (
            <div
              key={refund._id}
              className="border border-[#2a2a2a] p-4 rounded bg-[#0b0b0b]"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-white">
                    ₹{refund.amount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Refund #{refund._id
                      .slice(-6)
                      .toUpperCase()}
                  </p>
                </div>

                <span
                  className={`text-xs tracking-wide ${
                    STATUS_STYLE[refund.status]
                  }`}
                >
                  {refund.status}
                </span>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Created{" "}
                {new Date(
                  refund.createdAt
                ).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
