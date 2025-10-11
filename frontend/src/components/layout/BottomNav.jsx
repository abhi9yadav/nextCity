// src/components/layout/BottomNav.jsx
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/authContext/index";
import navConfig from "./NavConfig";


const BottomNav = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const role = currentUser?.role || "citizen";
  const navLinks = navConfig[role] || [];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.1)] z-50">
      <div className="flex justify-around h-16">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.name}
              to={link.href}
              className={`flex flex-col justify-center items-center w-full pt-2 pb-1 transition-colors ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-xs mt-1">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
