import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Logo from "../assets/official_logo.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        display: "flex",
        flexDirection: "column",
        px: 2,
        py: 4,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 4,
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            flexGrow: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              width: "100%",
              maxWidth: 800,
              mx: "auto",
              p: 4,
              bgcolor: "white",
              borderRadius: 5,
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
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
                px: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 3, fontWeight: "bold", letterSpacing: 1 }}
              >
                LOGIN AS
              </Typography>

              <Button
                onClick={() => navigate("/Login/Staff/")}
                variant="contained"
                fullWidth
                disableElevation
                sx={{
                  maxWidth: 250,
                  borderRadius: 5,
                  mb: 2,
                  backgroundColor: theme.palette.staff.main,
                  color: theme.palette.staff.contrastText,
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: theme.palette.staff.dark,
                  },
                }}
              >
                Library Staff
              </Button>

              <Button
                onClick={() => navigate("/Login/User/")}
                variant="contained"
                fullWidth
                disableElevation
                sx={{
                  maxWidth: 250,
                  borderRadius: 5,
                  backgroundColor: theme.palette.user.main,
                  color: theme.palette.user.contrastText,
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: theme.palette.user.dark,
                  },
                }}
              >
                Library User
              </Button>

              <Typography variant="body2" sx={{ mt: 4 }}>
                No account for User?{" "}
                <Link
                  to="/Login/Signup/"
                  style={{
                    fontWeight: "bold",
                    textDecoration: "none",
                    color: theme.palette.primary.main,
                  }}
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Box
        sx={{
          mt: 4,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 2,
          textAlign: "center",
        }}
      >
        {[
          { label: "About Library Link", path: "/about" },
          { label: "Privacy Policy", path: "/privacy" },
          { label: "Terms of Service", path: "/terms" },
          { label: "Report an issue", path: "/report" },
          { label: "Help", path: "/help" },
        ].map((link, index) => (
          <Typography
            key={index}
            variant="body2"
            component={Link}
            to={link.path}
            sx={{
              color: theme.palette.text.secondary,
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
                color: theme.palette.primary.main,
              },
            }}
          >
            {link.label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default LoginPage;
