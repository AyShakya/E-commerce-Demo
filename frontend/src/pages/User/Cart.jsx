import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem } from "../../api/cart.api";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      console.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const increment = async (e, item) => {
    e.stopPropagation(); // Prevents navigating to details when clicking buttons
    if (item.quantity < item.product.quantity) {
      await updateCartItem(item.product._id, item.quantity + 1);
      loadCart();
    }
  };

  const decrement = async (e, item) => {
    e.stopPropagation(); // Prevents navigating to details when clicking buttons
    if (item.quantity > 1) {
      await updateCartItem(item.product._id, item.quantity - 1);
      loadCart();
    }
  };

  const handleRemove = async (e, productId) => {
    e.stopPropagation(); // Prevents navigating to details
    await removeCartItem(productId);
    loadCart();
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  if (loading) {
    return (
      <div className="h-screen bg-[#080808] text-white flex items-center justify-center font-serif italic text-lg tracking-[0.2em] animate-pulse">
        Accessing Bag...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-white selection:text-black antialiased overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 py-20">
        
        {/* EDITORIAL HEADER */}
        <header className="mb-20 flex flex-col items-center text-center">
          <span className="text-[10px] tracking-[0.8em] uppercase text-white/70 mb-4 block">
            Archive Selection
          </span>
          <h1 className="text-6xl md:text-8xl font-serif italic mb-8 tracking-tighter">
            Your Bag
          </h1>
          <div className="w-16 h-px bg-white/40 mb-8" />
        </header>

        {cart.length === 0 ? (
          <div className="py-40 text-center space-y-10">
            <p className="font-serif italic text-2xl text-white/50">The bag is currently empty.</p>
            <Link to="/products" className="inline-block text-[10px] tracking-[0.5em] uppercase border border-white/40 px-12 py-4 hover:bg-white hover:text-black transition-all">
              Return to Archive
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-16 xl:gap-24 items-start">
            
            {/* ITEMS SECTION */}
            <section className="lg:col-span-7 space-y-10">
              {cart.map((item) => (
                <div
                  key={item.product._id}
                  onClick={() => navigate(`/products/${item.product._id}`)}
                  className="flex gap-6 md:gap-10 group border-b border-white/10 pb-10 transition-all duration-300 cursor-pointer hover:bg-white/[0.02] -mx-4 px-4"
                >
                  {/* IMAGE */}
                  <div className="w-28 md:w-40 aspect-[3/4] bg-[#0d0d0d] border border-white/10 overflow-hidden flex-shrink-0 relative">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-sm md:text-lg tracking-widest uppercase font-semibold text-white group-hover:text-gray-300 transition-colors">
                            {item.product.title}
                          </h3>
                          <p className="text-[10px] tracking-[0.3em] uppercase text-white/60 italic font-medium">
                            {item.product.category} Studio
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleRemove(e, item.product._id)}
                          className="text-[9px] uppercase tracking-[0.4em] text-white/50 hover:text-red-400 transition-colors py-1"
                        >
                          Remove
                        </button>
                      </div>

                      <p className="text-lg md:text-xl font-light text-white tracking-tight">
                        ₹{item.product.price.toLocaleString()}
                      </p>
                    </div>

                    {/* QUANTITY STEPPER */}
                    <div className="flex items-center gap-6 pt-4">
                      <span className="text-[9px] text-white/60 uppercase tracking-[0.4em] font-bold">
                        Qty
                      </span>
                      <div className="flex items-center border border-white/20 bg-[#111]">
                        <button
                          onClick={(e) => decrement(e, item)}
                          disabled={item.quantity === 1}
                          className="w-9 h-9 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-10 text-white font-bold"
                        >
                          —
                        </button>
                        <span className="w-8 text-center text-xs font-black text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={(e) => increment(e, item)}
                          disabled={item.quantity === item.product.quantity}
                          className="w-9 h-9 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-10 text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* SUMMARY PANEL */}
            <aside className="lg:col-span-5 space-y-10 lg:sticky lg:top-24 bg-[#0d0d0d] p-8 md:p-12 border border-white/10 shadow-2xl">
              <div className="space-y-8">
                <h2 className="text-[11px] tracking-[0.6em] uppercase text-white font-black border-b border-white/20 pb-6">
                  Order Summary
                </h2>

                <div className="space-y-5">
                  <div className="flex justify-between text-[10px] tracking-[0.3em] uppercase text-white/70 font-medium">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] tracking-[0.3em] uppercase text-white/40">
                    <span>Shipping</span>
                    <span className="italic">Calculated Next</span>
                  </div>
                  <div className="pt-6 border-t border-white/20 flex justify-between items-center">
                    <span className="text-xs uppercase tracking-[0.6em] text-white font-black">Total</span>
                    <span className="text-3xl font-light tracking-tighter text-white">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-8 space-y-6">
                  <p className="text-[10px] text-white/60 leading-relaxed italic border-l-2 border-white/20 pl-5">
                    Items in your bag are limited edition. <br/>
                    Checkout secures your archive selection.
                  </p>
                  
                  <Link to="/products" className="block">
                    <button className="w-full py-5 border border-white/40 text-[10px] tracking-[0.6em] uppercase hover:bg-white hover:text-black transition-all duration-500 font-bold active:scale-[0.98]">
                      Add More Pieces
                    </button>
                  </Link>
                </div>
              </div>

              {/* SECURITY */}
              <div className="flex justify-between pt-10 border-t border-white/10">
                  <div className="space-y-1">
                    <p className="text-[8px] tracking-[0.4em] uppercase text-white/30">Verified</p>
                    <p className="text-[9px] tracking-widest text-white/70 italic">UTARAN Authentic</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[8px] tracking-[0.4em] uppercase text-white/30">Privacy</p>
                    <p className="text-[9px] tracking-widest text-white/70 italic">Secure Data</p>
                  </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="mt-auto px-12 py-8 border-t border-white/10 flex justify-between items-center text-[9px] tracking-[0.6em] uppercase text-white/40 font-medium">
         <span>Utaran Studio Bag Management</span>
         <span className="hidden sm:block">Archive Collection MMXXVI</span>
      </footer>
    </main>
  );
}