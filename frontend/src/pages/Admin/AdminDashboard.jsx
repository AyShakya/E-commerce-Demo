import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminRefunds from "./AdminRefunds";

const TABS = [
  {
    key: "orders",
    label: "Orders",
    title: "Order Control",
    subtitle: "Track fulfillment and payment lifecycle",
  },
  {
    key: "products",
    label: "Products",
    title: "Product Management",
    subtitle: "Create, archive, restore and update catalog",
  },
  {
    key: "refunds",
    label: "Refunds",
    title: "Refund Desk",
    subtitle: "Monitor and triage refund operations",
  },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState("orders");

  const activeTab = TABS.find((item) => item.key === tab) || TABS[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-white selection:text-black">
      <aside className="w-full md:w-72 md:min-h-screen border-b md:border-b-0 md:border-r border-white/10 p-8 md:p-12 flex flex-col bg-[#080808] relative z-20">
        <div className="mb-10 md:mb-24">
          <h1 className="text-[9px] tracking-[0.6em] uppercase text-white/40 mb-3 font-bold">
            Workspace
          </h1>
          <p className="font-serif italic text-3xl tracking-tighter text-white">
            Admin Console
          </p>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible no-scrollbar">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`text-left px-5 py-4 text-[10px] tracking-[0.4em] uppercase transition-all duration-500 whitespace-nowrap flex items-center gap-4 group ${
                tab === key
                  ? "text-white bg-white/[0.05] border-l-2 border-white pl-8"
                  : "text-white/30 hover:text-white hover:bg-white/[0.02] border-l-2 border-transparent hover:pl-8"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  tab === key
                    ? "bg-white shadow-[0_0_10px_white]"
                    : "bg-white/10 group-hover:bg-white/50"
                }`}
              ></span>
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={logout}
          className="hidden md:flex text-[9px] tracking-[0.5em] uppercase text-white/20 hover:text-red-500 transition-all duration-500 pt-10 border-t border-white/10 items-center justify-between group mt-auto hover:pl-2"
        >
          <span>Terminate</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-20 bg-[#050505] overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
          <header className="border-b border-white/20 pb-8 flex flex-col gap-2">
            <h2 className="text-4xl font-serif italic tracking-tight text-white">
              {activeTab.title}
            </h2>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/40">
              {activeTab.subtitle}
            </p>
          </header>

          <div className="min-h-[60vh]">
            {tab === "orders" && <AdminOrders />}
            {tab === "products" && <AdminProducts />}
            {tab === "refunds" && <AdminRefunds />}
          </div>
        </div>
      </main>
    </div>
  );
}
