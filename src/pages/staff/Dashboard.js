import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  CssBaseline,
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputBase,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddBoxIcon from "@mui/icons-material/AddBox";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardHome from "../../pages/staff/Home";
import AddBook from "../../pages/staff/AddBook";
import Barcode from "../../pages/staff/Barcode";
import Transaction from "../../pages/staff/Transaction";
import officialLogo from "../../assets/official_logo.png";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { supabase } from "../../supabase/client";
import { useNavigate } from "react-router-dom";

const drawerWidth = 250;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backgroundColor: "#ffffff",
  color: "#000000",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  flexDirection: "row",
  justifyContent: "space-between",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "center",
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "20px",
  borderWidth: "0.5px",
  borderStyle: "solid",
  borderColor: " #4bc0c0",
  backgroundColor: " #f0f8ff",
  "&:hover": {
    backgroundColor: "rgb(193, 226, 255)",
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [setDrawerOpen] = React.useState(false);
  const handleDrawerOpen = () => setOpen(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/Login/Staff/");
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const navItems = [
    {
      text: "Dashboard",
      icon: (
        <DashboardIcon
          sx={{
            color: "#0074cc",
          }}
        />
      ),
    },
    {
      text: "Add New Book",
      icon: (
        <AddBoxIcon
          sx={{
            color: "#0074cc",
          }}
        />
      ),
    },
    {
      text: "Barcode",
      icon: (
        <QrCodeScannerIcon
          sx={{
            color: "#0074cc",
          }}
        />
      ),
    },
    {
      text: "Transaction",
      icon: (
        <ReceiptIcon
          sx={{
            color: "#0074cc",
          }}
        />
      ),
    },
    {
      text: "Log Out",
      icon: (
        <LogoutIcon
          sx={{
            color: "#0074cc",
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", backgroundColor: "#e6f4fb" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <div
            onClick={handleDrawerOpen}
            aria-label="open drawer"
            style={{
              color: "inherit",
              display: open ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 8,
              marginRight: 20,
            }}
          >
            <MenuIcon />
          </div>
          <img
            src={officialLogo}
            alt="Logo"
            style={{ marginRight: "10px", height: "50px" }}
          />
          <Typography variant="h6" noWrap component="div">
            {activeSection}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
      >
        <div
          onClick={() => setOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            height: "80px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f0f0f0")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <ChevronLeftIcon sx={{ fontSize: 30 }} />
        </div>

        <List>
          {navItems.map(({ text, icon }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                onClick={() => {
                  if (text === "Log Out") {
                    handleLogout();
                  } else {
                    setActiveSection(text);
                  }
                  setOpen(false);
                }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Main open={open}>
        <DrawerHeader />
        <Box mt={2}>
          {activeSection === "Dashboard" && <DashboardHome />}
          {activeSection === "Add New Book" && <AddBook />}
          {activeSection === "Barcode" && <Barcode />}
          {activeSection === "Transaction" && <Transaction />}
          {activeSection === "Log Out" && null}
        </Box>
      </Main>
    </Box>
  );
};

export default Dashboard;
