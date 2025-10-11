import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import { ThemeProvider } from "./contexts/themeContext/themeContext";
import Login from "./components/auth/Login";
import UserRegister from "./components/auth/RegisterUser";
import OfficerRegister from "./components/auth/OfficerRegister";
import Admin from "./components/auth/Admin";
import Home from "./components/home/home";
import PrivateRoute from "./routes/PrivateRoute";
import LandingPage from "./components/home/LandingPage";
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
import CreateCityPage from "./components/superAdmin/CreateCityPage";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<UserRegister />} />
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
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/super-admin/create-city" element={<CreateCityPage />} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
