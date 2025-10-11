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
import WorkerAdminPage from "./pages/WorkerDashboardPage";
import LoginSignupPage from "./pages/LoginSignupPage";
import Profile from "./components/citizenDashboard/Profile";
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
import ManageDepartment from "./components/cityAdmin/ManageDepartment";
import CreateCityPage from "./components/superAdmin/CreateCityPage";

import MainLayout from "./components/layout/MainLayout";
import LoadingAnimation from "./components/loadingAnimation/LoadingAnimation";
import VideoBackground from "./components/home/VideoBackground";
function AppContent() {
  const { loading } = useAuth();
  const location = useLocation();

  if (loading) return <FlowerAnimation />;

  return (
    <Routes>
      {/* ---------- PUBLIC ROUTES ---------- */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<UserRegister />} />
      <Route path="/LoginSignupForm" element={<LoginSignupPage />} />
      {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}
      <Route path="/loading" element={<VideoBackground />} />
      <Route path="/super-admin/create-city" element={<CreateCityPage />} />
      <Route
        path="/flower-animation"
        element={
          <MainLayout>
            <FlowerAnimation />
          </MainLayout>
        }
      />
      
      



      <Route path="/set-password" element={<SetPassword />}/>
      {/* <Route path="/notfound" element={<Animated404Page />} /> */}

      {/* ---------- PROTECTED ROUTES ---------- */}

      

      {/* City Admin  with nested layout*/}
      <Route element={<RoleBasedRoute allowedRoles={["city_admin"]} />}>
        <Route path="/city-admin" element={<MainLayout />}>
          <Route index element={<CityAdminDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path=":dept_id" element={<ManageDepartment />} />
          <Route path=":dept_id/complaints" element={<CityDepartmentComplaints />} />
          <Route path=":dept_id/manage-dept-admin" element={<ManageDepartmentAdmins />} />
          <Route path=":dept_id/zones/manage" element={<ManageZones />} />
          <Route path=":dept_id/zones/create-zone" element={<CreateZone />} />
          <Route path=":dept_id/zones/update-zone" element={<UpdateZone />} />
          <Route path=":dept_id/zones/delete-zone" element={<DeleteZone />} />
          <Route path=":dept_id/zones/view" element={<GetZones />} />
        </Route>
      </Route>

      

      {/* Citizen (with nested layout) */}
      <Route element={<RoleBasedRoute allowedRoles={["citizen"]} />}>
        <Route path="/citizen" element={<MainLayout />}>
          <Route index element={<CitizenDashboard />} />
          <Route path="feed" element={<CommunityFeed />} />
          <Route path="profile" element={<Profile />} />
          <Route path="create-complaint" element={<Complaint />} />
        </Route>
      </Route>

      {/* Department Admin */}
      <Route element={<RoleBasedRoute allowedRoles={["dept_admin"]} />}>
      <Route path="/dept-admin" element={<MainLayout />}>
      </Route>
      </Route>

      {/* Worker */}
      <Route element={<RoleBasedRoute allowedRoles={["worker"]} />}>
      <Route path="/worker" element={<MainLayout />}>
        <Route path="/worker" element={<WorkerAdminPage />} />
      </Route>
      </Route>

      {/* Super Admin */}
      <Route element={<RoleBasedRoute allowedRoles={["super_admin"]} />}>
        <Route path="/super-admin" element={<MainLayout />}>
          <Route index element={<SuperAdminPage />} />
          <Route path="profile" element={<Profile />} />
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
