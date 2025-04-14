import React from "react";
import { Link } from "react-router-dom";
import "../css/Login.css";
import Logo from "../assets/official_logo.png";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginStaff = () => {
    navigate("/Login/Staff/");
  };

  const handleLoginUser = () => {
    navigate("/Login/User/");
  };

  return (
    <div className="login-container">
      <div className="LEFTlogo">
        <img src={Logo} alt="Main Logo" />
      </div>

      <div className="RIGHTcontent">
        <h1 className="LOGIN">LOGIN AS</h1>
        <button className="firstBUTTON" onClick={handleLoginStaff}>
          Library Staff
        </button>
        <button className="secondBUTTON" onClick={handleLoginUser}>
          Library User
        </button>
        <p className="NOaccount">
          No account for User?{" "}
          <b>
            <Link to="/signup">Sign up here</Link>
          </b>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
