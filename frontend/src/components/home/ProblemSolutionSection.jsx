import React from 'react';

import ProblemLogo from '../../assets/pathhole.svg';
import dustbin from '../../assets/dustbin.svg'; 
import Light from '../../assets/light.svg'; 




function ProblemSolutionSection() {
  return (
    <section className=" py-16 px-6 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">FRUSTRATED BY...</h2>

        {/* Problems */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 p-4 bg-white rounded-lg shadow-md">
            <img src={ProblemLogo} alt="City Problems" className="w-32 h-32 mx-auto mb-4 object-contain" />
            <h3 className="text-xl font-semibold text-gray-800">Potholes & Bad Roads?</h3>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 p-4 bg-white rounded-lg shadow-md">
            <img src={dustbin} alt="City Problems" className="w-32 h-32 mx-auto mb-4 object-contain" />
            <h3 className="text-xl font-semibold text-gray-800">Piles of Garbage?</h3>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 p-4 bg-white rounded-lg shadow-md">
            <img src={Light} alt="City Problems" className="w-32 h-32 mx-auto mb-4 object-contain" />
            <h3 className="text-xl font-semibold text-gray-800">Broken Streetlights?</h3>
          </div>
          {/* Add more problem examples */}
        </div>
        
      </div>
    </section>
  );
}

export default ProblemSolutionSection;