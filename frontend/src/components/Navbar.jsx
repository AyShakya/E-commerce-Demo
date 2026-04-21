import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Shared Styles
  const navLinkClass = "text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 hover:text-black transition-all duration-300 hover:tracking-[0.25em]";
  
  // Mobile specific styles - larger and centered for premium feel
  const mobileLinkClass = "text-xl uppercase tracking-[0.2em] font-normal text-black hover:text-gray-500 transition-colors duration-300";
  const mobileSubLinkClass = "text-xs uppercase tracking-[0.15em] font-medium text-gray-500 hover:text-black transition-colors duration-300";

  return (
    <>
      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/[0.03]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between relative">
          
          {/* Brand Identity */}
          <Link to="/" className="group flex flex-col items-center justify-center z-50">
            <span className="font-serif italic text-2xl text-black tracking-tighter group-hover:opacity-70 transition-opacity">
              Utaran
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className={navLinkClass}>Home</Link>
            <Link to="/products" className={navLinkClass}>Collection</Link>
            <Link to="/contact" className={navLinkClass}>Studio</Link>

            <div className="h-3 w-px bg-gray-200"></div>

            {user ? (
              <>
                <Link to="/cart" className={navLinkClass}>Bag</Link>
                <Link to="/dashboard" className={navLinkClass}>Account</Link>
                <button
                  onClick={handleLogout}
                  className="text-[10px] uppercase tracking-[0.2em] font-medium text-red-400 hover:text-red-600 transition-colors ml-2"
                >
                  Exit
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass}>Sign In</Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-black text-white text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-gray-800 transition-all active:scale-95"
                >
                  Join
                </Link>
              </>
            )}
          </div>

          {/* Hamburger Icon (Only visible when menu is CLOSED) */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className={`md:hidden p-2 -mr-2 text-black transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <div className="w-6 flex flex-col items-end gap-[5px]">
              <span className="h-px w-6 bg-black"></span>
              <span className="h-px w-4 bg-black"></span>
              <span className="h-px w-6 bg-black"></span>
            </div>
          </button>
        </div>
      </nav>

      {/* PREMIUM MOBILE SIDEBAR OVERLAY 
        z-index is 60 to sit ON TOP of the navbar (z-50) 
      */}
      <div 
        className={`fixed inset-0 z-[60] md:hidden transition-visibility duration-500 ${isMobileMenuOpen ? "visible" : "invisible delay-500"}`}
      >
        {/* Backdrop (Darker for better focus) */}
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar Panel */}
        <div 
          className={`absolute top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-700 cubic-bezier(0.19, 1, 0.22, 1) flex flex-col ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Sidebar Header (Close Button) */}
          <div className="h-16 flex items-center justify-end px-6 border-b border-black/[0.03]">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 group"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <span className="absolute h-px w-6 bg-black rotate-45 transition-transform duration-300 group-hover:rotate-90"></span>
                <span className="absolute h-px w-6 bg-black -rotate-45 transition-transform duration-300 group-hover:-rotate-90"></span>
              </div>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 flex flex-col justify-center items-center gap-8 py-10">
            
            {/* Primary Links */}
            <div className="flex flex-col items-center gap-8 w-full">
              <Link to="/" className={mobileLinkClass}>Home</Link>
              <Link to="/products" className={mobileLinkClass}>Collection</Link>
              <Link to="/contact" className={mobileLinkClass}>Studio</Link>
            </div>

            {/* Decorative Divider */}
            <div className="w-12 h-px bg-gray-200 my-4"></div>

            {/* Secondary / User Links */}
            <div className="flex flex-col items-center gap-6 w-full">
              {user ? (
                <>
                  <Link to="/cart" className={mobileSubLinkClass}>Bag</Link>
                  <Link to="/dashboard" className={mobileSubLinkClass}>Account</Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs uppercase tracking-[0.15em] font-medium text-red-500 mt-4 hover:text-red-700 transition-colors"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={mobileSubLinkClass}>Sign In</Link>
                  <Link
                    to="/register"
                    className="mt-2 px-8 py-3 bg-black text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-gray-800 transition-all active:scale-95"
                  >
                    Join Us
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="py-8 text-center border-t border-black/[0.03]">
            <span className="font-serif italic text-xl text-black tracking-tighter opacity-30">
              Utaran
            </span>
          </div>
        </div>
      </div>
    </>
  );
}