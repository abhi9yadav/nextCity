import React from 'react';
import './landing.css'; // Optional: if you have specific styles for Navbar
function Navbar() {
  return (
    <nav className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
      <div className="color font-bold text-xl">NEXTGEN CITY</div>
      <div className="hidden md:flex space-x-8">
        <a href="#features" className="text-gray-600 hover:text-blue-700">Features</a>
        <a href="#how-it-works" className="text-gray-600 hover:text-blue-700">How It Works</a>
        <a href="#download" className="text-gray-600 hover:text-blue-700">Download</a>
      </div>
      <div className="hidden md:flex space-x-4 items-center">
        <a href="/login" className="text-gray-600 hover:text-blue-700">Login</a>
        <a href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sign Up</a>
      </div>
      {/* Mobile Menu Icon (Hamburger) */}
      <div className="md:hidden">
        <button className="text-gray-600 focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;