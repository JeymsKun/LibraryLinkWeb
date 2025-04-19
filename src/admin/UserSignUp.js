import React, { useState, useEffect } from "react";
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
  useMediaQuery,
  useTheme,
  FormHelperText,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Logo from "../assets/official_logo.png";

const LibraryUserSignup = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  useEffect(() => {
    if (confirmPassword) {
      setPasswordMismatch(password !== confirmPassword);
    } else {
      setPasswordMismatch(false);
    }
  }, [password, confirmPassword]);

  const handleRegister = async () => {
    if (!email || !password || !idNumber || !fullName || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (userError) {
        setError(userError.message);
        setIsLoading(false);
        return;
      }

      if (existingUser) {
        setError("Email already exists.");
        setIsLoading(false);
        return;
      }

      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        setError(signupError.message);
        setIsLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("users")
        .insert([
          { email, id_number: idNumber, full_name: fullName, role: "user" },
        ]);

      if (insertError) {
        setError(insertError.message);
        setIsLoading(false);
        return;
      }

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setIdNumber("");
      setSuccessOpen(true);
    } catch (error) {
      setError("Unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
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
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Box
              component="img"
              src={Logo}
              alt="Main Logo"
              sx={{ width: isMobile ? "60%" : "80%", maxWidth: 200 }}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 3, fontWeight: "bold", letterSpacing: 1 }}
            >
              LIBRARY USER SIGNUP
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
                gap: 2,
              }}
            >
              <TextField
                label="Full Name"
                variant="standard"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
              />
              <TextField
                label="ID Number (School/University)"
                type="number"
                variant="standard"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                fullWidth
              />
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
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                variant="standard"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                error={passwordMismatch}
                helperText={passwordMismatch && "Passwords do not match"}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {error && (
                <FormHelperText error sx={{ mt: 1 }}>
                  {error}
                </FormHelperText>
              )}
            </Box>

            <Button
              onClick={handleRegister}
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
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "REGISTER"}
            </Button>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={successOpen}
        autoHideDuration={6000}
        onClose={() => setSuccessOpen(false)}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
          action={
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                setSuccessOpen(false);
                navigate("/Login/User/");
              }}
            >
              Login Now
            </Button>
          }
        >
          You’ve successfully registered as a Library User!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LibraryUserSignup;
