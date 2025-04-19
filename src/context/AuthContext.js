import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error);
        setLoading(false);
        return;
      }

      const currentSession = data?.session ?? null;
      setSession(currentSession);

      if (currentSession) {
        const userEmail = currentSession.user.email;

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("email", userEmail)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
        } else {
          setUser(userData);
        }
      }

      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
        }

        if (newSession) {
          const userEmail = newSession.user.email;

          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("email", userEmail)
            .single();

          if (userError) {
            console.error("Error fetching user data:", userError);
            setUser(null);
          } else {
            setUser(userData);
          }
        } else {
          setUser(null);
          setSession(null);
        }
      }
    );

    getSessionAndUser();

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getSessionAndStaff = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error);
        setLoading(false);
        return;
      }

      const currentSession = data?.session ?? null;
      setSession(currentSession);

      if (currentSession) {
        const staffEmail = currentSession.user.email;

        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .eq("email", staffEmail)
          .single();

        if (staffError) {
          console.error("Error fetching staff data:", staffError);
        } else {
          setStaff(staffData);
        }
      }

      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (event === "SIGNED_OUT") {
          setSession(null);
          setStaff(null);
        }

        if (newSession) {
          const staffEmail = newSession.user.email;

          const { data: staffData, error: staffError } = await supabase
            .from("staff")
            .select("*")
            .eq("email", staffEmail)
            .single();

          if (staffError) {
            console.error("Error fetching staff data:", staffError);
            setStaff(null);
          } else {
            setStaff(staffData);
          }
        } else {
          setStaff(null);
          setSession(null);
        }
      }
    );

    getSessionAndStaff();

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const setUserData = (userData) => {
    setUser(userData);
  };

  const setStaffData = (data) => setStaff(data);

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
