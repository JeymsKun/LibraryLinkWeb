import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TransactionCardList from "../../components/TransactionCardList";

const Transaction = () => {
  const [status, setStatus] = useState("All");
  const [dateTime, setDateTime] = useState({
    dayName: "",
    fullDate: "",
    currentTime: "",
  });

  useEffect(() => {
    function updateDateTime() {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const now = new Date();
      const day = now.getDay();
      const date = now.getDate();
      const month = now.getMonth();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHour = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");

      setDateTime({
        dayName: dayNames[day],
        fullDate: `${monthNames[month]} ${date} Today`,
        currentTime: `${displayHour}:${displayMinutes} ${ampm}`,
      });
    }

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleStatusSelect = (e) => {
    setStatus(e.target.value);
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#e6f4fb", minHeight: "100vh" }}>
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={6}
      >
        <Box sx={{ width: 300 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              bgcolor: "#e7ce85",
              mb: 2,
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              {dateTime.dayName}
            </Typography>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
            >
              <Box display="flex" gap={2} fontSize="1em">
                <Typography>{dateTime.fullDate}</Typography>
                <Typography>{dateTime.currentTime}</Typography>
              </Box>
              <CalendarMonthIcon fontSize="large" />
            </Box>
          </Paper>
          <Divider sx={{ mb: 2 }} />
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ alignSelf: "stretch" }}
        />

        <Box
          flex={1}
          sx={{
            minWidth: 400,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5" fontWeight="bold">
              RECENT TRANSACTIONS
            </Typography>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={handleStatusSelect}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      border: "1px solid #ccc",
                      mt: 1,
                    },
                  },
                }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem
                  value="Borrowed"
                  sx={{
                    backgroundColor: "#f4c542",
                    color: "black",
                    justifyContent: "center",
                    "&:hover": { backgroundColor: "#e6b800" },
                  }}
                >
                  Borrowed
                </MenuItem>
                <MenuItem
                  value="Returned"
                  sx={{
                    backgroundColor: "#b4e197",
                    color: "black",
                    justifyContent: "center",
                    "&:hover": { backgroundColor: "#9ad880" },
                  }}
                >
                  Returned
                </MenuItem>
                <MenuItem
                  value="Overdue"
                  sx={{
                    backgroundColor: "#ff3b3b",
                    color: "black",
                    justifyContent: "center",
                    "&:hover": { backgroundColor: "#e53935" },
                  }}
                >
                  Overdue
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box
            sx={{
              maxHeight: 600,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TransactionCardList status={status} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Transaction;
