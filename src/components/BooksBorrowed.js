import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Paper,
  CardMedia,
  useTheme,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  Skeleton,
} from "@mui/material";
import { supabase } from "../supabase/client";
import { useAuth } from "../context/AuthContext";

const BooksBorrowed = ({ setNoticeVisible, handleBookClick }) => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const { user } = useAuth();

  const fetchBorrowedBooks = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("booking_requests")
      .select(
        "request_id, books_id, status, books:books_id (title, author, cover_image_url)"
      )
      .eq("user_id", user.user_id)
      .eq("status", "approved");

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
            transaction_id: item.transaction_id,
            title: item.books?.title || "Unknown Title",
            author: item.books?.author || "Unknown Author",
            coverUrl,
            returnDate: item.books?.borrow_return_date,
          };
        })
      );
      setBorrowedBooks(formatted);
      if (formatted.length > 0) setNoticeVisible(true);
    } else {
      console.error("Error fetching borrowed books:", error.message);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBorrowedBooks();
  }, [fetchBorrowedBooks]);

  return (
    <Box
      sx={{
        flex: 1,
        mt: 4,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Books That You Borrowed
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Skeleton
          variant="rectangular"
          width={200}
          height={220}
          sx={{ borderRadius: 2 }}
        />
      ) : borrowedBooks.length > 0 ? (
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
          {borrowedBooks.map((book) => (
            <Paper
              key={book.id}
              onClick={() => handleBookClick(book, "borrowed")}
              sx={{
                width: 200,
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                border: "1px solid #ddd",
                flexShrink: 0,
                minWidth: 200,
                cursor: "pointer",
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
              <Typography variant="body2" color="textSecondary">
                Return by: {book.returnDate}
              </Typography>
            </Paper>
          ))}
        </Box>
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
            No borrowed books
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Once you borrow books, they will show up here.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BooksBorrowed;
