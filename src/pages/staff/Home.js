import React from "react";
import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import DashboardCards from "../../components/DashboardCards";
import BookAvailability from "../../components/BookAvailability";
import BorrowedTrends from "../../components/BorrowedTrends";
import RecentActivityFeed from "../../components/RecentActivityFeed";

const DashboardHome = () => {
  const theme = useTheme();

  return (
    <Box p={3} bgcolor="#e6f4fb">
      <DashboardCards />

      <Grid container spacing={3} mt={3} justifyContent="center">
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <BorrowedTrends />
        </Grid>

        <Grid
          item
          xs={12}
          md={3}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <BookAvailability />
        </Grid>

        <Grid item xs={12} md={3}>
          <RecentActivityFeed />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
