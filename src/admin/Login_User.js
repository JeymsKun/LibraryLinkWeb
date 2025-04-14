import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import "../css/Login_Staff_User.css";
import Logo from "../assets/official_logo.png";

const LoginUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/User/Dashboard/");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async () => {
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      alert("Invalid email or password. Please try again.");
      return;
    }

    navigate("/User/Dashboard/");
  };

  return (
    <div className="login-container">
      <div className="LEFTlogo">
        <img src={Logo} alt="Main Logo" />
      </div>

      <div className="RIGHTcontent">
        <h1 className="LOGIN">LIBRARY USER</h1>

        <div className="input-container">
          <p className="USERname">Email</p>
          <input
            type="email"
            className="input-line"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

export default LoginUser;
