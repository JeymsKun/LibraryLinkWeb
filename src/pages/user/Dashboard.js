import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MenuIcon from "@mui/icons-material/Menu";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ExploreIcon from "@mui/icons-material/Explore";
import LogoutIcon from "@mui/icons-material/Logout";
import Library from "../../pages/user/Library";
import Booking from "../../pages/user/Booking";
import Browse from "../../pages/user/Browse";
import officialLogo from "../../assets/official_logo.png";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { supabase } from "../../supabase/client";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(2),
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState("");
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Library");
  const [libraryView, setLibraryView] = useState("grid");
  const [selectedBookId, setSelectedBookId] = useState(null);

  const handleDrawerOpen = () => setOpen(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [setTime]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/Login/User/");
  };

  const navItems = [
    {
      text: "Library",
      icon: <LibraryBooksIcon sx={{ color: "#0074cc" }} />,
    },
    {
      text: "Booking",
      icon: <EventAvailableIcon sx={{ color: "#0074cc" }} />,
    },
    {
      text: "Browse",
      icon: <ExploreIcon sx={{ color: "#0074cc" }} />,
    },
    {
      text: "Logout",
      icon: <LogoutIcon sx={{ color: "#0074cc" }} />,
    },
  ];

  const handleBookClick = (id) => {
    setSelectedBookId(id);
    setLibraryView("about");
  };

  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "#e6f4fb",
      }}
    >
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <div
            onClick={handleDrawerOpen}
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
          <Typography variant="h6" noWrap>
            {activeSection === "Library" && libraryView === "about"
              ? "About This Book"
              : activeSection === "Library" && libraryView === "cart"
              ? "Book Cart"
              : activeSection}
          </Typography>
        </Toolbar>
        {activeSection === "Library" && libraryView === "grid" && (
          <SortIcon sx={{ color: "#0074cc", cursor: "pointer" }} />
        )}

        {activeSection === "Library" && libraryView === "about" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, pr: 2 }}>
            <span style={{ fontSize: "1.5rem", cursor: "pointer" }}>❤️</span>
            <span
              style={{ fontSize: "1.5rem", cursor: "pointer" }}
              onClick={() => setLibraryView("cart")}
            >
              🛒
            </span>
          </Box>
        )}

        {activeSection === "Booking" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              {time}
            </Typography>
            <CalendarTodayIcon sx={{ color: "#0074cc", cursor: "pointer" }} />
          </Box>
        )}
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
                  if (text === "Logout") {
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
        <Box
          mt={2}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100vw",
            minHeight: "100vh",
            backgroundColor: "#e6f4fb",
            overflowY: "auto",
            paddingBottom: "40px",
          }}
        >
          {activeSection === "Library" && (
            <Library
              view={libraryView}
              setView={setLibraryView}
              onBookClick={handleBookClick}
              selectedBookId={selectedBookId}
            />
          )}
          {activeSection === "Booking" && <Booking />}
          {activeSection === "Browse" && <Browse />}
        </Box>
      </Main>
    </Box>
  );
};

export default Dashboard;
