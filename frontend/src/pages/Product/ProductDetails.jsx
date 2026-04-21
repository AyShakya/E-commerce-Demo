import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../../api/product.api";
import { addToCart } from "../../api/cart.api";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await fetchProductById(id);
      setProduct(data);
    } catch {
      setError("Archive Record Not Found");
    } finally {
      setLoading(false);
    }
  };

  const increment = () => { if (quantity < product.quantity) setQuantity((q) => q + 1); };
  const decrement = () => { if (quantity > 1) setQuantity((q) => q - 1); };

  const handleBuyNow = () => {
    if (!product || product.quantity === 0) return;
    navigate("/checkout", { state: { productId: product._id, quantity } });
  };

  if (loading) return (
    <div className="h-screen bg-[#080808] text-white flex items-center justify-center font-serif italic text-lg tracking-[0.2em] animate-pulse">
      Accessing Database...
    </div>
  );

  return (
    <main className="h-screen bg-[#080808] text-white selection:bg-white selection:text-black antialiased overflow-hidden flex flex-col">
      <style>{`
        @keyframes subtleGlow {
          0% { box-shadow: 0 0 5px rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 15px rgba(255,255,255,0.3); }
          100% { box-shadow: 0 0 5px rgba(255,255,255,0.1); }
        }
        .btn-alive:hover {
          animation: subtleGlow 2s infinite ease-in-out;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      
      <div className="flex-1 max-w-[1600px] mx-auto w-full px-8 md:px-16 py-8 flex flex-col overflow-hidden">
        
        <div className="flex-1 grid lg:grid-cols-12 gap-12 xl:gap-24 items-stretch overflow-hidden">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden">
            <div className="mb-6">
              <button
                onClick={() => navigate(-1)}
                className="group inline-flex items-center gap-3 text-[10px] tracking-[0.4em] uppercase text-white/60 hover:text-white transition-all duration-300"
              >
                <span className="text-sm transition-transform group-hover:-translate-x-1">←</span>
                <span>Return to Archive</span>
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden bg-[#0d0d0d] border border-white/5 group">
              <img
                src={product?.images?.[0]}
                alt={product?.title}
                className="w-full h-full object-contain grayscale-[15%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-[800ms] ease-out"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              {product?.quantity === 0 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-[11px] tracking-[0.8em] uppercase border border-white/40 px-12 py-6 bg-black/50">Sold Out</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 flex flex-col space-y-8 h-full justify-center overflow-y-auto no-scrollbar pr-4">
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] tracking-[0.6em] uppercase text-white/70">{product?.category} studio</span>
                <span className="h-[1px] w-12 bg-white/40"></span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif italic leading-[1] tracking-tighter text-white">
                {product?.title}
              </h1>
              <div className="flex items-center gap-10 pt-2">
                <span className="text-3xl font-light tracking-tight italic">₹{product?.price.toLocaleString()}</span>
                <div className="flex flex-col border-l border-white/20 pl-6">
                  <span className={`text-[10px] tracking-widest uppercase font-bold ${product?.quantity === 0 ? 'text-red-400' : 'text-white'}`}>
                    {product?.quantity === 0 ? "Currently Unavailable" : "Archive Certified"}
                  </span>
                  <span className="text-[9px] tracking-[0.2em] uppercase text-white/50 italic">ID: UTR-{product?._id.slice(-6).toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="max-w-md">
              <p className="text-white/80 text-[13px] md:text-sm leading-relaxed font-light tracking-wide italic">
                {product?.description || "A masterfully crafted piece emphasizing the Utaran philosophy of timeless silhouette and refined materiality."}
              </p>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-white/30 to-transparent" />

            <div className="space-y-10 max-w-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.5em] uppercase text-white/80 font-medium italic">Quantity Selector</span>
                <div className="flex items-center border border-white/30 bg-[#111] overflow-hidden">
                  <button
                    onClick={decrement}
                    disabled={quantity === 1}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-20 text-white"
                  >
                    —
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-white">{quantity}</span>
                  <button
                    onClick={increment}
                    disabled={quantity >= product?.quantity}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-20 text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={handleBuyNow}
                  disabled={product?.quantity === 0}
                  className="btn-alive group relative w-full py-5 bg-white text-black text-[10px] tracking-[0.6em] uppercase font-black overflow-hidden transition-all duration-300 active:scale-[0.97] hover:tracking-[0.8em] disabled:opacity-20"
                >
                  <span className="relative z-10">Purchase Piece</span>
                </button>

                <button
                  onClick={async () => {
                    await addToCart(product._id, quantity);
                    navigate("/cart");
                  }}
                  disabled={product?.quantity === 0}
                  className="group relative w-full py-5 border border-white/50 text-[10px] tracking-[0.6em] uppercase hover:bg-white hover:text-black transition-all duration-500 active:scale-[0.97] disabled:opacity-20 text-white"
                >
                  Add to Bag
                </button>
              </div>

              <div className="pt-4 space-y-6">
                <h4 className="text-[9px] tracking-[0.6em] uppercase text-white/50">Composition Markers</h4>
                <div className="flex flex-wrap gap-2">
                    {product?.tags?.map((tag) => (
                      <span key={tag} className="text-[9px] tracking-[0.3em] uppercase border border-white/20 px-4 py-2 text-white/70 hover:text-white hover:border-white/60 transition-all cursor-default">
                        {tag}
                      </span>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-8 text-[9px] tracking-[0.3em] uppercase pt-4 border-t border-white/20">
                  <div className="space-y-1">
                    <p className="text-white/40 italic">Availability</p>
                    <p className="text-white/90">{product?.quantity > 0 ? `${product.quantity} Remaining` : 'Sold Out'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/40 italic">Sourcing</p>
                    <p className="text-white/90">Ethical / Global</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <footer className="px-16 py-6 border-t border-white/10 flex justify-between items-center text-[9px] tracking-[0.6em] uppercase text-white/40">
         <span>Utaran Studio MMXXVI</span>
         <div className="flex gap-10">
            <span className="hidden md:block">Sustainable / Timeless / Refined</span>
            <span className="text-white/60">Archive Index</span>
         </div>
      </footer>
    </main>
  );
}