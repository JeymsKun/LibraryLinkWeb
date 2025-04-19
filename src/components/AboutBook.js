import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  Divider,
  MobileStepper,
  Skeleton,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";

const SUPABASE_URL = "https://ejgelmxicmlgzzpksbip.supabase.co";
const BUCKET_NAME = "library";

const makePublicUrl = (path) =>
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;

const AboutBook = ({ bookId }) => {
  const { user } = useAuth();
  const userId = user?.user_id;
  const params = useParams();
  const id = bookId || params.id;
  const [book, setBook] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogImage, setDialogImage] = useState("");
  const { addBooking } = useBooking();
  const [favorites, setFavorites] = useState([]);

  const handleAddToBookingCart = async () => {
    if (!userId) {
      alert("You need to be logged in to add books to the booking cart.");
      return;
    }

    if (book.copies === 0) {
      alert("This book is currently unavailable.");
      return;
    }

    const status = "pending";

    addBooking({
      bookId: book.books_id,
      userId,
      status,
    });
  };

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        alert("No book ID provided.");
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("books_id", id)
        .single();

      if (error) {
        alert("Error fetching book: " + error.message);
      } else {
        setBook(data);
      }

      setLoading(false);
    };

    fetchBook();
  }, [id]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("favorites")
        .select("books_id")
        .eq("user_id", userId);

      if (!error && data) {
        setFavorites(data.map((fav) => fav.books_id));
      }
    };

    fetchFavorites();
  }, [userId, book]);

  const handleFavoriteClick = async () => {
    if (!userId) {
      alert("You need to be logged in to add favorites.");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (userError || !userData) {
      alert("User not found.");
      return;
    }

    const isFavorite = favorites.includes(book.books_id);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("books_id", book.books_id);

      if (error) {
        alert("Error removing from favorites: " + error.message);
      } else {
        setFavorites(favorites.filter((id) => id !== book.books_id));
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert([{ user_id: userId, books_id: book.books_id }]);
      if (error) {
        alert("Error adding to favorites: " + error.message);
      } else {
        setFavorites([...favorites, book.books_id]);
      }
    }
  };

  const images = book
    ? [
        makePublicUrl(book.cover_image_url),
        ...(book.image_urls || []).map(makePublicUrl),
      ]
    : [];

  const handleImageClick = (imageUrl) => {
    setDialogImage(imageUrl);
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        <Box sx={{ flex: "1", maxWidth: 400 }}>
          <Card>
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height={400} />
            ) : (
              <CardMedia
                component="img"
                height="400"
                image={images[currentIndex]}
                alt="Book image"
                sx={{
                  objectFit: "contain",
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                }}
                onClick={() => handleImageClick(images[currentIndex])}
              />
            )}
            {images.length > 1 && !loading && (
              <MobileStepper
                variant="dots"
                steps={images.length}
                position="static"
                activeStep={currentIndex}
                nextButton={
                  <Button
                    size="small"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    disabled={currentIndex === images.length - 1}
                  >
                    Next <KeyboardArrowRight />
                  </Button>
                }
                backButton={
                  <Button
                    size="small"
                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                    disabled={currentIndex === 0}
                  >
                    <KeyboardArrowLeft /> Back
                  </Button>
                }
              />
            )}
          </Card>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            {loading ? (
              <Skeleton variant="rectangular" width={150} height={40} />
            ) : (
              <Button
                variant="contained"
                color="primary"
                sx={{ fontWeight: "bold" }}
                onClick={handleAddToBookingCart}
                disabled={book?.copies === 0}
              >
                Add to Booking Cart
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ flex: 2, minWidth: 0 }}>
          <Box sx={{ wordBreak: "break-word" }}>
            {loading ? (
              <>
                <Skeleton width="60%" height={30} />
                <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
              </>
            ) : (
              <>
                <Typography
                  variant="h5"
                  sx={{
                    wordBreak: "break-word",
                    fontSize: { xs: "1.2rem", md: "1.5rem" },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {book.title}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      cursor: "pointer",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.2)",
                      },
                    }}
                    onClick={handleFavoriteClick}
                  >
                    <span style={{ fontSize: "1.5rem" }}>
                      {favorites.includes(book.books_id) ? "❤️" : "🤍"}
                    </span>
                  </Box>
                </Typography>

                {book.author && (
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{
                      wordBreak: "break-word",
                      fontSize: { xs: "0.95rem", md: "1rem" },
                    }}
                  >
                    by {book.author}
                  </Typography>
                )}

                {book.genre && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}
                  >
                    Genre: {book.genre}
                  </Typography>
                )}
              </>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ wordBreak: "break-word" }}>
            {loading ? (
              <>
                <Skeleton width="50%" height={20} />
                <Skeleton width="70%" height={20} sx={{ mt: 1 }} />
                <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
                <Skeleton width="80%" height={20} sx={{ mt: 1 }} />
              </>
            ) : (
              <>
                {book.publisher && (
                  <Typography
                    sx={{ mb: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}
                  >
                    <strong>Publisher:</strong> {book.publisher}
                  </Typography>
                )}

                {book.published_date && (
                  <Typography
                    sx={{ mb: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}
                  >
                    <strong>Publish Date:</strong> {book.published_date}
                  </Typography>
                )}

                {book.copies !== undefined && (
                  <Typography
                    sx={{
                      mb: 1,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      color: book.copies === 0 ? "error.main" : "text.primary",
                    }}
                  >
                    <strong>Total Copies:</strong>{" "}
                    {book.copies === 0 ? "Unavailable" : book.copies}
                  </Typography>
                )}

                <Typography
                  sx={{ mb: 2, fontSize: { xs: "0.9rem", md: "1rem" } }}
                >
                  <strong>Description:</strong> {book.description}
                </Typography>

                {book.barcode_code && (
                  <Typography sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}>
                    <strong>Barcode:</strong> {book.barcode_code}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <img
            src={dialogImage}
            alt=""
            style={{
              width: "auto",
              height: "auto",
              maxWidth: "100%",
              maxHeight: "100vh",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AboutBook;
