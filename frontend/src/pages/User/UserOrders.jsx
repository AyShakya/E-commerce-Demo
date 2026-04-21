import { useEffect, useState } from "react";
import { getMyOrders } from "../../api/order.api";

const formatCurrency = (value) => {
  if (typeof value !== "number") value = Number(value) || 0;
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

// Premium Glass-morphism Badges
const statusBadgeColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("deliver")) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.1)]";
  if (s.includes("ship") || s.includes("dispatch")) return "text-amber-300 border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.1)]";
  if (s.includes("confirm") || s.includes("process")) return "text-blue-300 border-blue-500/30 bg-blue-500/10 shadow-[0_0_15px_rgba(96,165,250,0.1)]";
  return "text-white/60 border-white/20 bg-white/5";
};

const paymentBadgeColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("paid")) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (s.includes("pending")) return "text-orange-300 border-orange-500/30 bg-orange-500/10";
  return "text-white/60 border-white/20";
};

const OrderTimeline = ({ status }) => {
  const steps = [
    { key: "pending", label: "Manifested" },
    { key: "confirmed", label: "Curating" },
    { key: "shipped", label: "In Transit" },
    { key: "delivered", label: "Arrived" },
  ];

  const normalize = (s = "") => {
    const t = String(s).toLowerCase();
    if (t.includes("pending")) return "pending";
    if (t.includes("confirm") || t.includes("process")) return "confirmed";
    if (t.includes("ship")) return "shipped";
    if (t.includes("deliver")) return "delivered";
    return "pending";
  };

  const currentKey = normalize(status);
  const currentIndex = steps.findIndex((s) => s.key === currentKey);

  return (
    <div className="w-full py-8">
      {/* Grid Layout for Timeline to prevent overlap */}
      <div className="relative">
        {/* Line */}
        <div className="absolute top-[5px] left-0 w-full h-[1px] bg-white/10" />
        <div 
          className="absolute top-[5px] left-0 h-[1px] bg-white transition-all duration-1000 ease-out"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />
        
        {/* Nodes - Flex for positioning dots exactly on the line */}
        <div className="flex justify-between relative z-10 mb-6">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div key={step.key} className="flex flex-col items-center w-4">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-[0.8s] ${
                    isCompleted ? "bg-white shadow-[0_0_10px_white]" : "bg-[#0a0a0a] border border-white/20"
                  } ${isCurrent ? "scale-150 ring-[3px] ring-white/10" : ""}`}
                />
              </div>
            );
          })}
        </div>

        {/* Labels - Grid for perfect spacing without overlap */}
        <div className="grid grid-cols-4 text-center">
          {steps.map((step, idx) => {
            const isCurrent = idx === currentIndex;
            // Alignment logic: First left, Last right, Middle centered
            const alignClass = idx === 0 ? 'text-left -ml-2' : idx === steps.length - 1 ? 'text-right -mr-2' : 'text-center';
            
            return (
              <div key={step.key} className={`transition-all duration-500 ${alignClass} ${isCurrent ? 'opacity-100' : 'opacity-40'}`}>
                <span className={`text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-bold block ${isCurrent ? 'text-white' : 'text-white/60'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const res = await getMyOrders();
      setOrders(res.data);
    } catch {
      console.error("Archive Access Denied");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin shadow-[0_0_20px_white]" />
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-32 border border-white/5 bg-white/[0.01]">
      <p className="text-white/40 uppercase tracking-[0.6em] text-[10px]">Your archive is currently empty</p>
    </div>
  );

  return (
    <div className="space-y-24 pb-32">
      <header className="mb-16 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h3 className="text-[10px] tracking-[0.6em] uppercase text-white/50 mb-3 font-bold">Record History</h3>
          <h1 className="text-5xl font-serif italic tracking-tighter text-white">Order Archive</h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="h-px w-10 bg-white/20"></div>
           <span className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-medium">{orders.length} Records Found</span>
        </div>
      </header>

      {orders.map((order) => (
        <div 
          key={order._id} 
          className="group bg-[#0a0a0a] border border-white/10 hover:border-white/30 transition-all duration-[0.5s] ease-out hover:shadow-[0_20px_80px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col"
        >
          {/* Decorative Glow on Hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Header Bar */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center px-10 py-8 border-b border-white/10 bg-white/[0.02] gap-8 relative z-10">
            <div className="flex flex-wrap gap-12">
              <div>
                <p className="text-[9px] text-white/40 uppercase tracking-[0.6em] mb-1 font-bold">Ref ID</p>
                <p className="text-sm font-black text-white tracking-[0.1em] uppercase">ARK-{order._id.slice(-6)}</p>
              </div>
              <div>
                <p className="text-[9px] text-white/40 uppercase tracking-[0.6em] mb-1 font-bold">Date</p>
                <p className="text-sm font-bold text-white tracking-[0.1em] uppercase">
                  {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex flex-col items-end">
                 <p className="text-[8px] text-white/30 uppercase tracking-[0.3em] mb-1">Status</p>
                 <span className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] border rounded-full ${statusBadgeColor(order.fulfillmentStatus)}`}>
                    {order.fulfillmentStatus}
                 </span>
              </div>
              <div className="flex flex-col items-end">
                 <p className="text-[8px] text-white/30 uppercase tracking-[0.3em] mb-1">Payment</p>
                 <span className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] border rounded-full ${paymentBadgeColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                 </span>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative z-10">
            
            {/* ITEMS LIST */}
            <div className="lg:col-span-5 space-y-8 lg:pr-10 lg:border-r border-white/10">
              <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] mb-4 font-bold">Manifest Items</p>
              {order.items.map((item, idx) => (
                <div key={idx} className="group/item flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-white uppercase tracking-tight leading-none group-hover/item:text-white/70 transition-colors cursor-default">
                      {item.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] text-white/50 uppercase tracking-[0.2em] font-medium">
                    <span className="text-white">Qty: {item.quantity}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>Archive Collection</span>
                  </div>
                  
                  <div className="h-px w-full bg-white/5 mt-4 group-hover/item:bg-white/20 transition-colors duration-500" />
                </div>
              ))}
            </div>

            {/* STATUS & TIMELINE */}
            <div className="lg:col-span-4 w-full flex flex-col gap-8 pt-2">
               <div className="flex justify-between items-end">
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-bold">Tracking Status</p>
               </div>
               <OrderTimeline status={order.fulfillmentStatus} />
            </div>

            {/* TOTAL */}
            <div className="lg:col-span-3 flex flex-col justify-between h-full items-end text-right pt-2">
              <div>
                <p className="text-[9px] text-white/40 uppercase tracking-[0.6em] mb-3 font-black">Total Value</p>
                <p className="text-4xl font-serif italic text-white tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">
                  {formatCurrency(order.totalAmount)}
                </p>
                <p className="text-[9px] text-white/30 uppercase tracking-widest mt-2">Paid via Razorpay</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}