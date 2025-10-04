import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ProblemSolutionSection from './ProblemSolutionSection';
import HowItWorksSection from './HowItWorksSection';
//import Footer from './components/Footer'; // You'll create this later

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <Navbar />
      <HeroSection />
      <ProblemSolutionSection />
      <HowItWorksSection />
      {/* <Footer /> */} {/* Add footer component later */}
    </div>
  );
}

export default LandingPage;