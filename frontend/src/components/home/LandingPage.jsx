import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ProblemSolutionSection from './ProblemSolutionSection';
import HowItWorksSection from './HowItWorksSection';
import AIFeatureSection from './AIFeatureSection';
import WorkerMapSection from './WorkerMapSection';
import VideoBackground from './VideoBackground';
import Footer from './Footer';
function LandingPage() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden">
      <VideoBackground />
      
      <div className='relative z-10'>
        <ProblemSolutionSection />
        <AIFeatureSection />
        <WorkerMapSection />
        <HowItWorksSection />
        <Footer/>
      </div>
    </div>
  );
}

export default LandingPage;