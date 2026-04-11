import React from 'react';

function AIFeatureSection() {
  return (
    <section className="py-20 px-6 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2">
          <span className="bg-cyan-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Smart Reporting</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-4 mb-6 leading-tight">
            Our AI Does the <span className="text-cyan-400">Hard Work</span>
          </h2>
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-cyan-500 rounded-full p-1 text-white">✓</div>
              <p><strong>Auto-Recognition:</strong> Upload a photo and our AI identifies if it's a pothole, leak, or dark street.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-cyan-500 rounded-full p-1 text-white">✓</div>
              <p><strong>Smart Filling:</strong> Title, Description, and Category are filled instantly based on the image.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-cyan-500 rounded-full p-1 text-white">✓</div>
              <p><strong>Precise Location:</strong> Automatically tags the exact geographic coordinates for the field workers.</p>
            </li>
          </ul>
        </div>
        
        <div className="md:w-1/2 relative">
           {/* Visual representation of an AI scanning a photo */}
           <div className="border-4 border-cyan-500/30 rounded-3xl p-4 bg-slate-800 shadow-2xl">
              <div className="bg-slate-700 h-64 rounded-xl flex items-center justify-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_cyan] animate-scan"></div>
                 <p className="text-cyan-400 font-mono">Analyzing Image...</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse"></div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}

export default AIFeatureSection;