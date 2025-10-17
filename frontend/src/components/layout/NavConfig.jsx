import { MdDashboard, MdPeople, MdAssignment, MdAnalytics, MdPerson } from "react-icons/md";
const navConfig = {
  citizen: [
    {
      name: "Dashboard",
      href: "/citizen",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      ),
    },
    {
      name: "Feed",
      href: "/citizen/feed",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 8H6v7c0 1.1.9 2 2 2h9v-2H8V8zm10-6H4v13c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 15h-8V4h8v13z" />
        </svg>
      ),
    },
    {
      name: "Complaint",
      href: "/citizen/create-complaint",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
      ),
    },
    {
      name: "Profile",
      href: "/citizen/profile",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
      ),
    },
  ],

  super_admin: [
    { name: "Dashboard", href: "/super-admin", icon: "📊" },
    { name: "Cities", href: "/super-admin/cities", icon: "🏙️" },
    { name: "City Admins", href: "/super-admin/city-admins", icon: "🧑‍💼" },
    { name: "Departments", href: "/super-admin/departments", icon: "🏢" },
    { name: "Profile", href: "/super-admin/profile", icon: "👤" },
  ],

  city_admin: [
    { name: "Dashboard", href: "/city-admin", icon: "📊" },
    { name: "Complaints", href: "/city-admin/complaints", icon: "📋" },
    { name: "Profile", href: "/city-admin/profile", icon: "👤" },
  ],

  dept_admin: [
    { name: "Dashboard", href: "/dept-admin", icon: <MdDashboard size={20} /> },
    { name: "Manage Workers", href: "/dept-admin/workers", icon: <MdPeople size={20} /> },
    { name: "Manage Complaints", href: "/dept-admin/complaints", icon: <MdAssignment size={20} /> },
    { name: "Analytics", href: "/dept-admin/analytics", icon: <MdAnalytics size={20} /> },
    { name: "Profile", href: "/dept-admin/profile", icon: <MdPerson size={20} /> },
  ],

  worker: [
    { name: "Tasks", href: "/worker/tasks", icon: "🧰" },
    { name: "Report", href: "/worker/report", icon: "⚙️" },
    { name: "Profile", href: "/worker/profile", icon: "👤" },
  ],
};

export default navConfig;