import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0d0f0f] text-white pt-20 pb-10 px-6 relative overflow-hidden footer-glow border-t border-gray-800">
      {/* Decorative background element */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-900/10 rounded-full blur-[120px] -z-0"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="text-2xl font-black tracking-tighter text-white">
              Next<span className="text-cyan-500">City</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Transforming urban living through AI-powered reporting and smart departmental coordination. We bridge the gap between citizens and city solutions.
            </p>
            <div className="flex gap-4">
              {/* Mock Social Icons */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border border-gray-700 flex items-center justify-center hover:bg-cyan-600 transition-all duration-300 cursor-pointer group">
                  <div className="w-4 h-4 bg-gray-400 group-hover:bg-white rounded-sm"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Departments Column - Using your specific data */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-cyan-400 uppercase tracking-widest text-sm">Departments</h4>
            <ul className="space-y-4">
              {[
                "Power Supply",
                "Roads & Infrastructure",
                "Water Management",
                "Waste Management"
              ].map((item, i) => (
                <li key={i}>
                  <a href="#features" className="text-gray-400 footer-link inline-block text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Column */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-cyan-400 uppercase tracking-widest text-sm">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#how-it-works" className="text-gray-400 footer-link inline-block">AI Photo Processing</a></li>
              <li><a href="/login" className="text-gray-400 footer-link inline-block">Worker Dashboard</a></li>
              <li><a href="/login" className="text-gray-400 footer-link inline-block">Admin Command Center</a></li>
              <li><a href="#" className="text-gray-400 footer-link inline-block">Real-time Map Tracking</a></li>
            </ul>
          </div>

          
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-xs uppercase tracking-widest">
          <p>© {currentYear} NextCity. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;