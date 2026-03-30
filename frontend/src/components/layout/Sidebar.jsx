import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import navConfig from "./NavConfig";
import { useTheme } from '../../hooks/useTheme'; // 1. Import useTheme

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const { theme } = useTheme(); // 2. Get the theme object

  const rawRole = currentUser?.role || "citizen";
  const navLinks = navConfig[rawRole] || navConfig["citizen"] || [];

  return (
    <aside
      // 3. Apply theme to the main sidebar container
      className={`hidden md:flex flex-col ${theme.sectionBg} ${theme.cardShadow} fixed top-[64px] left-0 h-[calc(100vh-64px)] z-30
        transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Collapse Button */}
      <div className={`flex p-2 ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          // 4. Apply theme to the collapse button
          className={`px-3 py-1 rounded-md ${theme.buttonSecondaryText} bg-gradient-to-r ${theme.buttonSecondaryBgFrom} ${theme.buttonSecondaryBgTo} ${theme.buttonSecondaryHoverBgFrom} ${theme.buttonSecondaryHoverBgTo} transition-all duration-300`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.name}
              to={link.href}
              // 5. Apply theme to nav links (active and inactive states)
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative ${
                isCollapsed ? 'justify-center' : ''
              }
                ${
                  isActive
                    ? `${theme.navActiveBg} ${theme.primaryAccentText} font-semibold shadow-inner ${theme.navActiveShadow}`
                    : `${theme.textSubtle} ${theme.navButtonHoverBg}`
                }`}
              title={isCollapsed ? link.name : ""}
            >
              <span className="text-lg">{link.icon}</span>
              {!isCollapsed && <span>{link.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      {/* 6. Apply theme to the profile section border */}
      <div className={`px-3 py-4 border-t ${theme.footerBorder} flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <img
          className="h-10 w-10 rounded-full object-cover"
          src={
            currentUser?.photoURL ||
            "https://placehold.co/100x100/E2E8F0/4A5568?text=U"
          }
          alt="User"
        />
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden">
            {/* 7. Apply theme to profile text */}
            <p className={`text-sm font-semibold ${theme.textDefault} truncate`}>
              {currentUser?.name || "User Name"}
            </p>
            <span className={`text-xs ${theme.textSubtle} mt-1 block capitalize`}>
              {rawRole}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;