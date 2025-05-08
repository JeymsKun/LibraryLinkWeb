import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Snackbar, Alert, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BooksReadyForPickup from "../../components/BooksReadyForPickup";

const Booking = () => {
  const theme = useTheme();
  const [successVisible, setSuccessVisible] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [borrowedBookTitle, setBorrowedBookTitle] = useState("");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        sx={{
          width: 240,
          p: 2,
          borderRight: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6">Recent Activity</Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>

      <BooksReadyForPickup
        setSuccessVisible={setSuccessVisible}
        setBorrowedBookTitle={setBorrowedBookTitle}
        setNoticeVisible={setNoticeVisible}
      />

      <Snackbar
        open={successVisible}
        onClose={() => setSuccessVisible(false)}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessVisible(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          <strong>Success!</strong> You have booked "
          <span>{borrowedBookTitle || "Untitled Book"}</span>".
          <br />
          Please make sure to pick it up at the library before your selected
          borrowing days end.
        </Alert>
      </Snackbar>

      <Snackbar
        open={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNoticeVisible(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          <strong>
            Your requesting book has been confirmed by library staff!
          </strong>{" "}
          Please make sure to pick it up within the selected days.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Booking;
