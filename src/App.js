import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./admin/Login";
import Staff from "./admin/LoginStaff";
import User from "./admin/LoginUser";
import DashboardUser from "./pages/user/Dashboard";
import DashboardStaff from "./pages/staff/Dashboard";
import AboutBook from "./components/AboutBook";
import UserSignUp from "./admin/UserSignUp";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { BookingProvider } from "./context/BookingContext";

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate replace to="/Login/" />} />
            <Route path="/Login/" element={<Login />} />
            <Route path="/Login/Staff/" element={<Staff />} />
            <Route path="/Login/Signup/" element={<UserSignUp />} />
            <Route
              path="/Staff/Dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardStaff />
                </ProtectedRoute>
              }
            />
            <Route path="/Login/User/" element={<User />} />
            <Route
              path="/User/Dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardUser />
                </ProtectedRoute>
              }
            />
            <Route path="/Book/:id" element={<AboutBook />} />
          </Routes>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
