import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import UserOrders from "./UserOrders";

const TABS = [
  { key: "profile", label: "Identity" },
  { key: "address", label: "Ledger" },
  { key: "orders", label: "Archive" },
];

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("profile");
  const [address, setAddress] = useState(user.address || {});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const saveAddress = async () => {
    try {
      await api.put("/users/me/address", address);
      setMessage("Ledger Synchronized");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Sync Failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-white selection:text-black">
      {/* SIDEBAR */}
      <aside className="w-full md:w-72 md:min-h-screen border-b md:border-b-0 md:border-r border-white/10 p-8 md:p-12 flex flex-col bg-[#080808] relative z-20">
        <div className="mb-10 md:mb-24">
          <h1 className="text-[9px] tracking-[0.6em] uppercase text-white/40 mb-3 font-bold">Workspace</h1>
          <p className="font-serif italic text-3xl tracking-tighter text-white">Console</p>
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
              <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${tab === key ? 'bg-white shadow-[0_0_10px_white]' : 'bg-white/10 group-hover:bg-white/50'}`}></span>
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

      {/* CONTENT AREA */}
      <main className="flex-1 p-6 md:p-20 bg-[#050505] overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
          
          {/* PROFILE */}
          {tab === "profile" && (
            <section className="space-y-16 animate-fade-in">
              <header className="border-b border-white/20 pb-8 flex flex-col gap-2">
                <h2 className="text-4xl font-serif italic tracking-tight text-white">Profile Identity</h2>
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/40">Personal Data Points</p>
              </header>
              
              <div className="grid gap-12">
                {[
                  { label: "Client Name", value: user.name },
                  { label: "Authorized Email", value: user.email },
                  { label: "Registered Phone", value: address.phone || user.address?.phone || "Not Set" }
                ].map((item) => (
                  <div key={item.label} className="group border-b border-white/10 pb-6 hover:border-white/30 transition-colors duration-500">
                    <span className="text-[9px] uppercase tracking-[0.6em] text-white/40 block mb-3 font-bold group-hover:text-white/60 transition-colors">{item.label}</span>
                    <span className="text-xl text-white/90 font-light tracking-wide">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ADDRESS */}
          {tab === "address" && (
            <section className="space-y-16 animate-fade-in">
               <header className="border-b border-white/20 pb-8 flex flex-col gap-2">
                <h2 className="text-4xl font-serif italic tracking-tight text-white">Shipping Ledger</h2>
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/40">Logistics Data</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                {[
                  { label: "Full Name", name: "fullName" },
                  { label: "Contact Phone", name: "phone" },
                  { label: "Address Line 1", name: "line1", span: true },
                  { label: "Address Line 2", name: "line2", span: true },
                  { label: "City / District", name: "city" },
                  { label: "Postal Code", name: "postalCode" }
                ].map((field) => (
                  <div key={field.name} className={`flex flex-col gap-4 ${field.span ? 'md:col-span-2' : ''}`}>
                    <label className="text-[9px] uppercase tracking-[0.5em] text-white/50 font-bold">{field.label}</label>
                    <input
                      name={field.name}
                      value={address[field.name] || ""}
                      onChange={handleChange}
                      className="bg-transparent border-b border-white/10 py-3 text-base text-white focus:border-white outline-none transition-all duration-500 placeholder:text-white/10 hover:border-white/30 font-light tracking-wide w-full focus:pl-2"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-20 flex flex-col md:flex-row items-center gap-12">
                <button
                  onClick={saveAddress}
                  className="group w-full md:w-auto bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] px-16 py-5 hover:bg-white/90 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                >
                  <span className="group-hover:tracking-[0.6em] transition-all duration-500">Update Entry</span>
                </button>
                {message && (
                  <p className="text-[9px] text-white font-bold tracking-[0.3em] uppercase italic animate-pulse border-b border-white/60 pb-1">{message}</p>
                )}
              </div>
            </section>
          )}

          {/* ORDERS */}
          {tab === "orders" && (
            <div className="space-y-16 animate-fade-in">
              {/* REFUND NOTICE */}
              <div className="bg-gradient-to-r from-white/[0.03] to-transparent border-l-[3px] border-white p-8 md:p-10 hover:bg-white/[0.05] transition-colors duration-700">
                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white] animate-pulse" />
                    <span className="text-[9px] tracking-[0.5em] uppercase text-white font-black">
                      Protocol 07
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif italic text-white">Refund Policy Notice</h3>
                    <p className="text-[13px] text-white/70 leading-relaxed tracking-wide font-light max-w-2xl">
                      Refunds are strictly processed <span className="text-white font-bold border-b border-white/30">pre-dispatch</span>. Once the archive item is in transit, the manifest is locked. 
                      For urgent signals, contact <span className="text-white font-bold cursor-pointer hover:underline underline-offset-4 decoration-white/50">Utaran Support</span>.
                    </p>
                  </div>
                </div>
              </div>

              <UserOrders />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}