import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import "../css/Login_Staff_User.css";
import Logo from "../assets/official_logo.png";

const LoginStaff = () => {
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/Staff/Dashboard/");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async () => {
    const { data: staffData, error: fetchError } = await supabase
      .from("staff")
      .select("email")
      .eq("staff_id", staffId)
      .single();

    if (fetchError || !staffData) {
      alert("Staff ID not found.");
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: staffData.email,
      password,
    });

    if (loginError) {
      alert("Invalid password. Please try again.");
    } else {
      navigate("/Staff/Dashboard/");
    }
  };

  return (
    <div className="login-container">
      <div className="LEFTlogo">
        <img src={Logo} alt="Main Logo" />
      </div>

      <div className="RIGHTcontent">
        <h1 className="LOGIN">LIBRARY STAFF</h1>

        <div className="input-container">
          <p className="USERname">Staff ID</p>
          <input
            type="text"
            className="input-line"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
          />

          <p className="PASSword">Password</p>
          <input
            type="password"
            className="input-line"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="LOGINbutton" onClick={handleLogin}>
          LOGIN
        </button>
      </div>
    </div>
  );
};

export default LoginStaff;
