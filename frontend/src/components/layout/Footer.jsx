import React, { useState, useRef, useEffect } from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 ">
      <div className=" mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} NextCity. All Rights Reserved.</p>
          <div className="flex justify-center space-x-6 mt-4 md:mt-0">
            <a href="/about" className="text-sm text-gray-500 hover:text-gray-900">About Us</a>
            <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
            <a href="/contact" className="text-sm text-gray-500 hover:text-gray-900">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
