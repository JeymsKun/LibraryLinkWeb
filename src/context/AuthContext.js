import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async (email) => {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (!userError && userData) {
        setUser(userData);
        setStaff(null);
        return;
      }

      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("*")
        .eq("email", email)
        .single();

      if (!staffError && staffData) {
        setStaff(staffData);
        setUser(null);
        return;
      }

      console.warn("No user or staff found for email:", email);
      setUser(null);
      setStaff(null);
    };

    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error);
        setLoading(false);
        return;
      }

      const currentSession = data?.session;
      setSession(currentSession);

      if (currentSession?.user?.email) {
        await loadUserData(currentSession.user.email);
      }

      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (event === "SIGNED_OUT" || !newSession) {
          setUser(null);
          setStaff(null);
          return;
        }

        if (newSession?.user?.email) {
          await loadUserData(newSession.user.email);
        }
      }
    );

    getSession();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const setUserData = (userData) => {
    setUser(userData);
    setStaff(null);
  };

  const setStaffData = (staffData) => {
    console.log("Setting Staff Data in Context:", staffData);
    setStaff(staffData);
    setUser(null);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setStaff(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        staff,
        loading,
        setUserData,
        setStaffData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
