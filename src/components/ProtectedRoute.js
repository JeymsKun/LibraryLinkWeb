// src/components/ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabase/client";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setChecking(false);
    };

    getSession();
  }, []);

  if (checking) return null;
  if (!isAuthenticated) return <Navigate to="/Login/Staff/" replace />;
  return children;
};

export default ProtectedRoute;
