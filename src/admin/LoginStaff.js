import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Logo from "../assets/official_logo.png";
import { useAuth } from "../context/AuthContext";

const LoginStaff = () => {
  const { setStaffData } = useAuth();
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async () => {
    const { data: staffData, error: fetchError } = await supabase
      .from("staff")
      .select("*")
      .eq("staff_id", staffId)
      .single();

    console.log("Check Staff: ", staffData);

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
      setStaffData(staffData);
      navigate("/Staff/Dashboard/");
    }
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
              LIBRARY STAFF
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
                label="Staff ID"
                type="text"
                variant="standard"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
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

export default LoginStaff;
