import React from 'react';
import resolved from '../../assets/resolved.svg';
import tracking from '../../assets/tracking.svg';
import report from '../../assets/report.svg';
import './landing.css'

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="howitworkcolor  text-white py-16 px-6 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-green-900 text-3xl md:text-4xl font-bold mb-12">Solution is here</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Step 1 */}
          
          <div className="flex flex-col items-center p-6 howitworkcolor rounded-lg shadow-lg border border-gray-400">
            <div className="w-16 h-16 bg-white text-blue-700 rounded-full flex items-center justify-center font-bold text-2xl mb-4">
              <img src={report} alt="Report" className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">REPORT</h3>
            <p className="text-blue-200">
              Spot a problem? Easily submit a detailed complaint with photos and precise location via the app.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center p-6 howitworkcolor rounded-lg shadow-lg  border border-gray-400">
            <div className="w-16 h-16 bg-white text-blue-700 rounded-full flex items-center justify-center font-bold text-2xl mb-4">
              <img src={tracking} alt="Track" className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-semibold mb-2">TRACK</h3>
            <p className="text-blue-200">
              Monitor your complaint's real-time progress as it moves from submission to resolution.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center p-6 howitworkcolor rounded-lg shadow-lg border border-gray-400">
            <div className="w-16 h-16 bg-white text-blue-700 rounded-full flex items-center justify-center font-bold text-2xl mb-4">
              <img src={resolved} alt="Resolved" className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-semibold mb-2">RESOLVE</h3>
            <p className="text-blue-200">
              See the issue fixed and confirm satisfaction, contributing to a better city.
            </p>
          </div>
        </div>

        {/* Final Call to Action */}
        <h3 className="text-3xl font-bold mb-6">Ready to make a difference?</h3>
        <button  className="bgcolor  text-lg font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 mb-6 cursor-pointer">
          <a href="/signup">Get Started</a>
        </button>
        
      </div>
    </section>
  );
}

export default HowItWorksSection;