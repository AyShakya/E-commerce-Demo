import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminRefunds from "./AdminRefunds";

const TABS = [
  { key: "orders", label: "Orders" },
  { key: "products", label: "Products" },
  { key: "refunds", label: "Refunds" },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState("orders");

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-[#1f1f1f] p-6 flex flex-col">
        <h1 className="text-lg tracking-widest uppercase mb-10">
          Utaran Admin
        </h1>

        <nav className="flex flex-col gap-2 flex-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`text-left px-4 py-2 text-sm tracking-wide transition
                ${
                  tab === key
                    ? "bg-white text-black"
                    : "text-gray-400 hover:text-white hover:bg-[#1c1c1c]"
                }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="mt-10 text-sm tracking-wide text-red-400 hover:text-red-300 transition"
        >
          Logout
        </button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-10 bg-[#0b0b0b] overflow-hidden flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          {tab === "orders" && <AdminOrders />}
          {tab === "products" && <AdminProducts />}
          {tab === "refunds" && <AdminRefunds />}
        </div>
      </main>
    </div>
  );
}
