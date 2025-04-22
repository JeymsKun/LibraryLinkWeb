import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  IconButton,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  OutlinedInput,
  Divider,
  Skeleton,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import SearchIcon from "@mui/icons-material/Search";
import { supabase } from "../../supabase/client";
import { useAuth } from "../../context/AuthContext";
import { KeyboardArrowLeft } from "@mui/icons-material";
import AboutBook from "../../components/AboutBook";
import BookCart from "../../components/BookCart";

const UserBrowse = ({ view, setView, onBookClick, selectedBookId }) => {
  const { user } = useAuth();
  const userId = user?.user_id;
  const [genres, setGenres] = useState([]);
  const [booksByGenre, setBooksByGenre] = useState({});
  const [selectedGenre, setSelectedGenre] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const theme = useTheme();

  const fetchFavoriteBooks = useCallback(async () => {
    const { data, error } = await supabase
      .from("favorites")
      .select("*, books(*)")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching favorites:", error);
      return;
    }

    const resolved = await Promise.all(
      data.map(async ({ books }) => {
        const { data: urlData } = supabase.storage
          .from("library")
          .getPublicUrl(books.cover_image_url.trim());
        return {
          ...books,
          coverUrl: urlData.publicUrl,
        };
      })
    );

    setFavoriteBooks(resolved);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchFavoriteBooks();
    } else {
      setFavoriteBooks([]);
    }
  }, [userId, fetchFavoriteBooks]);

  useEffect(() => {
    const fetchGenres = async () => {
      const { data, error } = await supabase
        .from("genres")
        .select("*")
        .order("name", { ascending: true });

      if (!error && data) {
        setGenres(data);
        fetchBooksForGenres(data);
      }
    };

    fetchGenres();
  }, []);

  const fetchBooksForGenres = async (genresList) => {
    setLoading(true);
    const result = {};

    for (const genre of genresList) {
      const { data, error } = await supabase
        .from("book_genres")
        .select("books:books_id(*)")
        .eq("genre_id", genre.genre_id);

      if (!error && data) {
        const booksWithUrls = data.map((d) => {
          const book = d.books;
          const { data: publicUrlData } = supabase.storage
            .from("library")
            .getPublicUrl(book.cover_image_url);

          return {
            ...book,
            cover_image_url: publicUrlData.publicUrl,
          };
        });

        result[genre.name] = booksWithUrls;
      }
    }

    setBooksByGenre(result);
    setLoading(false);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      setSelectedGenre("");
    }
  };

  const getFontSize = (length, baseSize) => {
    if (length > 30) return `${baseSize - 0.3}rem`;
    if (length > 20) return `${baseSize - 0.2}rem`;
    if (length > 10) return `${baseSize - 0.1}rem`;
    return `${baseSize}rem`;
  };

  const handleBackToLibrary = () => setView("book");

  const ButtonGroup = () => (
    <Box sx={{ mb: 2, pl: 2, pt: 2 }}>
      <Button
        onClick={handleBackToLibrary}
        sx={{
          textTransform: "none",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          color: theme.palette.text.secondary,
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
            color: theme.palette.primary.main,
          },
        }}
      >
        <KeyboardArrowLeft /> Back to Library
      </Button>
    </Box>
  );

  if (view === "about")
    return (
      <>
        <ButtonGroup />
        <AboutBook bookId={selectedBookId} />
      </>
    );
  if (view === "cart")
    return (
      <>
        <ButtonGroup />
        <BookCart />
      </>
    );

  const handleBookClick = async (bookId) => {
    console.log("Book clicked:", bookId);

    if (!userId || !bookId) return;

    const { data: existing, error: checkError } = await supabase
      .from("user_library")
      .select("user_library_id")
      .eq("user_id", userId)
      .eq("books_id", bookId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking book view record:", checkError.message);
      return;
    }

    if (!existing) {
      const { error: insertError } = await supabase
        .from("user_library")
        .insert([
          {
            user_id: userId,
            books_id: bookId,
          },
        ]);

      if (insertError) {
        console.error("Failed to log book view:", insertError.message);
      }
    }

    onBookClick(bookId);
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 4,
        backgroundColor: "#e6f4fb",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          width: "100%",
          maxWidth: 700,
          mb: 6,
        }}
      >
        <FormControl fullWidth size="small" variant="outlined">
          <OutlinedInput
            size="small"
            placeholder="Search a book"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} edge="end" size="small">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
            sx={{ borderRadius: 2 }}
          />
        </FormControl>

        <FormControl sx={{ minWidth: { xs: "100%", sm: 250 } }} size="small">
          <InputLabel id="genre-select-label">Genre</InputLabel>
          <Select
            labelId="genre-select-label"
            value={selectedGenre}
            onChange={handleGenreChange}
            label="Genre"
            MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
          >
            <MenuItem value="">All Genres</MenuItem>
            {genres.map((genre) => (
              <MenuItem key={genre.genre_id} value={genre.name}>
                {genre.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ width: "100%", maxWidth: 1200 }}>
        {(selectedGenre
          ? genres.filter((g) => g.name === selectedGenre)
          : genres
        ).map((genre, index) => {
          const books = booksByGenre[genre.name] || [];

          return (
            <Box key={genre.genre_id} sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 1, textAlign: "left" }}
              >
                {genre.name}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  overflowX: books.length > 0 ? "auto" : "hidden",
                  gap: 2,
                  pb: 1,
                  minHeight: 220,
                  alignItems: "center",
                  justifyContent: books.length === 0 ? "center" : "flex-start",
                }}
              >
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <Box key={i} sx={{ minWidth: 120 }}>
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={160}
                        sx={{ marginBottom: 1 }}
                      />
                      <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                      <Skeleton variant="text" sx={{ fontSize: "0.8rem" }} />
                    </Box>
                  ))
                ) : books.length > 0 ? (
                  books
                    .filter((book) => {
                      const term = searchTerm.toLowerCase();
                      return (
                        book.title.toLowerCase().includes(term) ||
                        book.author.toLowerCase().includes(term)
                      );
                    })

                    .map((book) => (
                      <Box
                        key={book.books_id}
                        sx={{
                          width: 140,
                          height: 240,
                          flexShrink: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          backgroundColor: "#cce6f9",
                          borderRadius: 2,
                          p: 1,
                          boxShadow: 2,
                        }}
                      >
                        <Box
                          component="img"
                          src={book.cover_image_url}
                          alt={book.title}
                          sx={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                            borderRadius: 1,
                            backgroundColor: "#ccc",
                            cursor: "pointer",
                          }}
                          onClick={() => handleBookClick(book.books_id)}
                        />
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            mt: 0.5,
                            fontSize: getFontSize(book.title.length, 0.9),
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "100%",
                          }}
                        >
                          {book.title}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#555",
                            fontSize: getFontSize(book.author.length, 0.8),
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "100%",
                          }}
                        >
                          {book.author}
                        </Typography>
                      </Box>
                    ))
                ) : (
                  <Typography
                    sx={{
                      color: "gray",
                      fontStyle: "italic",
                      textAlign: "center",
                      px: 2,
                    }}
                  >
                    No books available in this genre yet.
                  </Typography>
                )}
              </Box>

              {index !== genres.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default UserBrowse;
