import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import { useTheme } from '../../hooks/useTheme'; // 1. Import useTheme

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme(); // 2. Get the theme object

  return (
    // 3. Apply the theme's main background color
    <div className={`flex flex-col min-h-screen ${theme.appBg}`}>
      {/* Header */}
      <Header />

      {/* Page Content Container */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 pb-16 md:pb-0 ${
            isCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          {/* The Outlet will render the specific page's content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Footer is part of the main layout flow on desktop, but positioned within the scrollable area */}
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
          <Footer />
      </div>


      {/* Bottom Navigation (mobile) */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;