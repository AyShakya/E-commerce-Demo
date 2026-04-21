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
  { key: "ACTIVE", label: "Active Products" },
  { key: "ARCHIVED", label: "Archived Products" },
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [tab, setTab] = useState("ACTIVE");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  /* loading states */
  const [loading, setLoading] = useState(true); // first load
  const [searching, setSearching] = useState(false); // typing search
  const [mutating, setMutating] = useState(false); // archive/restore/bulk

  /* BULK */
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkMode, setBulkMode] = useState("");
  const [bulkValue, setBulkValue] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // useEffect(() => {
  //   document.body.style.overflow = selectedProduct ? "hidden" : "auto";
  //   return () => (document.body.style.overflow = "auto");
  // }, [selectedProduct]);

  /* INITIAL + SEARCH LOAD */
  // when filters change: clear and explicitly fetch page 1
  useEffect(() => {
    setProducts([]);
    setHasMore(true);
    setPage(1);
    loadProducts({ reset: true, pageToLoad: 1 }); // force load page 1 now
    // eslint-disable-next-line
  }, [debouncedSearch, tab]);

  // when page increments (Load More button) load that page
  useEffect(() => {
    if (page === 1) return; // already handled above when filters changed
    loadProducts({ reset: false, pageToLoad: page });
    // eslint-disable-next-line
  }, [page]);

  const PAGE_SIZE = 10;

  // change signature
  const loadProducts = async ({ reset = false, pageToLoad = page } = {}) => {
    setLoading(true);
    try {
      const res = await fetchAllProducts({
        search: debouncedSearch,
        isActive: tab === "ACTIVE",
        page: pageToLoad, // use pageToLoad
        limit: PAGE_SIZE,
      });

      setProducts((prev) => (reset ? res.data : [...prev, ...res.data]));
      setHasMore(res.pagination.hasMore);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  /* SELECTION */
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  /* OPTIMISTIC ARCHIVE */
  const handleArchive = async (id) => {
    setMutating(true);
    setProducts((prev) => prev.filter((p) => p._id !== id));

    try {
      await deleteProduct(id);
    } finally {
      setMutating(false);
    }
  };

  /* OPTIMISTIC RESTORE */
  const handleRestore = async (id) => {
    setMutating(true);
    setProducts((prev) => prev.filter((p) => p._id !== id));

    try {
      await restoreProduct(id);
    } finally {
      setMutating(false);
    }
  };

  /* BULK APPLY */
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
      setProducts([]);
      setHasMore(true);
      setPage(1);
    } finally {
      setMutating(false);
    }
  };

  return (
    <div className="bg-[#1c1c1c] p-6 rounded flex flex-col h-full space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title…"
            className="bg-[#0b0b0b] border border-[#2a2a2a] p-2 w-72 text-sm"
          />

          {searching && (
            <span className="absolute right-3 top-2 text-xs text-gray-500">
              Searching…
            </span>
          )}
        </div>

        <button
          onClick={() => setSelectedProduct({})}
          className="border border-white px-4 py-2 text-sm hover:bg-white hover:text-black transition"
        >
          Add Product
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm border transition
              ${
                tab === t.key
                  ? "bg-white text-black"
                  : "border-[#2a2a2a] text-gray-400 hover:text-white"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="border border-[#2a2a2a] p-4 rounded bg-[#0b0b0b] flex flex-wrap items-center gap-4 text-sm">
          <span className="text-gray-400">
            {selectedIds.length} products selected
          </span>

          <select
            value={bulkMode}
            onChange={(e) => setBulkMode(e.target.value)}
            className="bg-[#0b0b0b] border border-[#2a2a2a] p-2"
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
            className="bg-[#0b0b0b] border border-[#2a2a2a] p-2 w-32"
          />

          <button
            onClick={applyBulkAction}
            className="border border-white px-4 py-2 hover:bg-white hover:text-black transition"
          >
            Apply
          </button>

          {mutating && (
            <span className="text-xs text-gray-500">Applying changes…</span>
          )}
        </div>
      )}

      {/* PRODUCT LIST */}
      <div
        className={`space-y-3 pr-2 ${
          products.length > 6 ? "flex-1 overflow-y-auto" : ""
        }`}
      >
        {products.length === 0 && loading ? (
          Array.from({ length: 5 }).map((_, i) => <AdminRowSkeleton key={i} />)
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-400">No products found.</p>
        ) : (
          products.map((p) => (
            <div
              key={p._id}
              className="flex justify-between items-center border border-[#2a2a2a] p-4 rounded bg-[#0b0b0b] hover:bg-[#141414] transition"
            >
              {/* LEFT */}
              <div className="flex items-center gap-4">
                {/* CHECKBOX */}
                <label className="cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p._id)}
                    onChange={() => toggleSelect(p._id)}
                    className="sr-only"
                  />
                  <span
                    className={`w-6 h-6 border rounded flex items-center justify-center transition
                      ${
                        selectedIds.includes(p._id)
                          ? "bg-white text-black"
                          : "border-gray-500 hover:border-white"
                      }`}
                  >
                    {selectedIds.includes(p._id) && "✓"}
                  </span>
                </label>

                {/* IMAGE */}
                <img
                  src={p.images?.[0]}
                  alt={p.title}
                  className="w-16 h-20 object-cover bg-[#1c1c1c]"
                />

                {/* INFO */}
                <div>
                  <p className="text-sm text-gray-200">{p.title}</p>
                  <p className="text-xs text-gray-400">
                    ₹{p.price} • Stock {p.quantity}
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="border px-3 py-1"
                >
                  Edit
                </button>

                {tab === "ACTIVE" ? (
                  <button
                    onClick={() => handleArchive(p._id)}
                    className="border border-red-500 text-red-500 px-3 py-1"
                  >
                    Archive
                  </button>
                ) : (
                  <button
                    onClick={() => handleRestore(p._id)}
                    className="border border-green-500 text-green-500 px-3 py-1"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* LOAD MORE */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="border border-white px-6 py-2 text-sm hover:bg-white hover:text-black transition"
          >
            Load More
          </button>
        </div>
      )}

      {/* PRODUCT FORM */}
      {selectedProduct && (
        <ProductForm
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSaved={() => {
            setProducts([]);
            setHasMore(true);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
