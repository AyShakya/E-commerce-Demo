import { useEffect, useState } from "react";
import {
  fetchAllProducts,
  deleteProduct,
  restoreProduct,
  bulkUpdateProducts,
} from "../../api/admin.product.api";
import ProductForm from "../Product/ProductForm";
import useDebounce from "../../hooks/useDebounce";
import AdminRowSkeleton from "../../components/AdminRowSkeleton";

const TABS = [
  { key: "ACTIVE", label: "Active" },
  { key: "ARCHIVED", label: "Archived" },
];

const PAGE_SIZE = 10;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [tab, setTab] = useState("ACTIVE");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkMode, setBulkMode] = useState("");
  const [bulkValue, setBulkValue] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: PAGE_SIZE,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, tab]);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, tab]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchAllProducts({
        search: debouncedSearch,
        isActive: tab === "ACTIVE",
        page,
        limit: PAGE_SIZE,
      });

      const safeProducts = Array.isArray(res?.data) ? res.data : [];
      const safePagination = res?.pagination || {};

      setProducts(safeProducts);
      setPagination({
        page: safePagination.page || safePagination.currentPage || page,
        totalPages: safePagination.totalPages || 1,
        total: safePagination.total || safeProducts.length,
        limit: safePagination.limit || PAGE_SIZE,
      });

      setSelectedIds([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const refreshAfterMutation = async () => {
    await loadProducts();
  };

  const handleArchive = async (id) => {
    setMutating(true);
    try {
      await deleteProduct(id);
      await refreshAfterMutation();
    } finally {
      setMutating(false);
    }
  };

  const handleRestore = async (id) => {
    setMutating(true);
    try {
      await restoreProduct(id);
      await refreshAfterMutation();
    } finally {
      setMutating(false);
    }
  };

  const applyBulkAction = async () => {
    if (!bulkMode || !bulkValue || selectedIds.length === 0) return;

    setMutating(true);

    try {
      await bulkUpdateProducts({
        productIds: selectedIds,
        mode: bulkMode,
        value: Number(bulkValue),
      });

      setBulkMode("");
      setBulkValue("");
      setSelectedIds([]);
      await refreshAfterMutation();
    } finally {
      setMutating(false);
    }
  };

  const start = products.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = (page - 1) * PAGE_SIZE + products.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-[26rem]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product title or keyword"
            className="w-full bg-transparent border border-white/15 p-3 text-sm focus:outline-none focus:border-white/40 transition"
          />
        </div>

        <button
          onClick={() => setSelectedProduct({})}
          className="w-full lg:w-auto bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] px-8 py-3 hover:bg-white/90 transition-all active:scale-[0.98]"
        >
          Add Product
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-[11px] uppercase tracking-[0.25em] border transition ${
              tab === t.key
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/60 hover:text-white hover:border-white/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-white/10 p-4">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/40">Catalog Size</p>
          <p className="mt-2 text-2xl font-light">{pagination.total}</p>
        </div>
        <div className="border border-white/10 p-4">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/40">Current View</p>
          <p className="mt-2 text-2xl font-light">{tab === "ACTIVE" ? "Active" : "Archived"}</p>
        </div>
        <div className="border border-white/10 p-4">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/40">Selected</p>
          <p className="mt-2 text-2xl font-light">{selectedIds.length}</p>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="border border-white/15 p-4 rounded bg-white/[0.02] flex flex-wrap items-center gap-4 text-sm">
          <span className="text-white/70">{selectedIds.length} products selected</span>

          <select
            value={bulkMode}
            onChange={(e) => setBulkMode(e.target.value)}
            className="bg-transparent border border-white/20 p-2"
          >
            <option value="">Bulk Action</option>
            <option value="DISCOUNT">Apply % Discount</option>
            <option value="SET_PRICE">Set Fixed Price</option>
          </select>

          <input
            type="number"
            placeholder="Value"
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
            className="bg-transparent border border-white/20 p-2 w-32"
          />

          <button
            onClick={applyBulkAction}
            className="border border-white px-4 py-2 hover:bg-white hover:text-black transition"
          >
            Apply
          </button>

          {mutating && <span className="text-xs text-white/50">Applying changes…</span>}
        </div>
      )}

      <div className="space-y-3">
        {products.length === 0 && loading ? (
          Array.from({ length: 5 }).map((_, i) => <AdminRowSkeleton key={i} />)
        ) : products.length === 0 ? (
          <p className="text-sm text-white/50">No products found.</p>
        ) : (
          products.map((p) => (
            <div
              key={p._id}
              className="flex flex-col lg:flex-row lg:justify-between lg:items-center border border-white/10 p-4 rounded bg-white/[0.01] hover:bg-white/[0.03] transition gap-4"
            >
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p._id)}
                    onChange={() => toggleSelect(p._id)}
                    className="sr-only"
                  />
                  <span
                    className={`w-6 h-6 border rounded flex items-center justify-center transition ${
                      selectedIds.includes(p._id)
                        ? "bg-white text-black border-white"
                        : "border-white/40 hover:border-white"
                    }`}
                  >
                    {selectedIds.includes(p._id) && "✓"}
                  </span>
                </label>

                <img
                  src={p.images?.[0]}
                  alt={p.title}
                  className="w-16 h-20 object-cover bg-white/5"
                />

                <div>
                  <p className="text-sm text-white">{p.title}</p>
                  <p className="text-xs text-white/50 mt-1">₹{p.price} • Stock {p.quantity}</p>
                </div>
              </div>

              <div className="flex gap-2 text-xs uppercase tracking-[0.25em]">
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="border border-white/40 px-3 py-2 hover:border-white hover:bg-white hover:text-black transition"
                >
                  Edit
                </button>

                {tab === "ACTIVE" ? (
                  <button
                    onClick={() => handleArchive(p._id)}
                    className="border border-red-500/60 text-red-400 px-3 py-2 hover:bg-red-500 hover:text-black transition"
                  >
                    Archive
                  </button>
                ) : (
                  <button
                    onClick={() => handleRestore(p._id)}
                    className="border border-green-500/60 text-green-400 px-3 py-2 hover:bg-green-500 hover:text-black transition"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-white/10 pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
          Showing {start}–{end} of {pagination.total}
        </p>

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
            onClick={() => setPage((p) => Math.min((pagination.totalPages || 1), p + 1))}
            disabled={page >= (pagination.totalPages || 1) || loading}
            className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {selectedProduct && (
        <ProductForm
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSaved={() => loadProducts()}
        />
      )}
    </div>
  );
}
