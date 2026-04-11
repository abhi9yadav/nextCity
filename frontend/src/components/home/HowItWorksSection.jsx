import React from 'react';
import resolved from '../../assets/resolved.svg';
import tracking from '../../assets/tracking.svg';
import report from '../../assets/report.svg';
import './landing.css';

function HowItWorksSection() {
  const steps = [
    {
      img: report,
      title: "REPORT",
      desc: "Snap a photo of the issue. Our AI automatically fills in the details, category, and location for you.",
      color: "from-cyan-500 to-blue-600"
    },
    {
      img: tracking,
      title: "TRACK",
      desc: "Watch your complaint move from 'Pending' to 'Assigned' as admins dispatch the right department.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      img: resolved,
      title: "RESOLVE",
      desc: "Workers use integrated maps to find the exact spot and fix the issue. You get notified instantly.",
      color: "from-indigo-500 to-purple-600"
    }
  ];

  return (
    <section id="how-it-works" className="bg-[#0d0f0f] text-white py-24 px-6 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto relative">
        <div className="mb-20">
          <h2 className="text-cyan-500 font-bold tracking-widest uppercase text-sm mb-4">The Process</h2>
          <h3 className="text-4xl md:text-5xl font-black mb-6">How <span className="text-cyan-400">NextCity</span> Works</h3>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Empowering citizens with AI-driven reporting and workers with smart routing.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block process-line"></div>

          {steps.map((step, index) => (
            <div key={index} className="step-card group flex flex-col items-center relative z-10">
              {/* Step Number Badge */}
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-slate-800 border border-gray-700 rounded-full flex items-center justify-center font-bold text-cyan-400 shadow-xl">
                0{index + 1}
              </div>

              {/* Icon Container */}
              <div className="icon-container w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <img src={step.img} alt={step.title} className="w-12 h-12 object-contain" />
              </div>

              {/* Text Content */}
              <h4 className="text-2xl font-bold mb-4 group-hover:text-cyan-400 transition-colors">
                {step.title}
              </h4>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base px-4">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Final Call to Action */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-10 rounded-[3rem] border border-gray-800 inline-block shadow-2xl">
          <h4 className="text-2xl font-bold mb-6">Ready to make a difference in your city?</h4>
          <a 
            href="/signup" 
            className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white text-lg font-bold px-10 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-[0_10px_20px_rgba(6,182,212,0.3)]"
          >
            Get Started Now
          </a>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;