import React, { useEffect } from "react";
import { Box, Grid } from "@mui/material";
import DashboardCards from "../../components/DashboardCards";
import BookAvailability from "../../components/BookAvailability";
import BorrowedTrends from "../../components/BorrowedTrends";
import RecentActivityFeed from "../../components/RecentActivityFeed";
import RecentTransactionsTable from "../../components/RecentTransactionsTable";
import UserSummaryTable from "../../components/UserSummaryTable";
import BookingRequestsTable from "../../components/BookingRequestsTable";
import { supabase } from "../../supabase/client";
import { useNotification } from "../../components/NotificationProvider";

const DashboardHome = () => {
  const { showNotification } = useNotification();

  useEffect(() => {
    const checkPendingRequests = async () => {
      const { data, error } = await supabase
        .from("booking_requests")
        .select("request_id")
        .eq("status", "waiting");

      if (error) {
        console.error("Error fetching booking requests:", error);
        return;
      }

      if (data.length > 0) {
        showNotification(
          `${data.length} user(s) have requested to borrow books.`,
          "info"
        );
      }
    };

    checkPendingRequests();
  }, [showNotification]);

  return (
    <Box p={3} bgcolor="#e6f4fb">
      <DashboardCards />
      <RecentTransactionsTable />
      <BookingRequestsTable />
      <UserSummaryTable />
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
