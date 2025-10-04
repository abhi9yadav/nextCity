import React from 'react';
// Assuming you save your problem logo to src/assets/problem-logo-nc.png
import ProblemLogo from '../../assets/logo.png'; 

// Example Icons - you might use actual SVG icons or a library like react-icons
const ProblemIcon = ({ children }) => <div className="text-4xl text-red-500 mb-4">{children}</div>;
const SolutionIcon = ({ children }) => <div className="text-4xl text-green-500 mb-4">{children}</div>;


function ProblemSolutionSection() {
  return (
    <section className="bg-gray-100 py-16 px-6 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">FRUSTRATED BY...</h2>

        {/* Problems */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 p-4 bg-white rounded-lg shadow-md">
            <img src={ProblemLogo} alt="City Problems" className="w-32 h-32 mx-auto mb-4 object-contain" />
            <h3 className="text-xl font-semibold text-gray-800">Potholes & Bad Roads?</h3>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 p-4 bg-white rounded-lg shadow-md">
            <ProblemIcon>🗑️</ProblemIcon> {/* Replace with a proper icon */}
            <h3 className="text-xl font-semibold text-gray-800">Piles of Garbage?</h3>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 p-4 bg-white rounded-lg shadow-md">
            <ProblemIcon>💡</ProblemIcon> {/* Replace with a proper icon */}
            <h3 className="text-xl font-semibold text-gray-800">Broken Streetlights?</h3>
          </div>
          {/* Add more problem examples */}
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-8">THE SOLUTION IS HERE!</h2>

        {/* Solutions / Features */}
        <div className="flex flex-wrap justify-center gap-8">
          <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 p-4 bg-white rounded-lg shadow-md">
            <SolutionIcon>📝</SolutionIcon> {/* Replace with a proper icon */}
            <h3 className="text-xl font-semibold text-gray-800">Easy Reporting</h3>
            <p className="text-gray-600 text-sm">Submit issues quickly with photos & location.</p>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 p-4 bg-white rounded-lg shadow-md">
            <SolutionIcon>⏳</SolutionIcon> {/* Replace with a proper icon */}
            <h3 className="text-xl font-semibold text-gray-800">Real-time Tracking</h3>
            <p className="text-gray-600 text-sm">Monitor complaint status from start to finish.</p>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 p-4 bg-white rounded-lg shadow-md">
            <SolutionIcon>💬</SolutionIcon> {/* Replace with a proper icon */}
            <h3 className="text-xl font-semibold text-gray-800">Direct Communication</h3>
            <p className="text-gray-600 text-sm">Connect with city officials directly.</p>
          </div>
          {/* Add more solution examples */}
        </div>
      </div>
    </section>
  );
}

export default ProblemSolutionSection;