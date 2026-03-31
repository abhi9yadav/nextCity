import React from 'react';
import { useTheme } from '../../hooks/useTheme'; // 1. Import the theme hook

const Footer = () => {
  const { theme } = useTheme(); // 2. Get the theme object

  return (
    // 3. Apply theme styles to the footer container
    <footer className={`${theme.footerBg} border-t ${theme.footerBorder}`}>
      <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          {/* 4. Apply theme styles to the text */}
          <p className={`text-sm ${theme.footerText}`}>
            &copy; {new Date().getFullYear()} NextCity. All Rights Reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-4 md:mt-0">
            {/* 5. Apply theme styles to the links */}
            <a href="/about" className={`text-sm ${theme.footerText} ${theme.linkHoverTextAccent}`}>About Us</a>
            <a href="/privacy" className={`text-sm ${theme.footerText} ${theme.linkHoverTextAccent}`}>Privacy Policy</a>
            <a href="/contact" className={`text-sm ${theme.footerText} ${theme.linkHoverTextAccent}`}>Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;