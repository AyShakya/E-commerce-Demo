import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../api/product.api";
import useDebounce from "../../hooks/useDebounce";
import ProductSkeleton from "../../components/ProductSkeleton";
import { PRODUCT_CATEGORIES } from "../../api/categoryConstant";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const CATEGORIES = ["All", ...PRODUCT_CATEGORIES];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("All");

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
    loadProducts(1, true);
  }, [debouncedSearch, sort, category]);

  useEffect(() => {
    if (page > 1) loadProducts(page);
  }, [page]);

  const loadProducts = async (pageToLoad, replace = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetchProducts({
        page: pageToLoad,
        limit: 12,
        search: debouncedSearch,
        sort,
        category: category === "All" ? undefined : category,
      });

      setProducts((prev) => (replace ? res.data : [...prev, ...res.data]));
      setHasMore(res.pagination.hasMore);
      setTotalProducts(res.pagination.total || 0);
    } catch (error) {
      console.error("Archive fetch error:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setSort("newest");
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-white selection:text-black antialiased overflow-x-hidden">
      <style>{`
        @keyframes reveal {
          from { opacity: 0; transform: translateY(15px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .product-card-reveal { 
          animation: reveal 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards; 
        }
        /* Refined Stagger Rhythm */
        .stagger-grid .product-item:nth-child(3n+2) { transform: translateY(60px); }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        @media (max-width: 1024px) {
          .stagger-grid .product-item:nth-child(even) { transform: translateY(30px); }
          .stagger-grid .product-item:nth-child(3n+2) { transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .stagger-grid .product-item { transform: translateY(0) !important; }
        }
      `}</style>

      <div className="max-w-[1500px] mx-auto px-6 md:px-10 py-16">
        
        {/* REFINED HEADER */}
        <header className="mb-20 flex flex-col items-center text-center">
          <span className="text-[10px] tracking-[0.6em] uppercase text-white/60 mb-3 block">
            Digital Catalog
          </span>
          <h1 className="text-6xl md:text-8xl font-serif italic mb-6 tracking-tighter">
            Archive
          </h1>
          <div className="w-12 h-px bg-white/30 mb-6" />
          <p className="text-[11px] tracking-[0.2em] uppercase text-white/70 max-w-lg leading-relaxed">
            Contemporary silhouettes <br/> designed for enduring relevance.
          </p>
        </header>

        {/* COMPACT CONTROLS */}
        <div className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-xl border-y border-white/10 py-6 mb-20">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            
            <nav className="flex gap-8 overflow-x-auto no-scrollbar w-full lg:w-auto px-2 lg:px-0">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-[10px] tracking-[0.3em] uppercase transition-all duration-300 whitespace-nowrap relative pb-1 ${
                    category === c ? "text-white" : "text-white/40 hover:text-white"
                  }`}
                >
                  {c}
                  {category === c && (
                    <span className="absolute bottom-0 left-0 w-full h-px bg-white" />
                  )}
                </button>
              ))}
            </nav>

            <div className="flex flex-col sm:flex-row items-center gap-8 w-full lg:w-auto px-2 lg:px-0">
              <div className="relative group w-full sm:w-64">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Collection"
                  className="bg-transparent border-b border-white/20 px-0 py-2 text-[10px] tracking-[0.2em] uppercase focus:outline-none focus:border-white transition-all w-full placeholder:text-white/30"
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-[9px] tracking-widest text-white/40 uppercase">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-[10px] tracking-[0.2em] uppercase focus:outline-none cursor-pointer text-white/70 hover:text-white transition appearance-none"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value} className="bg-[#111] text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {!initialLoading && (
            <div className="mt-6 px-2 lg:px-0 flex justify-between items-center text-[9px] tracking-[0.2em] uppercase text-white/40 font-medium">
              <span>Showing {products.length} of {totalProducts} Results</span>
              {(category !== "All" || search) && (
                <button onClick={resetFilters} className="text-white hover:text-white/60 transition-colors underline underline-offset-4 decoration-white/20">Reset Filters</button>
              )}
            </div>
          )}
        </div>

        {/* STAGGERED GRID */}
        <div className="stagger-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-24 mb-32">
          {initialLoading
            ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
            : products.map((p, idx) => (
                <Link
                  key={p._id}
                  to={`/products/${p._id}`}
                  className={`product-item group block product-card-reveal ${p.stock === 0 ? 'pointer-events-none' : ''}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="bg-[#0f0f0f] p-5 transition-all duration-500 group-hover:bg-[#141414] border border-white/5 relative">
                    <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-[#050505]">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${p.stock === 0 ? 'grayscale opacity-25' : 'grayscale-[15%] group-hover:grayscale-0'}`}
                        loading="lazy"
                      />
                    </div>

                    <div className="flex justify-between items-center gap-4 px-1">
                      <div className="flex-1 space-y-1">
                        <h3 className="text-xs tracking-[0.1em] uppercase text-white/90 font-semibold truncate">
                          {p.title}
                        </h3>
                        <p className="text-[9px] text-white/50 tracking-[0.2em] uppercase italic">
                           {p.category} Studio
                        </p>
                      </div>

                      {p.stock === 0 ? (
                        <div className="text-[9px] tracking-[0.2em] uppercase text-white/40 border border-white/10 px-3 py-1.5 bg-white/[0.03]">
                          Sold Out
                        </div>
                      ) : (
                        <div className="flex-shrink-0 flex items-center justify-center min-w-[62px] h-[62px] rounded-full bg-white text-black text-[12px] font-bold tracking-tighter shadow-xl group-hover:bg-white/90 transition-all">
                          ₹{p.price.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
        </div>

        {/* PAGINATION */}
        {hasMore && (
          <div className="flex flex-col items-center pt-24 border-t border-white/10 gap-6">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className="group relative px-20 py-5 border border-white/20 overflow-hidden transition-all duration-500 disabled:opacity-20"
            >
              <span className="relative z-10 text-[10px] tracking-[0.4em] uppercase group-hover:text-black transition-colors">
                {loading ? "Accessing Archive..." : "Load More Pieces"}
              </span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </button>
          </div>
        )}

        {!initialLoading && products.length === 0 && (
          <div className="py-48 text-center">
            <h2 className="text-lg font-serif italic text-white/60 mb-6">Archive reflects no matches for this criteria.</h2>
            <button onClick={resetFilters} className="text-[10px] tracking-[0.4em] uppercase border-b border-white/30 pb-1 hover:border-white transition-all">Reset All Selection</button>
          </div>
        )}
      </div>
    </main>
  );
}