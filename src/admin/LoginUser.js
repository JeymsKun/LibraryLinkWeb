import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Logo from "../assets/official_logo.png";
import { useAuth } from "../context/AuthContext";

const LoginUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setUserData } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Check data: ", data);

    if (error) {
      alert("Invalid email or password. Please try again.");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (userError) {
      alert("Error fetching user data: " + userError.message);
      return;
    }

    if (!userData || userData.role !== "user") {
      alert("Invalid email or password. Please try again.");
      return;
    }

    setUserData(userData);
    navigate("/User/Dashboard/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: theme.palette.background.default,
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            gap: 4,
            borderRadius: 5,
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={Logo}
              alt="Main Logo"
              sx={{
                width: isMobile ? "60%" : "80%",
                maxWidth: 200,
                height: "auto",
              }}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 3, fontWeight: "bold", letterSpacing: 1 }}
            >
              LIBRARY USER
            </Typography>

            <Box
              sx={{
                border: `2px solid ${theme.palette.primary.main}`,
                borderRadius: 5,
                p: 3,
                width: "100%",
                maxWidth: 300,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <TextField
                label="Email"
                type="email"
                variant="standard"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="standard"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          size="small"
                          edge="end"
                          sx={{ width: 32, height: 32 }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Button
              onClick={handleLogin}
              variant="contained"
              sx={{
                mt: 3,
                width: 150,
                bgcolor: theme.palette.primary.main,
                color: "white",
                fontWeight: "bold",
                borderRadius: 5,
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              LOGIN
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginUser;
