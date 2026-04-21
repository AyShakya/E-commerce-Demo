import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Credentials Invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6 selection:bg-white selection:text-black relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <span className="text-[10px] tracking-[0.6em] uppercase text-white/40 font-bold block mb-4">
            Identity Access
          </span>
          <h1 className="text-6xl font-serif italic tracking-tighter text-white mb-2">
            Utaran
          </h1>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent mx-auto mt-6" />
        </div>

        {/* CARD CONTAINER */}
        <div className="bg-[#0a0a0a] border border-white/10 p-10 md:p-12 shadow-2xl relative group transition-all duration-700 hover:border-white/20">
          
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

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Email Field */}
            <div className="group relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full bg-transparent border-b border-white/10 py-3 text-base text-white focus:border-white outline-none transition-all duration-500 placeholder-transparent"
                placeholder="Email Address"
                required
              />
              <label 
                htmlFor="email"
                className="absolute left-0 -top-3.5 text-[9px] uppercase tracking-[0.4em] text-white/40 font-bold transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-[10px] peer-placeholder-shown:text-white/20 peer-focus:-top-3.5 peer-focus:text-[9px] peer-focus:text-white"
              >
                Email Address
              </label>
            </div>

            {/* Password Field */}
            <div className="group relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full bg-transparent border-b border-white/10 py-3 text-base text-white focus:border-white outline-none transition-all duration-500 placeholder-transparent tracking-widest"
                placeholder="Password"
                required
              />
              <label 
                htmlFor="password"
                className="absolute left-0 -top-3.5 text-[9px] uppercase tracking-[0.4em] text-white/40 font-bold transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-[10px] peer-placeholder-shown:text-white/20 peer-focus:-top-3.5 peer-focus:text-[9px] peer-focus:text-white"
              >
                Passkey
              </label>
            </div>

            {/* Submit Action */}
            <button
              disabled={loading}
              className="group w-full py-5 bg-white text-black mt-4 relative overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gray-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] group-hover:tracking-[0.6em] transition-all duration-500">
                {loading ? "Authenticating..." : "Enter Archive"}
              </span>
            </button>

          </form>
        </div>

        {/* FOOTER */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase">
            New to the Archive?
          </p>
          <Link 
            to="/register" 
            className="inline-block text-[10px] tracking-[0.4em] uppercase text-white border-b border-white/30 pb-1 hover:border-white transition-all hover:text-white/90"
          >
            Request Access
          </Link>
        </div>

      </div>
    </main>
  );
}