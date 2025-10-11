import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import navConfig from "./NavConfig";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const rawRole = currentUser?.role || "citizen";

  const navLinks = navConfig[rawRole

  ] || navConfig["citizen"] || [];

  return (
    <aside
      className={`hidden md:flex flex-col bg-white shadow-lg fixed top-[64px] left-0 h-[calc(100vh-64px)] z-30
        transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}
      aria-hidden={false}
    >
      {/* Collapse Button (placed top-right inside sidebar) */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="px-2 py-1 rounded-md bg-cyan-900 text-white hover:bg-cyan-700 transition"
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
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative
                ${
                  isActive
                    ? "bg-cyan-100 text-cyan-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
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
      <div className="px-3 py-4 border-t flex items-center gap-3">
        <img
          className="h-10 w-10 rounded-full object-cover"
          src={
            currentUser?.photoURL ||
            "https://placehold.co/100x100/E2E8F0/4A5568?text=U"
          }
          alt="User"
        />
        {!isCollapsed && (
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {currentUser?.name || "User Name"}
            </p>
            <span className="text-xs text-gray-500 mt-1 block capitalize">
              {rawRole}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
