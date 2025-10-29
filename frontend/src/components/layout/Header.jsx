import React from "react";
import { doSignOut } from "../../firebase/auth";
import { Bell, LogOut, Settings, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import toast, { Toaster } from "react-hot-toast";
import nextcityLogo from "../../assets/logo.png";

const roleTitles = {
  citizen: "Citizen Dashboard",
  superadmin: "Super Admin Panel",
  cityadmin: "City Admin Portal",
  departmentadmin: "Department Admin Panel",
  worker: "Worker Dashboard",
};

const Header = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const role = currentUser?.role || "citizen";

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
  const notificationCount = 0;

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <nav className="bg-white shadow-md sticky top-0 left-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and Role Label */}
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2 cursor-auto">
                <img
                  src={nextcityLogo}
                  alt="nextcity Logo"
                  className="w-20 h-16 object-contain cursor-pointer"
                />
                <span className="text-xl font-bold text-cyan-500 cursor-pointer">
                  NextCity
                </span>
              </a>
              <span className="hidden sm:block text-sm text-gray-600 font-medium ml-2">
                {roleTitles[role]}
              </span>
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-4">
              {/* Settings or Role-Specific Shortcut */}
              {role === "superadmin" || role === "cityadmin" ? (
                <button
                  onClick={() => navigate(`/${role}-dashboard/settings`)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Settings"
                >
                  <Settings className="h-6 w-6 text-gray-600" />
                </button>
              ) : role === "worker" ? (
                <button
                  onClick={() => navigate("/worker-dashboard/tasks")}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="My Tasks"
                >
                  <UserCog className="h-6 w-6 text-gray-600" />
                </button>
              ) : null}

              {/* Notification Bell */}
              <button
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-6 w-6 text-gray-600" />

                {/* Notification Count (only visible when count > 0) */}
                {notificationCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 flex items-center justify-center 
                 h-5 w-5 text-xs font-semibold text-white bg-red-500 
                 rounded-full border-2 border-white"
                  >
                    {notificationCount}
                  </span>
                )}
              </button>

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
                className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
