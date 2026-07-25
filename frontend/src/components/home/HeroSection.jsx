import React from 'react';

function HeroSection() {
  return (
    <section className="bg-transparent md:py-32 px-6 text-center md:text-left z-50 relative min-h-[90vh] flex items-center">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Content */}
        <div className="lg:w-1/2 space-y-8">
          

          

          <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed">
            Revolutionizing how citizens interact with local government. Snap a photo, let AI handle the details, and watch your city transform in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start pt-4">
            <a 
              href="/signup" 
              className="bg-cyan-600 text-white text-lg font-bold px-10 py-4 rounded-full shadow-[0_10px_25px_rgba(6,182,212,0.4)] hover:bg-cyan-500 hover:-translate-y-1 transition-all duration-300 text-center"
            >
              Get Started
            </a>
            <a 
              href="#how-it-works" 
              className="hero-glass text-white text-lg font-bold px-10 py-4 rounded-full hover:bg-white/10 transition-all duration-300 text-center"
            >
              How It Works
            </a>
          </div>

          {/* Quick Stats Overlay */}
          <div className="flex items-center gap-8 pt-8 border-t border-white/10 justify-center md:justify-start">
            <div>
              <div className="text-2xl font-bold text-white">5+</div>
              <div className="text-xs text-gray-400 uppercase tracking-widest">Departments</div>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            
          </div>
        </div>

        {/* Right Content: Advanced Visual Mockup */}
        <div className="lg:w-5/12  relative  lg:block">
          <div className="animate-float relative z-10">
            {/* Main Feature Card */}
            <div className="hero-glass  p-8 rounded-[3rem] shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
                <div className="text-right">
                  
                </div>
              </div>
              
              <div className="space-y-3 ">
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-2/3 animate-pulse"></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>ANALYZING IMAGE...</span>
                  <span>67% COMPLETE</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-cyan-400 uppercase mb-1">Detected Issue</div>
                    <div className="text-white text-xs font-bold leading-tight">Road Infrastructure</div>
                 </div>
                 <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-cyan-400 uppercase mb-1">Priority</div>
                    <div className="text-white text-xs font-bold">High - Level 4</div>
                 </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Glowing Circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/20 rounded-full blur-[80px] -z-10"></div>
        </div>

      </div>
    </section>
  );
}

export default HeroSection;