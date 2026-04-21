import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api/product.api";

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    document.title = "UTARAN — Contemporary Fashion";
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      const res = await fetchProducts({ page: 1, limit: 6 });
      setFeatured(res.data);
    } catch {
      console.error("Failed to load featured products");
    }
  };

  const CATEGORIES = [
    { label: "Clothing", image: "v1769428087/photo-1523381210434-271e8be1f52b_efjya5.jpg" },
    { label: "Footwear", image: "v1769428092/photo-1525966222134-fcfa99b8ae77_jfanrx.jpg" },
    { label: "Accessories", image: "v1769428082/photo-1511556820780-d912e42b4980_lzrecf.jpg" },
  ];

  const getOptimizedUrl = (url, width = 800) => 
    `https://res.cloudinary.com/dwp1yaelk/image/upload/f_auto,q_auto,w_${width},c_scale/${url}`;

  return (
    <main className="bg-[#080808] text-white selection:bg-white selection:text-black antialiased overflow-x-hidden">
      <style>{`
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-reveal {
          animation: revealUp 1s cubic-bezier(0.19, 1, 0.22, 1) forwards;
          opacity: 0;
        }
        
        /* UPDATED: Consistent Row Symmetry (Up, Down, Up) */
        /* Targets the 2nd, 5th, 8th... items */
        .staggered-item:nth-child(3n+2) {
          transform: translateY(120px);
        }

        @media (max-width: 1024px) {
           .staggered-item:nth-child(even) {
              transform: translateY(60px);
           }
           .staggered-item:nth-child(3n+2) {
              transform: translateY(0);
           }
        }

        @media (max-width: 768px) {
          .staggered-item {
            transform: translateY(0) !important;
          }
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="relative w-full h-[95vh] flex items-center justify-center bg-[#080808]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/dwp1yaelk/image/upload/f_auto,q_auto,w_1920/v1770449237/ChatGPT_Image_Feb_7_2026_12_54_27_PM_h7otiq.png"
            alt="Hero"
            className="h-full w-full object-cover object-[center_20%] opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#080808]" />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <span className="animate-reveal text-[10px] tracking-[0.6em] uppercase text-white/90 mb-6 block" style={{ animationDelay: '0.2s' }}>
            New Collection 2026
          </span>
          <h1 className="animate-reveal text-7xl md:text-[10rem] font-serif italic leading-none mb-8 tracking-tighter" style={{ animationDelay: '0.4s' }}>
            Utaran
          </h1>
          <p className="animate-reveal text-gray-300 text-[11px] md:text-sm tracking-[0.2em] uppercase max-w-lg mx-auto leading-loose mb-12 drop-shadow-md" style={{ animationDelay: '0.6s' }}>
            Contemporary fashion rooted in craftsmanship, <br/> sustainability, and understated elegance.
          </p>
          
          <div className="animate-reveal" style={{ animationDelay: '0.8s' }}>
            <Link
              to="/products"
              onClick={scrollToTop}
              className="group relative inline-block px-12 py-4 border border-white/20 overflow-hidden transition-all duration-500"
            >
              <span className="relative z-10 text-[10px] tracking-[0.4em] uppercase group-hover:text-black transition-colors">
                Shop The Look
              </span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED STAGGERED GRID */}
      <section className="max-w-[1400px] mx-auto px-8 py-32 md:pb-80">
        <div className="mb-32 text-center">
            <h2 className="text-4xl md:text-6xl font-serif italic mb-6">Featured Collection</h2>
            <div className="flex justify-center items-center gap-6 text-[9px] tracking-[0.4em] uppercase text-gray-500">
              <span className="w-12 h-px bg-gray-800" />
              <span>Limited Release 2026</span>
              <span className="w-12 h-px bg-gray-800" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-48">
          {featured.map((product) => (
            <Link 
              key={product._id} 
              to={`/products/${product._id}`} 
              className="staggered-item group relative block transition-all duration-500"
            >
              <div className="bg-[#111] p-5 rounded-sm group-hover:bg-[#151515] transition-colors duration-500">
                <div className="relative aspect-[4/5] overflow-hidden mb-8 shadow-2xl">
                    <img
                    src={product.images[0]}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    alt={product.title}
                    />
                    <div className="absolute top-4 left-4">
                    <span className="bg-white text-black px-3 py-1 text-[8px] font-bold tracking-[0.1em] uppercase rounded-sm">
                        New
                    </span>
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div className="max-w-[70%]">
                    <h3 className="text-sm tracking-tight text-white/90 font-medium mb-1 truncate">
                        {product.title}
                    </h3>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase">
                        Signature Line
                    </p>
                    </div>

                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full border border-white/10 text-[11px] font-medium group-hover:bg-white group-hover:text-black transition-all duration-500">
                    ₹{product.price.toLocaleString()}
                    </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORIES SECTION - Updated with Headings */}
      <section className="bg-[#0c0c0c] py-48 px-4">
        <div className="max-w-[1500px] mx-auto">
          <div className="text-center mb-24">
             <h2 className="text-[10px] tracking-[0.6em] uppercase text-gray-500 mb-4 block">Shop by category</h2>
             <p className="text-3xl font-serif italic">Curated Essentials</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {CATEGORIES.map((cat) => (
              <Link key={cat.label} to={`/products?category=${cat.label}`} className="group relative h-[70vh] overflow-hidden">
                <img
                  src={getOptimizedUrl(cat.image, 1000)}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-serif italic tracking-widest translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    {cat.label}
                  </span>
                  <div className="h-px w-0 group-hover:w-16 bg-white mt-4 transition-all duration-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-48 grid md:grid-cols-2 gap-24 items-center">
        <div className="aspect-[4/5] overflow-hidden bg-[#121212]">
          <img
            src="https://res.cloudinary.com/dwp1yaelk/image/upload/v1769428079/photo-1503341455253-b2e723bb3dbb_bo05pb.jpg"
            alt="Story"
            className="w-full h-full object-cover opacity-80"
          />
        </div>
        <div className="space-y-8">
          <h2 className="text-5xl font-serif italic leading-tight">Our Philosophy</h2>
          <p className="text-gray-400 leading-loose text-sm tracking-wide">
            Utaran is more than a label. It is a commitment to the art of dressing well. 
            We source only the finest fabrics and work with artisans who share our 
            vision for a more intentional, timeless wardrobe.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-white mb-2">Materials</p>
              <p className="text-xs text-gray-500 leading-relaxed font-light">Sourced from certified organic partners globally.</p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-white mb-2">Ethics</p>
              <p className="text-xs text-gray-500 leading-relaxed font-light">Fair wages and safe environments for every maker.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-32 px-8 bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-1">
              <h2 className="text-2xl font-serif italic mb-8">Utaran</h2>
              <p className="text-[11px] text-gray-500 tracking-widest leading-relaxed uppercase">
                Contemporary design for the modern individual.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.4em] uppercase mb-8 text-gray-400">Shop</h4>
              <ul className="space-y-4 text-[10px] text-gray-500 tracking-widest uppercase">
                <li><Link to="/products" className="hover:text-white transition">All Items</Link></li>
                <li><Link to="/products?category=New" className="hover:text-white transition">New Arrivals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.4em] uppercase mb-8 text-gray-400">Company</h4>
              <ul className="space-y-4 text-[10px] text-gray-500 tracking-widest uppercase">
                <li><a href="#" className="hover:text-white transition">Sustainability</a></li>
                <li><a href="#" className="hover:text-white transition">Fabric Care</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.4em] uppercase mb-8 text-gray-400">Social</h4>
              <ul className="space-y-4 text-[10px] text-gray-500 tracking-widest uppercase">
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition">Pinterest</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
            <p className="text-[9px] tracking-[0.5em] uppercase text-gray-600">
              © {new Date().getFullYear()} UTARAN STUDIO
            </p>
            <div className="flex gap-12 text-[9px] tracking-[0.5em] uppercase text-gray-600">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}