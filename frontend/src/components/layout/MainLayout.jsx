import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer (desktop) */}
      <Footer />

      {/* Bottom Navigation (mobile) */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
