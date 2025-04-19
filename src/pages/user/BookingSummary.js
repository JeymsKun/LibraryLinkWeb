import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  Paper,
  Divider,
  CardMedia,
  useTheme,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  Skeleton,
} from "@mui/material";
import { supabase } from "../../supabase/client";
import { useAuth } from "../../context/AuthContext";

const Booking = () => {
  const [successVisible, setSuccessVisible] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [selectedDays, setSelectedDays] = useState("1");
  const [confirmedBooks, setConfirmedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowedBookTitle, setBorrowedBookTitle] = useState("");
  const theme = useTheme();
  const { user } = useAuth();

  const formatDate = (date) => date.toISOString().split("T")[0];

  const getPhilippineDate = () => {
    const now = new Date();
    const phOffset = 8 * 60;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + phOffset * 60000);
  };

  const fetchConfirmedBookings = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("booking_cart")
      .select(
        "booking_id, books_id, status, books:books_id (title, author, cover_image_url)"
      )
      .eq("user_id", user.user_id)
      .eq("status", "confirm");

    if (!error) {
      const formatted = await Promise.all(
        data.map(async (item) => {
          const coverPath = item.books?.cover_image_url?.trim();
          let coverUrl = null;

          if (coverPath) {
            const { data: urlData } = supabase.storage
              .from("library")
              .getPublicUrl(coverPath);
            coverUrl = urlData?.publicUrl || null;
          }

          return {
            id: item.books_id,
            booking_id: item.booking_id,
            title: item.books?.title || "Unknown Title",
            author: item.books?.author || "Unknown Author",
            coverUrl,
            copies: item.books?.copies ?? 0,
          };
        })
      );
      setConfirmedBooks(formatted);
      if (formatted.length > 0) setNoticeVisible(true);
    } else {
      console.error("Error fetching confirmed bookings:", error.message);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConfirmedBookings();
  }, [fetchConfirmedBookings]);

  const handleBooking = async () => {
    if (confirmedBooks.length > 0) {
      const bookToBorrow = confirmedBooks[0];
      const borrowDate = getPhilippineDate();
      const returnDate = new Date(borrowDate);
      returnDate.setDate(borrowDate.getDate() + parseInt(selectedDays));

      const { data: bookData, error: fetchError } = await supabase
        .from("books")
        .select("copies")
        .eq("books_id", bookToBorrow.id)
        .single();

      if (fetchError) {
        console.error("Error fetching book copies:", fetchError.message);
        return;
      }

      if (bookData?.copies <= 0) {
        alert("No more copies available for this book.");
        return;
      }

      const { error: updateBookingError } = await supabase
        .from("booking_cart")
        .update({
          status: "borrowed",
          borrow_date: formatDate(borrowDate),
          borrow_return_date: formatDate(returnDate),
        })
        .eq("books_id", bookToBorrow.id)
        .eq("user_id", user.user_id);

      if (updateBookingError) {
        console.error(
          "Error updating booking status:",
          updateBookingError.message
        );
        return;
      }

      const { error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.user_id,
            booking_id: bookToBorrow.booking_id,
            status: "borrowed",
          },
        ]);

      if (transactionError) {
        console.error("Error inserting transaction:", transactionError.message);
        return;
      }

      const { error: updateCopiesError } = await supabase
        .from("books")
        .update({ copies: bookData.copies - 1 })
        .eq("books_id", bookToBorrow.id);

      if (updateCopiesError) {
        console.error("Error reducing book copies:", updateCopiesError.message);
        return;
      }

      const updatedBooks = confirmedBooks.slice(1);
      setConfirmedBooks(updatedBooks);
      setBorrowedBookTitle(bookToBorrow.title);
      setSuccessVisible(true);
      setTimeout(() => setSuccessVisible(false), 3000);
    }
  };

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

      <Box
        sx={{
          flex: 1,
          padding: 4,
        }}
      >
        {loading ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Skeleton
              variant="rectangular"
              width={450}
              height={200}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="text"
              width={250}
              height={50}
              sx={{ borderRadius: 2 }}
            />
          </Box>
        ) : confirmedBooks.length > 0 ? (
          <>
            <Paper
              elevation={3}
              sx={{
                backgroundColor: theme.palette.booking.main,
                padding: 3,
                display: "flex",
                width: "100%",
                maxWidth: 600,
                margin: "5px auto",
                borderRadius: 2,
                flexDirection: { xs: "column", md: "row" },
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: { xs: "100%", md: 150 },
                  height: { xs: 150, md: 250 },
                  backgroundColor: "white",
                  border: "2px solid black",
                  fontWeight: "bold",
                }}
              >
                {confirmedBooks.length > 0 && (
                  <img
                    src={confirmedBooks[0].coverUrl || "/default-cover.png"}
                    alt={confirmedBooks[0].title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </Box>

              <Box sx={{ flex: 2, paddingLeft: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    wordBreak: "break-word",
                    fontSize: { xs: "1rem", md: "1.2rem" },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <strong>
                    {confirmedBooks.length > 0
                      ? confirmedBooks[0].title
                      : "Book Title"}
                  </strong>
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    wordBreak: "break-word",
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {confirmedBooks.length > 0
                    ? confirmedBooks[0].author
                    : "Author"}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    wordBreak: "break-word",
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {user.full_name}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    wordBreak: "break-word",
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {user.id_number}
                </Typography>

                <FormControl
                  fullWidth
                  sx={{
                    mt: 2,
                    minHeight: "40px",
                    maxWidth: "250px",
                  }}
                >
                  <InputLabel
                    id="days-label"
                    sx={{ fontSize: "0.875rem", lineHeight: 1.2 }}
                  >
                    Select days
                  </InputLabel>
                  <Select
                    labelId="days-label"
                    id="days"
                    value={selectedDays}
                    label="Select days"
                    onChange={(e) => setSelectedDays(e.target.value)}
                    sx={{
                      height: "30px",
                      padding: "6px 12px",
                      fontSize: "0.875rem",
                    }}
                  >
                    {[...Array(6)].map((_, i) => (
                      <MenuItem key={i + 1} value={String(i + 1)}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                  (max. 6 days)
                </Typography>
              </Box>
            </Paper>

            <Box textAlign="center">
              <Button
                variant="contained"
                onClick={handleBooking}
                sx={{
                  mt: 2,
                  backgroundColor: theme.palette.booking.button,
                  color: "black",
                  fontWeight: "bold",
                  fontSize: "15px",
                  "&:hover": {
                    backgroundColor: theme.palette.booking.buttonHover,
                  },
                  px: 4,
                  py: 1.5,
                  borderRadius: "5px",
                }}
              >
                CONFIRM BOOKING
              </Button>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              mt: 5,
              px: 2,
              minHeight: { xs: "150px", md: "250px" },
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No books ready for pickup
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Once your booking is confirmed, it will show up here.
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" gutterBottom>
            Books Ready for Pickup
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Skeleton
              variant="rectangular"
              width={200}
              height={220}
              sx={{ borderRadius: 2 }}
            />
          ) : confirmedBooks.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "nowrap",
                overflowX: "auto",
                gap: 2,
                maxWidth: "100%",
                padding: 2,
              }}
            >
              {confirmedBooks.map((book) => (
                <Paper
                  key={book.id}
                  sx={{
                    width: 200,
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    border: "1px solid #ddd",
                    flexShrink: 0,
                    minWidth: 200,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={book.coverUrl || "/default-cover.png"}
                    alt={book.title}
                    sx={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      mb: 1,
                    }}
                  />
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    noWrap
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}
                  >
                    {book.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    noWrap
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}
                  >
                    {book.author}
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                You don't have any confirmed bookings at the moment.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

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
