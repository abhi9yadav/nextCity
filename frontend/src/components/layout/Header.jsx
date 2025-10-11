import React from "react";
import { doSignOut } from "../../firebase/auth";
import { Bell, LogOut, Settings, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import toast, { Toaster } from "react-hot-toast";

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
      case "superadmin":
        navigate("/superadmin-dashboard/profile");
        break;
      case "cityadmin":
        navigate("/cityadmin-dashboard/profile");
        break;
      case "departmentadmin":
        navigate("/department-dashboard/profile");
        break;
      case "worker":
        navigate("/worker-dashboard/profile");
        break;
      default:
        navigate("/citizen-dashboard/profile");
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <nav className="bg-white shadow-md sticky top-0 left-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and Role Label */}
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2">
                <svg
                  className="h-8 w-8 text-cyan-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="text-xl font-bold text-cyan-500">NextCity</span>
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
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Notifications"
              >
                <Bell className="h-6 w-6 text-gray-600" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-white"></span>
              </button>

              {/* Profile Button */}
              <button
                onClick={goToProfile}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
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
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
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
