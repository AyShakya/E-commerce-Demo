import { useState } from "react";
import { Link } from "react-router-dom";

export default function Contact() {
  const [copied, setCopied] = useState("");

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black antialiased py-24 px-6 md:px-12 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-32">
        
        {/* HEADER */}
        <header className="text-center space-y-6 animate-fade-in">
          <span className="text-[10px] tracking-[0.8em] uppercase text-white/40 font-bold block">
            Directorship & Support
          </span>
          <h1 className="text-7xl md:text-9xl font-serif italic tracking-tighter text-white">
            The Studio
          </h1>
          <div className="w-px h-24 bg-gradient-to-b from-white/20 to-transparent mx-auto" />
        </header>

        {/* 1. THE DIRECTOR (PRIMARY HIGHLIGHT) */}
        <section className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-start relative">
            {/* Background Texture for emphasis */}
            <div className="absolute top-20 -left-20 text-[20rem] font-serif italic text-white/[0.01] pointer-events-none select-none -z-10 leading-none">
                Dir
            </div>

            {/* Visual - Large Scale */}
            <div className="lg:col-span-5 relative group">
                <div className="aspect-[3/4] bg-[#0a0a0a] border border-white/10 overflow-hidden relative">
                    <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
                        alt="Creative Director" 
                        className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Name Overlay */}
                    <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black to-transparent">
                        <p className="text-[10px] tracking-[0.4em] uppercase text-white/60 mb-2 font-bold border-l-2 border-white pl-3">Founder</p>
                        <h3 className="text-4xl md:text-5xl font-serif italic text-white tracking-tight">Aarav Sharma</h3>
                    </div>
                </div>
            </div>

            {/* Content - Authoritative */}
            <div className="lg:col-span-7 flex flex-col justify-center h-full space-y-12 py-8">
                <div className="space-y-8">
                    <h2 className="text-5xl md:text-6xl font-light tracking-tighter text-white/90">
                        Curating the<br/>
                        <span className="font-serif italic text-white">Permanent Archive.</span>
                    </h2>
                    <p className="text-base text-white/60 leading-loose font-light max-w-lg border-l border-white/10 pl-6">
                        Utaran stands as a singular vision of timeless design. Every piece is hand-selected, authenticated, and dispatched under the direct supervision of the studio. For private acquisitions, press inquiries, or archive styling, direct communication is maintained.
                    </p>
                </div>

                {/* Director Contact Grid */}
                <div className="grid sm:grid-cols-2 gap-12 pt-12 border-t border-white/10">
                    <div className="group cursor-pointer" onClick={() => handleCopy("contact@utaran.studio", "email")}>
                        <p className="text-[9px] tracking-[0.4em] uppercase text-white/40 mb-3 font-bold group-hover:text-white transition-colors">Electronic Mail</p>
                        <p className="text-2xl font-serif italic text-white group-hover:opacity-80 transition-all">contact@utaran.studio</p>
                        <p className="text-[9px] text-white/30 mt-2 h-4 uppercase tracking-widest">{copied === "email" ? "Copied" : "Click to Copy"}</p>
                    </div>
                    <div className="group cursor-pointer" onClick={() => handleCopy("+91 98765 43210", "phone")}>
                        <p className="text-[9px] tracking-[0.4em] uppercase text-white/40 mb-3 font-bold group-hover:text-white transition-colors">Direct Line</p>
                        <p className="text-2xl font-serif italic text-white group-hover:opacity-80 transition-all">+91 98765 43210</p>
                        <p className="text-[9px] text-white/30 mt-2 h-4 uppercase tracking-widest">{copied === "phone" ? "Copied" : "WhatsApp / Voice"}</p>
                    </div>
                </div>

                {/* Socials */}
                <div className="flex gap-6 pt-4">
                    {['Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                        <a key={social} href="#" className="text-[10px] uppercase tracking-[0.3em] text-white/50 hover:text-white border-b border-transparent hover:border-white transition-all pb-1">
                            {social}
                        </a>
                    ))}
                </div>
            </div>
        </section>

        {/* 2. REFUND POLICY (FUNCTIONAL & CLEAR) */}
        <section className="bg-white/[0.02] border border-white/5 p-10 md:p-16 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/[0.03] rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start md:items-center justify-between">
                <div className="space-y-6 max-w-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        <h3 className="text-[10px] tracking-[0.4em] uppercase text-white/60 font-bold">Studio Protocol</h3>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif italic text-white">Refunds & Inquiries</h2>
                    <p className="text-sm text-white/70 leading-relaxed font-light">
                        As Utaran operates as a curated archive, all refunds are manually processed to ensure authenticity. 
                        Please contact the Director directly via the channels above with your <span className="text-white font-medium">Ref ID</span> to signal a return.
                    </p>
                </div>
                
                <div className="flex-shrink-0">
                    <Link to="/dashboard" className="group flex items-center gap-4 px-8 py-4 border border-white/20 hover:bg-white hover:text-black transition-all duration-500">
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Access Console</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </div>
        </section>

        {/* 3. THE ARCHITECT (COLOPHON / FOOTER STYLE) */}
        <section className="border-t border-white/10 pt-20 pb-10">
            <div className="grid md:grid-cols-2 gap-12 items-end">
                
                {/* Tech Details */}
                <div className="space-y-8 order-2 md:order-1">
                    <div className="space-y-2">
                        <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 font-bold">Digital Architecture</p>
                        <h4 className="text-2xl text-white font-light">Engineered by <span className="font-serif italic">Rohan Das</span></h4>
                    </div>
                    <p className="text-[13px] text-white/50 leading-relaxed max-w-sm font-light">
                        This archive is built on a bespoke React infrastructure, designed for permanence, performance, and tactile interaction.
                    </p>
                    <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] text-white/40">
                        <a href="#" className="hover:text-white transition-colors">Portfolio</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                        <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                    </div>
                </div>

                {/* Subtle Visual */}
                <div className="flex justify-start md:justify-end order-1 md:order-2">
                    <div className="flex items-center gap-6 group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                        <div className="text-right">
                            <p className="text-[9px] tracking-[0.3em] uppercase text-white/50 mb-1">Architect</p>
                            <p className="text-lg font-serif italic text-white">Rohan Das</p>
                        </div>
                        <div className="w-16 h-16 bg-[#111] rounded-full overflow-hidden border border-white/20">
                             {/* Placeholder Image for Developer */}
                            <img 
                                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop" 
                                alt="Developer" 
                                className="w-full h-full object-cover grayscale" 
                            />
                        </div>
                    </div>
                </div>

            </div>
        </section>

      </div>
    </main>
  );
}