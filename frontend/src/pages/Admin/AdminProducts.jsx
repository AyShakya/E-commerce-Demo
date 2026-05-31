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
import ProductImage from "../../components/ProductImage";

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

  const activeLabel = tab === "ACTIVE" ? "Active catalog" : "Archived catalog";
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
    <div className="space-y-6 animate-fade-in">
      <header className="border border-white/10 rounded bg-white/[0.02] p-5 md:p-6 space-y-5">
        <div className="flex flex-col gap-2">
          <p className="text-[9px] uppercase tracking-[0.55em] text-white/35">Catalog Console</p>
          <h2 className="font-serif italic text-3xl tracking-tight text-white">
            Product Management
          </h2>
          <p className="text-sm text-white/50 max-w-2xl">
            Create products, update catalog entries, archive or restore items, and apply bulk price changes from a single workspace.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-[26rem]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product title or keyword"
              className="w-full bg-transparent border border-white/15 p-3 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/40 transition"
            />
          </div>

          <button
            onClick={() => setSelectedProduct({})}
            className="w-full lg:w-auto border border-white/15 bg-white text-black text-[10px] font-black uppercase tracking-[0.35em] px-8 py-3 hover:bg-white/90 hover:border-white/30 transition-all active:scale-[0.98]"
          >
            Add Product
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] border transition ${
                tab === t.key
                  ? "border-white bg-white text-black"
                  : "border-white/15 text-white/55 hover:text-white hover:border-white/35"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-white/10 rounded bg-white/[0.02] p-4">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/35">Catalog Size</p>
          <p className="mt-2 text-2xl font-light text-white">{pagination.total}</p>
        </div>
        <div className="border border-white/10 rounded bg-white/[0.02] p-4">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/35">Current View</p>
          <p className="mt-2 text-2xl font-light text-white">{activeLabel}</p>
        </div>
        <div className="border border-white/10 rounded bg-white/[0.02] p-4">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/35">Selected</p>
          <p className="mt-2 text-2xl font-light text-white">{selectedIds.length}</p>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="border border-white/10 rounded bg-white/[0.02] p-4 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-3 text-white/70">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>{selectedIds.length} products selected</span>
          </div>

          <select
            value={bulkMode}
            onChange={(e) => setBulkMode(e.target.value)}
            className="bg-transparent border border-white/15 p-2 text-sm text-white/80"
          >
            <option value="" className="bg-black">Bulk Action</option>
            <option value="DISCOUNT" className="bg-black">Apply % Discount</option>
            <option value="SET_PRICE" className="bg-black">Set Fixed Price</option>
          </select>

          <input
            type="number"
            placeholder="Value"
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
            className="bg-transparent border border-white/15 p-2 w-32 text-white/80 placeholder:text-white/25"
          />

          <button
            onClick={applyBulkAction}
            className="border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white hover:border-white hover:bg-white hover:text-black transition"
          >
            Apply
          </button>

          {mutating && <span className="text-xs text-white/45">Applying changes…</span>}
        </div>
      )}

      <div className="space-y-3">
        {products.length === 0 && loading ? (
          Array.from({ length: 5 }).map((_, i) => <AdminRowSkeleton key={i} />)
        ) : products.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded bg-white/[0.015] p-6 text-sm text-white/45">
            No products found.
          </div>
        ) : (
          products.map((p) => (
            <article
              key={p._id}
              className="flex flex-col lg:flex-row lg:justify-between lg:items-center border border-white/10 rounded bg-white/[0.02] p-4 hover:bg-white/[0.04] transition gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <label className="cursor-pointer shrink-0">
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
                        : "border-white/30 hover:border-white"
                    }`}
                  >
                    {selectedIds.includes(p._id) && "✓"}
                  </span>
                </label>

                <ProductImage
                  src={p.images?.[0]}
                  title={p.title}
                  category={p.category}
                  alt={p.title}
                  className="w-16 h-20 object-cover bg-white/5 border border-white/10"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm text-white font-medium truncate">{p.title}</p>
                    {p.quantity === 0 && (
                      <span className="text-[8px] tracking-[0.2em] bg-red-500/10 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-black uppercase">
                        Out of Stock
                      </span>
                    )}
                    {!p.isActive && (
                      <span className="text-[8px] tracking-[0.2em] bg-white/5 text-white/50 border border-white/10 px-2 py-0.5 rounded font-black uppercase">
                        Archived
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    ₹{Number(p.price || 0).toLocaleString()} •
                    <span className={p.quantity === 0 ? "text-red-300 font-bold" : "text-white/70"}>
                      {" "}Stock {p.quantity}
                    </span>
                    {p.category ? <span> • {p.category}</span> : null}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 text-[10px] uppercase tracking-[0.25em] flex-wrap">
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="border border-white/20 px-3 py-2 text-white/80 hover:border-white hover:bg-white hover:text-black transition"
                >
                  Edit
                </button>

                {tab === "ACTIVE" ? (
                  <button
                    onClick={() => handleArchive(p._id)}
                    className="border border-red-500/40 text-red-300 px-3 py-2 hover:bg-red-500 hover:text-black transition"
                  >
                    Archive
                  </button>
                ) : (
                  <button
                    onClick={() => handleRestore(p._id)}
                    className="border border-emerald-500/40 text-emerald-300 px-3 py-2 hover:bg-emerald-500 hover:text-black transition"
                  >
                    Restore
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-white/10 pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">
          Showing {start}–{end} of {pagination.total}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/75 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs text-white/55 px-2">
            Page {page} / {pagination.totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min((pagination.totalPages || 1), p + 1))}
            disabled={page >= (pagination.totalPages || 1) || loading}
            className="border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/75 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
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
