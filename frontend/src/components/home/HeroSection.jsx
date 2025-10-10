import React from 'react';



function HeroSection() {
  return (
    <section className="bg-transparent border  shadow-md md:py-24 px-6 text-center md:text-left z-50 relative min-h-full flex items-center md:full md:h-full">
      <div className="bg-transparent max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between ">
        {/* Left Content */}
        <div className="md:w-1/2 mb-10 md:mb-0 border border-gray-300 p-6 rounded-lg shadow-lg ">
          <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-600 leading-tight mb-4">
            NEXTGEN CITY: <span className="text-cyan-900 ">Your Voice, Your Future City</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-100 mb-8">
            Connecting Citizens with Solutions for a Smarter Urban Tomorrow.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
            <button  className="bg-cyan-600 text-white text-lg font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-cyan-700 transition duration-300 cursor-pointer">
              <a href="/signup">Explore </a>
            </button>
            
          </div>
        </div>

        
      </div>
    </section>
  );
}

export default HeroSection;