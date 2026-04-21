import { useState } from "react";

export default function Contact() {
  const [copied, setCopied] = useState("");

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black antialiased py-24 px-6 md:px-12 overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-20">
        <header className="text-center space-y-6">
          <span className="text-[10px] tracking-[0.8em] uppercase text-white/40 font-bold block">
            Studio
          </span>
          <h1 className="text-7xl md:text-9xl font-serif italic tracking-tighter text-white">
            The Studio
          </h1>
          <div className="w-px h-24 bg-gradient-to-b from-white/20 to-transparent mx-auto" />
        </header>

        <section className="bg-white/[0.02] border border-white/10 p-10 md:p-14 space-y-8">
          <h2 className="text-3xl md:text-4xl font-serif italic text-white">Contact</h2>
          <p className="text-sm text-white/60 leading-relaxed font-light">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>

          <div className="grid sm:grid-cols-2 gap-8 pt-6 border-t border-white/10">
            <button
              type="button"
              className="text-left group"
              onClick={() => handleCopy("lorem@studio.com", "email")}
            >
              <p className="text-[9px] tracking-[0.4em] uppercase text-white/40 mb-3 font-bold group-hover:text-white transition-colors">
                Email
              </p>
              <p className="text-2xl font-serif italic text-white group-hover:opacity-80 transition-all">
                lorem@studio.com
              </p>
              <p className="text-[9px] text-white/30 mt-2 h-4 uppercase tracking-widest">
                {copied === "email" ? "Copied" : "Click to Copy"}
              </p>
            </button>

            <button
              type="button"
              className="text-left group"
              onClick={() => handleCopy("+00 00000 00000", "phone")}
            >
              <p className="text-[9px] tracking-[0.4em] uppercase text-white/40 mb-3 font-bold group-hover:text-white transition-colors">
                Phone
              </p>
              <p className="text-2xl font-serif italic text-white group-hover:opacity-80 transition-all">
                +00 00000 00000
              </p>
              <p className="text-[9px] text-white/30 mt-2 h-4 uppercase tracking-widest">
                {copied === "phone" ? "Copied" : "Click to Copy"}
              </p>
            </button>
          </div>
        </section>

        <section className="border-t border-white/10 pt-12">
          <p className="text-[13px] text-white/50 leading-relaxed max-w-2xl font-light">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </section>
      </div>
    </main>
  );
}
