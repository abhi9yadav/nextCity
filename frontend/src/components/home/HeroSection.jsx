import React from 'react';
// Assuming you save your solution logo to src/assets/solution-logo-nc.png
import SolutionLogo from '../../assets/logo.png'; 
import PlayStore from '../../assets/google-play-badge.png'; // Download from Google Play assets
import AppStore from '../../assets/app-store.png'; // Download from Apple App Store assets


function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-16 md:py-24 px-6 text-center md:text-left">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Left Content */}
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            NEXTGEN CITY: <span className="text-gray-900 ">Your Voice, Your Future City</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            Connecting Citizens with Solutions for a Smarter Urban Tomorrow.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
            <button className="bgcolor text-white text-lg font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 cursor-pointer">
              Download the App
            </button>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              {/* Replace with actual badge images */}
              <img src={PlayStore} alt="Google Play" className="h-12 cursor-pointer" />
              <img src={AppStore} alt="App Store" className="h-12 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2">
          <img
            src={SolutionLogo} // Use the generated solution logo here
            alt="NextGen City Solution Logo"
            className="w-full max-w-lg mx-auto md:max-w-none animate-pulse-slow" // Add a subtle animation
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;