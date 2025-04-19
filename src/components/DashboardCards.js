import React, { useEffect, useState } from "react";
import { Grid, Paper, Box, Typography } from "@mui/material";
import { supabase } from "../supabase/client";

const DashboardCards = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    borrowed: 0,
    returned: 0,
    unreturned: 0,
    users: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: bookCount } = await supabase
        .from("books")
        .select("*", { count: "exact", head: true });

      const { count: userCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      const { data: userBooks } = await supabase.from("booking_cart").select();

      const borrowed =
        userBooks?.filter((b) => b.status === "borrowed").length || 0;

      // Check for "returned" based on borrow_return_date
      const now = new Date();
      const returned =
        userBooks?.filter((b) => {
          const borrowReturnDate = new Date(b.borrow_return_date);
          return borrowReturnDate <= now;
        }).length || 0;

      const unreturned =
        userBooks?.filter((b) => {
          const borrowReturnDate = new Date(b.borrow_return_date);
          return (
            b.status === "borrowed" &&
            (isNaN(borrowReturnDate) || borrowReturnDate > now)
          );
        }).length || 0;

      setStats({
        totalBooks: bookCount || 0,
        borrowed,
        returned,
        unreturned,
        users: userCount || 0,
      });
    };

    fetchStats();
  }, []);

  const percent = (value) => {
    if (!stats.totalBooks || stats.totalBooks === 0) return "0";
    return `${((value / stats.totalBooks) * 100).toFixed(1)}%`;
  };

  const userRatio = () => {
    if (stats.users === 0) return "0";
    const base = 100;
    return `${((stats.users / base) * 100).toFixed(1)}%`;
  };

  const cards = [
    {
      label: "Borrowed",
      value: percent(stats.borrowed),
      icon: "📦",
      bg: "#f8de7e",
    },
    {
      label: "Unreturned",
      value: percent(stats.unreturned),
      icon: "⏰",
      bg: "#f08080",
    },
    {
      label: "Returned",
      value: percent(stats.returned),
      icon: "✅",
      bg: "#90ee90",
    },
    {
      label: "Users",
      value: userRatio(),
      icon: "👥",
      bg: "#dda0dd",
    },
  ];

  return (
    <Grid container spacing={3} justifyContent="center" alignItems="center">
      <Grid item xs={12} md={3}>
        <Paper
          elevation={4}
          sx={{
            backgroundColor: "#87cefa",
            padding: 3,
            borderRadius: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="subtitle1">Total Books</Typography>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              {stats.totalBooks}
            </Typography>
          </Box>
          <Typography fontSize={45}>📚</Typography>
        </Paper>
      </Grid>

      {cards.map((card, i) => (
        <Grid item xs={12} md={2} key={i}>
          <Paper
            elevation={2}
            sx={{
              backgroundColor: card.bg,
              padding: 2,
              borderRadius: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="body2">{card.label}</Typography>
              <Typography variant="h5" sx={{ textAlign: "center" }}>
                {card.value}
              </Typography>
            </Box>
            <Typography fontSize={40}>{card.icon}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardCards;
