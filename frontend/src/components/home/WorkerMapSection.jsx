import React from 'react';

function WorkerMapSection() {
  return (
    <section className="py-24 px-6 bg-slate-50 bg-dot-pattern relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-100/50 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-cyan-600 font-bold tracking-[0.25em] uppercase text-sm mb-4">Backend Infrastructure</h2>
          <h3 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
            Command & <span className="text-cyan-500">Coordination</span>
          </h3>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            While citizens report issues, our robust management system ensures every complaint is assigned, tracked, and resolved with surgical precision.
          </p>
        </div>

        {/* Feature 1: Admin Command Center */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
          <div className="lg:w-1/2 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
              LIVE ADMIN PANEL
            </div>
            <h4 className="text-3xl font-bold text-slate-800 mb-6">Efficient Work Allocation</h4>
            <div className="space-y-6">
              {[
                { title: "Smart Triage", desc: "Admins review complaints pre-sorted by specific city departments." },
                { title: "One-Click Dispatch", desc: "Assign tasks to the nearest available worker with real-time availability tracking." },
                { title: "Progress Monitoring", desc: "Oversee the entire city's resolution status from a centralized administrative dashboard." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center font-bold">{i + 1}</div>
                  <div>
                    <h5 className="font-bold text-slate-800">{item.title}</h5>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 order-1 lg:order-2 relative">
             <div className="bg-slate-800 rounded-[2.5rem] p-4 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-slate-900 rounded-2xl h-[350px] overflow-hidden flex flex-col p-6">
                   <div className="flex gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                   </div>
                   <div className="space-y-4">
                      <div className="h-8 bg-slate-800 rounded-md w-3/4 animate-pulse"></div>
                      <div className="grid grid-cols-3 gap-4">
                         <div className="h-20 bg-cyan-900/30 border border-cyan-500/30 rounded-xl"></div>
                         <div className="h-20 bg-slate-800 rounded-xl"></div>
                         <div className="h-20 bg-slate-800 rounded-xl"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Feature 2: Worker Map Integration */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 relative">
            <div className="relative z-10 bg-white p-2 rounded-[2.5rem] shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-cyan-50 rounded-2xl h-[400px] overflow-hidden relative">
                {/* Mock Map UI */}
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/0,0,1/400x400?access_token=your_token')] bg-cover opacity-50"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-cyan-500 animate-pulse-slow">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                   </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 glass-card p-4 rounded-2xl">
                   <p className="text-xs font-bold text-cyan-600 uppercase mb-1">Current Route</p>
                   <p className="text-slate-800 font-bold text-sm">Target: Pothole Repair #68e5</p>
                </div>
              </div>
            </div>
            {/* Floating Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-400 rounded-3xl -z-10 rotate-12"></div>
          </div>

          <div className="lg:w-1/2">
            <h4 className="text-3xl font-bold text-slate-800 mb-6">Field Mobility & Routing</h4>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Equip your workforce with a powerful mobile tool. Workers can view their daily task list on a map and follow optimized GPS routes directly to the location.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 "Interactive Task Maps", 
                 "Route Optimization", 
                 "Live Status Updates", 
                 "Photo Resolution Proof"
               ].map((text, i) => (
                 <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                    {text}
                 </li>
               ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkerMapSection;