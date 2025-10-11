import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ProblemSolutionSection from './ProblemSolutionSection';
import HowItWorksSection from './HowItWorksSection';
import FlowerAnimation from '../flowerAnimation/FlowerAnimation';
//import Footer from './components/Footer'; // You'll create this later
import VideoBackground from './VideoBackground';

function LandingPage() {
  return (
    <div className="min-h-screen font-sans antialiased">
      <VideoBackground />

      
      <div className='top-40 relative'>
        <ProblemSolutionSection />
      </div>
      <div className='top-40 relative  bg-orange-900'>
        <HowItWorksSection />
      </div>
      {/* <Footer /> */} {/* Add footer component later */}
    </div>
  );
}

export default LandingPage;