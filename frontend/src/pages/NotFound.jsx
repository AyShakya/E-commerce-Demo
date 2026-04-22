import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
      <div className="max-w-lg text-center space-y-7 border border-white/10 bg-white/[0.02] p-10">
        <span className="text-[10px] tracking-[0.6em] uppercase text-white/50 block">
          Error 404
        </span>
        <h1 className="text-5xl font-serif italic tracking-tight">Page Not Found</h1>
        <p className="text-sm text-white/65 leading-relaxed">
          This route does not exist or has moved.
        </p>
        <div className="flex justify-center">
          <Link
            to="/"
            className="px-7 py-3 border border-white/30 text-[10px] uppercase tracking-[0.35em] hover:bg-white hover:text-black transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
