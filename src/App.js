import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./admin/Login";
import Staff from "./admin/Login_Staff";
import User from "./admin/Login_User";
import DashboardUser from "./pages/user/Dashboard";
import DashboardStaff from "./pages/staff/Dashboard";
import AboutBook from "./components/AboutBook";
import ProtectedRoute from "./components/ProtectedRoute";
import { BookingProvider } from "./context/BookingContext";

function App() {
  return (
    <BookingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate replace to="/Login/" />} />
          <Route path="/Login/" element={<Login />} />
          <Route path="/Login/Staff/" element={<Staff />} />
          <Route
            path="/Staff/Dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardStaff />
              </ProtectedRoute>
            }
          />
          <Route path="/Login/User/" element={<User />} />
          <Route path="/User/Dashboard/*" element={<DashboardUser />} />

          {/* Update the route for the AboutBook component */}
          <Route path="/Book/:id" element={<AboutBook />} />
        </Routes>
      </Router>
    </BookingProvider>
  );
}

export default App;
