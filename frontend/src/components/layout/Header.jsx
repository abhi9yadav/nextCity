import React, { useState, useRef, useEffect } from "react";
import { doSignOut } from "../../firebase/auth";
import { Bell, LogOut, Palette } from "lucide-react"; // Added Palette icon
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import nextcityLogo from "../../assets/logo.png";
import { useNotification } from "../../contexts/NotificationContext";
import { useLocation } from "react-router-dom";


import { useTheme } from '../../hooks/useTheme';
import { themes } from '../../constants/Themes'; 
import { useAuth } from "../../contexts/authContext";
const roleTitles = {
  citizen: "Citizen Dashboard",
  superadmin: "Super Admin Panel",
  cityadmin: "City Admin Portal",
  departmentadmin: "Department Admin Panel",
  worker: "Worker Dashboard",
};


const Header = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();


  const location = useLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const role = currentUser?.role || "citizen";
  // State to manage the theme switcher dropdown visibility
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // Ref to detect clicks outside the dropdown
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleLogout = async () => {
    try {
      await doSignOut();
      toast.success("Logout successful!");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Try again.");
    }
  };

  const goToProfile = () => {
    switch (role) {
      case "super_admin":
        navigate("/super-admin/profile");
        break;
      case "cityadmin":
        navigate("/cityadmin-dashboard/profile");
        break;
      case "dept_admin":
        navigate("/dept-admin/profile");
        break;
      case "worker":
        navigate("/worker-dashboard/profile");
        break;
      default:
        navigate("/citizen/profile");
    }
  };

  const handleToggle = () => {
    if (open) {
      markAllAsRead();
    }
    setOpen(!open);
  };
  const notificationCount = 0;
  // Effect to close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Applying theme styles to the navbar */}
      <nav className={`sticky top-0 left-0 z-50 border-b ${theme.navBg} ${theme.navBorder} ${theme.cardShadow}`}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and Role Label */}
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2">
                <svg
                  // Use a theme color for the logo icon
                  className={`h-8 w-8 ${theme.primaryAccentText}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                {/* Use theme text colors */}
                <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${theme.headingGradientFrom} ${theme.headingGradientTo}`}>NextCity</span>
              </a>
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-2 sm:gap-4">

              {/* ----- THEME SWITCHER START ----- */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!isDropdownOpen)}
                  className={`p-2 rounded-full ${theme.navButtonHoverBg} transition-colors`}
                  title="Change Theme"
                >
                  <Palette className={`h-6 w-6 ${theme.textSubtle}`} />
                </button>

                {isDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${theme.sectionBg} ring-1 ring-black ring-opacity-5 z-50 border ${theme.cardBorder}`}>
                    {Object.keys(themes).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          toggleTheme(key);
                          setDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${theme.textDefault} ${theme.navButtonHoverBg}`}
                      >
                        {themes[key].name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* ----- THEME SWITCHER END ----- */}

              {/* Notification Bell */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={handleToggle}
                  className="relative p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <Bell className="h-6 w-6 text-gray-600" />

                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 text-xs text-white bg-red-500 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-xl border z-50">
                    
                    {/* Header */}
                    <div className="p-3 font-semibold border-b flex justify-between">
                      Notifications
                      <span className="text-xs text-gray-500">
                        {unreadCount} new
                      </span>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-gray-500 text-center">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              if (!n.isRead) markAsRead(n._id);

                              // Optional: navigate to complaint
                              // navigate(`/citizen/complaint/${n.complaintId}`);
                            }}
                            className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${
                              !n.isRead ? "bg-blue-50" : "bg-white"
                            }`}
                          >
                            <p className="text-sm">{n.message}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Button */}
              <button
                onClick={goToProfile}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                title="Profile"
              >
                <img
                  src={
                    currentUser?.photoURL ||
                    "https://placehold.co/40x40/E2E8F0/4A5568?text=U"
                  }
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`p-2 rounded-full ${theme.navButtonHoverBg} transition-colors`}
                title="Logout"
              >
                <LogOut className={`h-6 w-6 ${theme.textSubtle}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;