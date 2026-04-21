import { useLocation, useNavigate, Link } from "react-router-dom";
import { createPayment } from "../api/payment.api";
import { fetchProductById } from "../api/product.api";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { productId, quantity } = state || {};

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!productId) {
      navigate("/products");
      return;
    }

    fetchProductById(productId)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [productId, navigate]);

  const total = product ? product.price * quantity : 0;

  const handlePayment = async () => {
    if (!user.address || processing) return;
    setProcessing(true);

    try {
      const payment = await createPayment({ productId, quantity });

      const razorpay = new window.Razorpay({
        key: payment.key,
        amount: payment.amount,
        currency: payment.currency,
        name: "UTARAN",
        description: `Secured Archive: ${product.title}`,
        order_id: payment.razorpayOrderId,
        handler: () => navigate("/dashboard"),
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.address?.phone,
        },
        theme: { color: "#000000" },
      });

      razorpay.open();
    } catch (err) {
      alert(err.response?.data?.message || "Payment initiation failed");
      setProcessing(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="h-screen bg-[#080808] text-white flex items-center justify-center font-serif italic text-xl tracking-[0.2em] animate-pulse">
        Finalizing Manifest...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black antialiased overflow-x-hidden flex flex-col items-center">
      <style>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0px rgba(255,255,255,0); }
          50% { box-shadow: 0 0 25px rgba(255,255,255,0.15); }
          100% { box-shadow: 0 0 0px rgba(255,255,255,0); }
        }
        .btn-authorize {
          transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          animation: pulseGlow 3s infinite ease-in-out;
        }
        .btn-authorize:hover:not(:disabled) {
          letter-spacing: 0.8em;
          background-color: #f0f0f0;
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(255,255,255,0.2);
        }
      `}</style>

      {/* Centered Content Container */}
      <div className="w-full max-w-[1200px] px-8 md:px-16 py-24 flex flex-col items-center">
        {/* EDITORIAL HEADER */}
        <header className="mb-24 text-center w-full">
          <span className="text-[11px] tracking-[1em] uppercase text-white/50 mb-6 block font-bold">
            Archive Procurement
          </span>
          <h1 className="text-7xl md:text-9xl font-serif italic mb-10 tracking-tighter">
            Checkout
          </h1>
          <div className="w-24 h-px bg-white/40 mx-auto" />
        </header>

        {/* Centered Symmetrical Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start w-full">
          {/* LEFT: DESTINATION & PROTOCOL */}
          <div className="space-y-16 w-full">
            <section className="bg-[#0a0a0a] p-10 md:p-12 border border-white/10 relative shadow-2xl group hover:border-white/20 transition-all duration-700">
              <h2 className="text-[11px] tracking-[0.6em] uppercase text-white font-black mb-10 border-b border-white/10 pb-6">
                Delivery Destination
              </h2>

              {user.address ? (
                <div className="space-y-4">
                  <p className="text-xl text-white font-medium tracking-tight uppercase">
                    {user.address.fullName}
                  </p>
                  <p className="text-base leading-relaxed text-white/70 italic font-light">
                    {user.address.line1} <br />
                    {user.address.city}, {user.address.state} <br />
                    <span className="text-white/40 not-italic tracking-widest text-xs mt-4 block uppercase font-bold">
                      Contact: {user.address.phone}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="py-6 space-y-6">
                  <p className="text-sm text-red-500 font-bold uppercase tracking-widest italic">
                    Missing delivery profile.
                  </p>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="text-[10px] tracking-[0.4em] uppercase text-white border-b-2 border-white/60 pb-1 hover:text-red-400 hover:border-red-400 transition-all"
                  >
                    Configure Destination
                  </button>
                </div>
              )}
            </section>

            {/* SECURITY TRUST MARKERS */}
            <div className="px-6 space-y-8">
              <div className="flex gap-6 items-center">
                <div className="w-12 h-px bg-white/40" />
                <span className="text-[10px] tracking-[0.5em] uppercase text-white/80">
                  Secured Archive Protocol
                </span>
              </div>
              <p className="text-[12px] text-white/50 leading-loose italic max-w-sm">
                Your acquisition is protected by 256-bit industrial encryption.
                Each piece is authenticated and manually inspected at our Studio
                before transit.
              </p>
            </div>
          </div>

          {/* RIGHT: SUMMARY & AUTHORIZATION */}
          <div className="space-y-16 w-full">
            <section className="bg-[#0a0a0a] p-10 md:p-12 border border-white/10 shadow-2xl group hover:border-white/20 transition-all duration-700">
              <h2 className="text-[11px] tracking-[0.6em] uppercase text-white font-black mb-10 border-b border-white/10 pb-6">
                Final Manifest
              </h2>

              <div className="flex gap-8 mb-10">
                <div className="w-24 h-32 bg-[#080808] border border-white/10 overflow-hidden flex-shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                  />
                </div>
                <div className="space-y-3 py-1 flex-1">
                  <h3 className="text-lg tracking-widest uppercase text-white font-bold">
                    {product.title}
                  </h3>
                  <p className="text-[10px] text-white/50 italic uppercase tracking-widest">
                    Quantity: {quantity} • Limited Piece
                  </p>
                  <p className="text-xl text-white/90 font-serif italic">
                    ₹{product.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-10 space-y-5">
                <div className="flex justify-between items-center text-[11px] tracking-[0.4em] uppercase text-white/60">
                  <span>Archive Subtotal</span>
                  <span className="text-white">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] tracking-[0.4em] uppercase text-white/60">
                  <span>Priority Sourcing</span>
                  <span className="italic text-white/40">Complimentary</span>
                </div>
                <div className="border-t border-white/30 pt-8 mt-6 flex justify-between items-center">
                  <span className="text-xs tracking-[0.8em] uppercase text-white font-black">
                    Total
                  </span>
                  <span className="text-4xl font-serif italic text-white tracking-tighter shadow-white/10 drop-shadow-md">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* DOMESTIC PAYMENT CTA */}
            {/* <div className="space-y-8 w-full">
              <button
                onClick={handlePayment}
                disabled={!user.address || processing}
                className="btn-authorize w-full py-7 bg-white text-black text-[12px] tracking-[0.6em] uppercase font-black disabled:opacity-20 disabled:grayscale cursor-pointer"
              >
                {processing
                  ? "Establishing Connection..."
                  : "Authorize Payment (India)"}
              </button>

              <div className="flex flex-col items-center gap-4">
                <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-medium">
                  Secured by Razorpay • Domestic Gateway
                </p>
              </div>
            </div> */}

            <div className="space-y-8 w-full">
              {/* 1. Disabled Button */}
              <button
                disabled={true}
                className="btn-authorize w-full py-7 bg-zinc-800 text-white/30 text-[12px] tracking-[0.6em] uppercase font-black cursor-not-allowed border border-white/5"
              >
                Gateway Offline
              </button>

              {/* 2. Error Note & Admin Contact */}
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-[10px] tracking-[0.2em] uppercase text-red-500 font-bold animate-pulse">
                  ⚠ Payment Systems Currently Unavailable
                </p>

                <p className="text-[11px] text-white/50 leading-relaxed max-w-xs">
                  To secure this archive manually, please initialize a direct
                  transfer request.
                </p>

                {/* Optional: Link to contact page or email */}
                <Link
                  to="/contact"
                  className="text-[10px] tracking-[0.4em] uppercase text-white border-b border-white/30 pb-1 hover:text-red-400 hover:border-red-400 transition-colors"
                >
                  Contact Administration →
                </Link>
              </div>
            </div>

            {/* INTERNATIONAL PROTOCOL */}
            <div className="pt-8 border-t border-white/10">
              <div className="bg-white/[0.02] border border-white/5 p-8 relative overflow-hidden group/int hover:border-white/20 transition-all duration-500">
                <div className="flex items-start gap-6">
                  <div className="mt-1 w-2 h-2 rounded-full bg-white animate-pulse" />
                  <div className="space-y-4">
                    <h4 className="text-[11px] uppercase tracking-[0.4em] text-white font-black">
                      International Acquisitions
                    </h4>
                    <p className="text-[12px] text-white/60 leading-relaxed font-light">
                      Shipping outside India follows a distinct protocol. Please
                      contact the Studio to arrange a custom international
                      invoice (via PayPal/SWIFT) and specialized logistics.
                    </p>
                    <Link
                      to="/contact"
                      className="inline-block mt-2 text-[10px] uppercase tracking-[0.3em] text-white border-b border-white/30 pb-1 hover:border-white hover:text-white transition-all"
                    >
                      Contact for Global Shipping →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-auto w-full px-16 py-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] tracking-[0.8em] uppercase text-white/30 font-bold">
        <span>Utaran Studio © 2026</span>
        <span className="hidden sm:block">Archive Management Protocol</span>
      </footer>
    </main>
  );
}
