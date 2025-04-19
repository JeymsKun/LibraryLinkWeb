import React, { useState, useEffect } from "react";
import {
  Checkbox,
  Button,
  Box,
  Typography,
  Divider,
  Card,
  CardMedia,
  Skeleton,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "../supabase/client";
import { useAuth } from "../context/AuthContext";

const BookCart = () => {
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [suggestedLoading, setSuggestedLoading] = useState(true);
  const [suggestedBooksData, setSuggestedBooksData] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();

  const fetchSuggestedBooks = async () => {
    setSuggestedLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("books_id, title, author, cover_image_url");

    if (!error) {
      const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 5);
      const booksWithUrls = await Promise.all(
        shuffled.map(async (book) => {
          let coverUrl = null;
          if (book.cover_image_url) {
            const { data: urlData } = supabase.storage
              .from("library")
              .getPublicUrl(book.cover_image_url.trim());
            coverUrl = urlData?.publicUrl || null;
          }
          return {
            id: book.books_id,
            title: book.title,
            author: book.author,
            coverUrl,
          };
        })
      );
      setSuggestedBooksData(booksWithUrls);
    } else {
      console.error("Error fetching suggested books:", error.message);
    }
    setSuggestedLoading(false);
  };

  useEffect(() => {
    fetchSuggestedBooks();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchPendingBookings = async () => {
      setBooksLoading(true);
      const { data, error } = await supabase
        .from("booking_cart")
        .select(
          "books_id, status, books:books_id (title, author, cover_image_url)"
        )
        .eq("user_id", user.user_id)
        .eq("status", "pending");

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
              title: item.books?.title || "Unknown Title",
              author: item.books?.author || "Unknown Author",
              coverUrl,
            };
          })
        );
        setBooks(formatted);
      } else {
        console.error("Error fetching pending bookings:", error.message);
      }
      setBooksLoading(false);
    };

    fetchPendingBookings();
  }, [user]);

  const handleCheckboxChange = (bookId) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : prev.length < 3
        ? [...prev, bookId]
        : (alert("You can only select up to 3 books."), prev)
    );
  };

  const handleRemoveBook = async (bookId) => {
    const { error } = await supabase
      .from("booking_cart")
      .delete()
      .eq("user_id", user.user_id)
      .eq("books_id", bookId)
      .eq("status", "pending");

    if (!error) {
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
      setSelectedBooks((prevSelected) =>
        prevSelected.filter((id) => id !== bookId)
      );
    } else {
      console.error("Error deleting book from cart:", error.message);
    }
  };

  const requestBooking = async (bookId) => {
    const { error } = await supabase
      .from("booking_cart")
      .update({ status: "confirm" })
      .eq("user_id", user.user_id)
      .eq("books_id", bookId)
      .eq("status", "pending");

    if (error) {
      console.error("Error updating booking status:", error.message);
      alert("Failed to confirm booking.");
    } else {
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
      setSelectedBooks((prevSelected) =>
        prevSelected.filter((id) => id !== bookId)
      );
      alert("Booking confirmed!");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        padding: 2,
        gap: 4,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 250, maxWidth: 300 }}>
        <Typography variant="h6" gutterBottom>
          Suggested Books:
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {(suggestedLoading
          ? Array.from({ length: 5 })
          : suggestedBooksData
        ).map((book, index) => (
          <Box
            key={index}
            sx={{ mb: 2, display: "flex", alignItems: "center" }}
          >
            <Card sx={{ width: 100, height: 130, mr: 2 }}>
              {suggestedLoading ? (
                <Skeleton variant="rectangular" width={100} height={130} />
              ) : (
                <CardMedia
                  component="img"
                  image={book.coverUrl}
                  alt={book.title}
                  sx={{ height: "100%", objectFit: "cover" }}
                />
              )}
            </Card>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  fontWeight: "bold",
                  lineHeight: 1.2,
                }}
              >
                {suggestedLoading ? <Skeleton width="80%" /> : book.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                {suggestedLoading ? <Skeleton width="60%" /> : book.author}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {!isMobile && <Divider orientation="vertical" flexItem />}

      <Box sx={{ flex: 2, display: "flex", flexDirection: "column", gap: 3 }}>
        {booksLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                border: "1px solid #eee",
                borderRadius: 2,
                padding: 2,
              }}
            >
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="rectangular" width={200} height={250} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton width="90%" />
                <Skeleton width="60%" />
              </Box>
            </Box>
          ))
        ) : books.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              marginTop: 5,
              padding: 3,
              border: "1px dashed #ccc",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              You don't have any books in your pending booking cart.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Browse the library and add books you'd like to borrow.
            </Typography>
          </Box>
        ) : (
          books.map((book) => {
            const isSelected = selectedBooks.includes(book.id);
            return (
              <Box
                key={book.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  border: "1px solid #eee",
                  borderRadius: 2,
                  padding: 2,
                }}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleCheckboxChange(book.id)}
                />
                <Card sx={{ width: 200, height: 250 }}>
                  <CardMedia
                    component="img"
                    image={book.coverUrl || "/default-cover.png"}
                    alt={book.title}
                    sx={{ objectFit: "cover", height: "100%" }}
                  />
                </Card>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {book.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {book.author}
                  </Typography>
                </Box>
                {isSelected && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      ml: "auto",
                    }}
                  >
                    <IconButton
                      onClick={() => handleRemoveBook(book.id)}
                      sx={{ color: "red" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => requestBooking(book.id)}
                      sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                    >
                      Request Booking
                    </Button>
                  </Box>
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default BookCart;
