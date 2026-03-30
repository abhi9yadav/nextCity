import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/authContext/index";
import navConfig from "./NavConfig";
import { useTheme } from "../../hooks/useTheme"; // 1. Import the theme hook

const BottomNav = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const { theme } = useTheme(); // 2. Get the current theme

  const role = currentUser?.role || "citizen";
  const navLinks = navConfig[role] || [];

  return (
    // 3. Apply theme styles to the main nav container
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t ${theme.navBg} ${theme.footerBorder} ${theme.cardShadow}`}>
      <div className="flex justify-around h-16">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.name}
              to={link.href}
              // 4. Apply theme styles to the links, including active/inactive states
              className={`flex flex-col justify-center items-center w-full pt-2 pb-1 transition-colors 
                ${
                  isActive
                    ? theme.primaryAccentText // Style for the active link
                    : `${theme.textSubtle} ${theme.linkHoverTextAccent}` // Style for inactive links
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