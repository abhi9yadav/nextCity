import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/authContext";

import RoleBasedRoute from "./routes/RoleBasedRoute";
import Unauthorized from "./components/auth/Unauthorized";
import Login from "./components/auth/Login";
import UserRegister from "./components/auth/RegisterUser";
import LandingPage from "./components/home/LandingPage";
import CitizenDashboard from "./pages/CitizenDashboard";
import CommunityFeed from "./components/citizenDashboard/CommunityFeed";
import SuperAdminPage from "./pages/SuperAdminPage";
import DeptAdminPage from "./pages/DeptAdminPage";
import CityAdminPage from "./pages/CityAdminPage";
import WorkerAdminPage from "./pages/WorkerDashboardPage";
import LoginSignupPage from "./pages/LoginSignupPage";
import CitizenProfile from "./components/citizenDashboard/CitizenProfile";
import Animated404Page from "./pages/Animated404Page";
import FlowerAnimation from "./components/flowerAnimation/FlowerAnimation";
import Complaint from "./components/complaints/Complaint";
import SetPassword from "./pages/SetPassword";
import ManageZones from "./components/zones/ManageZones";
import CreateZone from "./components/zones/CreateZone";
import UpdateZone from "./components/zones/UpdateZone";
import DeleteZone from "./components/zones/DeleteZone";
import GetZones from "./components/zones/GetZones";
import CityAdminDashboard from "./pages/CityAdminDashboard";
import CityDepartmentComplaints from "./components/cityAdmin/CityDepartmentComplaints";
import ManageDepartmentAdmins from "./components/cityAdmin/ManageDepartmentAdmins";

import MainLayout from "./components/layout/MainLayout";
import LoadingAnimation from "./components/loadingAnimation/LoadingAnimation";

function AppContent() {
  const { loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingAnimation />;

  return (
    <Routes>
      {/* ---------- PUBLIC ROUTES ---------- */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<UserRegister />} />
      <Route path="/LoginSignupForm" element={<LoginSignupPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/loading" element={<LoadingAnimation />} />
      <Route
        path="/flower-animation"
        element={
          <MainLayout>
            <FlowerAnimation />
          </MainLayout>
        }
      />
      <Route path="/signup-admin" element={<Admin />} />
      <Route path="/signup-officer" element={<OfficerRegister />} />
      <Route path="/city-admin" element={<CityAdminDashboard />} />
      <Route path="/city-admin/:dept_id" element={<CityDepartmentComplaints />} />
      <Route path="/city-admin/:dept_id/manage-dept-admin" element={<ManageDepartmentAdmins />} />
      <Route path="/create-complaint" element={<Complaint />} />
      <Route path="/zones/manage/:departmentId" element={<ManageZones />} />
      <Route path="/zones/create-zone/:departmentId" element={<CreateZone />} />
      <Route path="/zones/update-zone/:departmentId" element={<UpdateZone />} />
      <Route path="/zones/delete-zone/:departmentId" element={<DeleteZone />} />
      <Route path="/zones/view/:departmentId" element={<GetZones />} />
      <Route path="/set-password" element={<SetPassword />}/>
      <Route path="/notfound" element={<Animated404Page />} />

      {/* ---------- PROTECTED ROUTES ---------- */}

      {/* Super Admin */}
      <Route element={<RoleBasedRoute allowedRoles={["super_admin"]} />}>
        <Route path="/super-admin-dashboard" element={<SuperAdminPage />} />
      </Route>

      {/* City Admin */}
      {/* <Route element={<RoleBasedRoute allowedRoles={["city_admin"]} />}>
        <Route path="/city-admin-dashboard" element={<CityAdminPage />} />
      </Route> */}

      {/* Department Admin */}
      <Route element={<RoleBasedRoute allowedRoles={["dept_admin"]} />}>
        <Route path="/dept-admin-dashboard" element={<DeptAdminPage />} />
      </Route>

      {/* Worker */}
      <Route element={<RoleBasedRoute allowedRoles={["worker"]} />}>
        <Route path="/worker-dashboard" element={<WorkerAdminPage />} />
      </Route>

      {/* Citizen (with nested layout) */}
      <Route element={<RoleBasedRoute allowedRoles={["citizen"]} />}>
        <Route path="/citizen-dashboard" element={<MainLayout />}>
          <Route index element={<CitizenDashboard />} />
          <Route path="feed" element={<CommunityFeed />} />
          <Route path="profile" element={<CitizenProfile />} />
          <Route path="create-complaint" element={<Complaint />} />
        </Route>
      </Route>

      {/* ---------- CATCH-ALL ---------- */}
      <Route path="*" element={<Navigate to="/notfound" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
