import React from "react";
import "./landing.css";
import video from "../../assets/videos/Dark_Mode_Video.mp4";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";

const VideoBackground = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={video} type="video/mp4" />
      </video>

      {/* Dark Overlay (IMPORTANT for readability) */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>

      {/* Navbar (FIXED AT TOP) */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center h-full text-center px-6">
        <HeroSection />
      </div>
    </div>
  );
};

export default VideoBackground;