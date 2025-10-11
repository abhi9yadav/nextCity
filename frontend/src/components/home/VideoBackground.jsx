// VideoBackground.jsx
import React from 'react';
import './landing.css'; // For styling
import video from '../../assets/videos/Dark_Mode_Video.mp4'; // Adjust path as needed
import Navbar from './Navbar';
import HeroSection from './HeroSection';
const VideoBackground = () => {
  return (
    <div className="video-container top-0 left-0 w-full h-screen overflow-hidden relative">
      <video className="video-bg" autoPlay loop muted>
        <source src={video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="content">
        <Navbar />
        <HeroSection />
      </div>
    </div>
  );
};

export default VideoBackground;

       