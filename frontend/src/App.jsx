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
