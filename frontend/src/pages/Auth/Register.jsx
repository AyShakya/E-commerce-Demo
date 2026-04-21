import { useState } from "react";
import { registerUser } from "../../api/auth.api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: {
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
    },
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm({
        ...form,
        address: { ...form.address, [key]: value },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "peer w-full bg-transparent border-b border-white/10 py-3 text-base text-white focus:border-white outline-none transition-all duration-500 placeholder-transparent";
  const labelClass = "absolute left-0 -top-3.5 text-[9px] uppercase tracking-[0.4em] text-white/40 font-bold transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-[10px] peer-placeholder-shown:text-white/20 peer-focus:-top-3.5 peer-focus:text-[9px] peer-focus:text-white";

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6 py-20 selection:bg-white selection:text-black relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[600px] relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <span className="text-[10px] tracking-[0.6em] uppercase text-white/40 font-bold block mb-4">
            New Archive Entry
          </span>
          <h1 className="text-5xl md:text-6xl font-serif italic tracking-tighter text-white mb-2">
            Membership
          </h1>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent mx-auto mt-6" />
        </div>

        {/* CARD CONTAINER */}
        <div className="bg-[#0a0a0a] border border-white/10 p-10 md:p-14 shadow-2xl relative group transition-all duration-700 hover:border-white/20">
          
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40" />

          {error && (
            <div className="mb-10 bg-red-500/5 border-l-2 border-red-500 p-4 flex items-center gap-3 animate-pulse">
              <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Error:</span>
              <span className="text-red-400/80 text-xs tracking-wide">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* IDENTITY SECTION */}
            <div className="space-y-8">
              <div className="group relative">
                <input
                  name="name"
                  id="name"
                  placeholder="Full Name"
                  className={inputClass}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="name" className={labelClass}>Full Name</label>
              </div>

              <div className="group relative">
                <input
                  name="email"
                  id="email"
                  placeholder="Email Address"
                  className={inputClass}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="email" className={labelClass}>Email Address</label>
              </div>

              <div className="group relative">
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  className={inputClass}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="password" className={labelClass}>Passkey</label>
              </div>
            </div>

            {/* SHIPPING SECTION */}
            <div className="space-y-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-1 h-1 bg-white/40 rounded-full" />
                <h3 className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-bold">Shipping Ledger - Optional</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group relative">
                  <input
                    name="address.fullName"
                    id="addr_name"
                    placeholder="Recipient"
                    className={inputClass}
                    onChange={handleChange}
                  />
                  <label htmlFor="addr_name" className={labelClass}>Recipient</label>
                </div>

                <div className="group relative">
                  <input
                    name="address.phone"
                    id="phone"
                    placeholder="Contact"
                    className={inputClass}
                    onChange={handleChange}
                  />
                  <label htmlFor="phone" className={labelClass}>Contact Phone</label>
                </div>

                <div className="group relative md:col-span-2">
                  <input
                    name="address.line1"
                    id="line1"
                    placeholder="Address Line 1"
                    className={inputClass}
                    onChange={handleChange}
                  />
                  <label htmlFor="line1" className={labelClass}>Address Line 1</label>
                </div>

                <div className="group relative md:col-span-2">
                  <input
                    name="address.line2"
                    id="line2"
                    placeholder="Address Line 2"
                    className={inputClass}
                    onChange={handleChange}
                  />
                  <label htmlFor="line2" className={labelClass}>Address Line 2 (Optional)</label>
                </div>

                <div className="group relative">
                  <input
                    name="address.city"
                    id="city"
                    placeholder="City"
                    className={inputClass}
                    onChange={handleChange}
                  />
                  <label htmlFor="city" className={labelClass}>City</label>
                </div>

                <div className="group relative">
                  <input
                    name="address.state"
                    id="state"
                    placeholder="State"
                    className={inputClass}
                    onChange={handleChange}
                  />
                  <label htmlFor="state" className={labelClass}>State</label>
                </div>

                <div className="group relative">
                  <input
                    name="address.postalCode"
                    id="zip"
                    placeholder="Postal Code"
                    className={inputClass}
                    onChange={handleChange}
                  />
                  <label htmlFor="zip" className={labelClass}>Postal Code</label>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              disabled={loading}
              className="group w-full py-6 bg-white text-black mt-8 relative overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              <div className="absolute inset-0 bg-gray-200 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] group-hover:tracking-[0.6em] transition-all duration-500">
                {loading ? "Registering..." : "Initiate Membership"}
              </span>
            </button>

          </form>
        </div>

        {/* FOOTER */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase">
            Already in the Archive?
          </p>
          <Link 
            to="/login" 
            className="inline-block text-[10px] tracking-[0.4em] uppercase text-white border-b border-white/30 pb-1 hover:border-white transition-all hover:text-white/90"
          >
            Access Portal
          </Link>
        </div>

      </div>
    </main>
  );
}