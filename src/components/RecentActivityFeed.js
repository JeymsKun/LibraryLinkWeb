import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Skeleton } from "@mui/material";
import { supabase } from "../supabase/client";

const timeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays <= 1) return `${diffInDays} day ago`;
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

const truncateTitle = (title, maxLength = 30) => {
  if (title.length > maxLength) {
    return title.slice(0, maxLength) + "...";
  }
  return title;
};

const RecentActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      const { data: borrowedBooks, error: borrowError } = await supabase
        .from("booking_cart")
        .select(
          `borrow_date,
          borrow_return_date,
          user_id,
          books:books_id (title)`
        )
        .eq("status", "borrowed");

      if (borrowError) {
        console.error("Error fetching borrowed books: ", borrowError);
      }

      const { data: users, error: userError } = await supabase
        .from("users")
        .select("user_id, full_name, created_at");

      if (userError) {
        console.error("Error fetching users: ", userError);
      }

      const validBorrowedBooks = borrowedBooks || [];
      const validUsers = users || [];

      const borrowedActivities = validBorrowedBooks.map((item) => {
        const borrowTime = new Date(item.borrow_date);
        const returnTime = item.borrow_return_date
          ? new Date(item.borrow_return_date)
          : null;
        const user = validUsers.find((u) => u.user_id === item.user_id);
        const bookTitle = item.books?.title || "Unknown Book Title";

        const activityText = returnTime
          ? `Book "${truncateTitle(bookTitle)}" returned`
          : `${user ? user.full_name : "Unknown"} borrowed "${truncateTitle(
              bookTitle
            )}"`;

        return {
          text: activityText,
          time: borrowTime,
        };
      });

      const userRegistrations = validUsers.map((user) => ({
        text: `New user "${user.full_name}" registered`,
        time: new Date(user.created_at),
      }));

      const combinedActivities = [...borrowedActivities, ...userRegistrations];

      const oneDayAgo = new Date().setHours(new Date().getHours() - 24);
      const recentActivities = combinedActivities.filter(
        (activity) => activity.time >= oneDayAgo
      );

      recentActivities.sort((a, b) => b.time - a.time);

      const limitedActivities = recentActivities.slice(0, 4);

      setActivities(limitedActivities);
      setLoading(false);
    };

    fetchRecentActivities();
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{ p: 2, height: 400, minWidth: 300, overflow: "hidden" }}
    >
      <Typography variant="h6" mb={2}>
        Recent Activity Feed
      </Typography>
      {loading ? (
        <Box>
          <Skeleton variant="text" width="80%" height={20} mb={1} />
          <Skeleton variant="text" width="70%" height={20} mb={1} />
          <Skeleton variant="text" width="90%" height={20} mb={1} />
          <Skeleton variant="text" width="75%" height={20} mb={1} />
        </Box>
      ) : activities.length > 0 ? (
        activities.map((activity, idx) => (
          <Box key={idx} mb={2}>
            <Typography
              sx={{
                fontSize: "0.875rem",
                wordBreak: "break-word",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
              }}
            >
              {activity.text}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {timeAgo(activity.time)}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No recent activities available.
        </Typography>
      )}
    </Paper>
  );
};

export default RecentActivityFeed;
