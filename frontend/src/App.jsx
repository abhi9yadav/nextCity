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
            <Route path="/create-complaint" element={<Complaint />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/zones/manage/:cityId/:departmentId" element={<ManageZones />} />
            <Route path="/zones/create-zone/:cityId/:departmentId" element={<CreateZone />} />
            <Route path="/zones/update-zone/:cityId/:departmentId" element={<UpdateZone />} />
            <Route path="/zones/delete-zone/:cityId/:departmentId" element={<DeleteZone />} />
            <Route path="/zones/view/:cityId/:departmentId" element={<GetZones />} />
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
