import React, { useState, useEffect } from "react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Effect to handle background change on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-lg shadow-lg py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
        
        {/* Logo with Glow Effect */}
        <div className="text-3xl font-black tracking-tighter transition-colors duration-300">
          <span className={scrolled ? "text-slate-900" : "text-white"}>Next</span>
          <span className="text-cyan-500">City</span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-10">
          {[
            { name: "Problems", href: "#features" },
            { name: "How It Works", href: "#how-it-works" },
          ].map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-bold uppercase tracking-widest footer-link ${
                scrolled ? "text-slate-600" : "text-gray-200"
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-6">
          <a 
            href="/login" 
            className={`text-sm font-bold transition-colors ${
              scrolled ? "text-slate-600 hover:text-cyan-600" : "text-gray-200 hover:text-white"
            }`}
          >
            LOGIN
          </a>
          <a
            href="/signup"
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black px-6 py-3 rounded-full transition-all shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:-translate-y-0.5"
          >
            GET STARTED
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-colors ${
              scrolled ? "text-slate-900" : "text-white"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Advanced Mobile Menu Overlay */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-slate-900 text-white transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-10 pointer-events-none"
        }`}
      >
        <div className="px-8 py-10 flex flex-col space-y-6">
          <a href="#features" onClick={() => setIsOpen(false)} className="text-xl font-bold">Problems</a>
          <a href="#how-it-works" onClick={() => setIsOpen(false)} className="text-xl font-bold">How It Works</a>
          <div className="pt-6 border-t border-slate-800 flex flex-col space-y-4">
            <a href="/login" className="text-gray-400">Login</a>
            <a href="/signup" className="bg-cyan-600 text-center py-4 rounded-2xl font-bold">Get Started</a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;