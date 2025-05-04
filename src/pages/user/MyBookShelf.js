import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardMedia,
  CardContent,
  useTheme,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Skeleton,
} from "@mui/material";
import { KeyboardArrowLeft } from "@mui/icons-material";
import AboutBook from "../../components/AboutBook";
import BookCart from "../../components/BookCart";
import { supabase } from "../../supabase/client";
import { useAuth } from "../../context/AuthContext";

const Library = ({ view, setView, onBookClick, selectedBookId }) => {
  const { user } = useAuth();
  const userId = user?.user_id;
  const [books, setBooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const theme = useTheme();
  const pageSize = 10;
  const observer = useRef();
  const [recentBooks, setRecentBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);

  const fetchRecentlyViewedBooks = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("user_library")
      .select("books_id, viewed_at")
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false });

    if (error) {
      console.error("Error fetching recently viewed books:", error);
      return;
    }

    if (data.length === 0) {
      return setRecentBooks([]);
    }

    const bookIds = data.map((entry) => entry.books_id);
    const { data: booksData, error: booksError } = await supabase
      .from("books")
      .select("*")
      .in("books_id", bookIds);

    if (booksError) {
      console.error("Error fetching books:", booksError);
      return;
    }

    const booksWithUrls = await Promise.all(
      booksData.map(async (book) => {
        const { data: urlData } = supabase.storage
          .from("library")
          .getPublicUrl(book.cover_image_url.trim());
        return {
          ...book,
          coverUrl: urlData.publicUrl,
        };
      })
    );

    setRecentBooks(booksWithUrls);
  }, [userId]);

  useEffect(() => {
    if (view === "grid") {
      fetchRecentlyViewedBooks();
    }
  }, [view, fetchRecentlyViewedBooks]);

  const fetchBooks = async (pageIndex = 0) => {
    setLoading(true);
    const from = pageIndex * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .range(from, to);
    if (error) {
      console.error("Error fetching books:", error);
      setLoading(false);
      return;
    }

    const booksWithUrls = await Promise.all(
      data.map(async (book) => {
        const { data: urlData } = supabase.storage
          .from("library")
          .getPublicUrl(book.cover_image_url.trim());
        return {
          ...book,
          coverUrl: urlData.publicUrl,
        };
      })
    );

    setBooks((prev) => {
      const merged = [...prev, ...booksWithUrls];
      const unique = Array.from(
        new Map(merged.map((b) => [b.books_id, b])).values()
      );
      return unique;
    });

    setHasMore(data.length === pageSize);
    setLoading(false);
  };

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
    fetchBooks(page);
    if (userId) {
      fetchFavoriteBooks();
    } else {
      setFavoriteBooks([]);
    }
  }, [page, userId, fetchFavoriteBooks]);

  const fetchReturnedBooks = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("booking_requests")
      .select("*, books(*)")
      .eq("user_id", userId)
      .eq("status", "waiting");

    if (error) {
      console.error("Error fetching approved booking requests:", error);
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

    setReturnedBooks(resolved);
  }, [userId]);

  useEffect(() => {
    if (view === "pending") {
      fetchReturnedBooks();
    }
  }, [view, fetchReturnedBooks]);

  const lastBookRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const handleBackToLibrary = () => setView("grid");

  const handleViewFavorites = () => setView("favorites");

  const handleViewReturned = () => setView("pending");

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
        <KeyboardArrowLeft /> Back to Bookshelf
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

  const bookList =
    view === "favorites"
      ? favoriteBooks
      : view === "grid"
      ? recentBooks
      : view === "pending"
      ? returnedBooks
      : books;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          width: 240,
          p: 2,
          borderRight: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Bookshelf Log
        </Typography>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleBackToLibrary}>
              <ListItemText primary="My Recently View" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleViewReturned}>
              <ListItemText primary="My Pending" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleViewFavorites}>
              <ListItemText primary="My Favorite" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider sx={{ mt: 2 }} />
      </Box>

      <Box sx={{ flex: 1, p: 4, width: 800 }}>
        <Typography variant="h5" gutterBottom>
          {view === "favorites"
            ? "My Favorite Books"
            : view === "pending"
            ? "My Pending Books"
            : "Recently Viewed Books"}
        </Typography>

        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 3,
            pb: 2,
            px: 1,
            scrollSnapType: "x mandatory",
            "& > *": {
              scrollSnapAlign: "start",
            },
            "&::-webkit-scrollbar": { height: 8 },
            "&::-webkit-scrollbar-thumb": {
              background: theme.palette.primary.main,
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-track": { background: "#f1f1f1" },
          }}
        >
          {bookList.length === 0 && !loading && (
            <Box sx={{ minHeight: 240, display: "flex", alignItems: "center" }}>
              <Typography variant="body1" color="textSecondary">
                {view === "favorites"
                  ? "You don't have any favorite books yet."
                  : "No books available."}
              </Typography>
            </Box>
          )}
          {(loading && bookList.length === 0
            ? Array.from({ length: 6 })
            : bookList
          ).map((book, index) => {
            const isLast = index === bookList.length - 1;
            return (
              <Card
                ref={!loading && isLast && hasMore ? lastBookRef : undefined}
                key={book?.books_id || index}
                onClick={
                  !loading ? () => onBookClick(book.books_id) : undefined
                }
                sx={{
                  width: 200,
                  flexShrink: 0,
                  boxShadow: 3,
                  cursor: loading ? "default" : "pointer",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: loading ? "none" : "scale(1.03)",
                  },
                }}
              >
                {loading ? (
                  <Skeleton variant="rectangular" height={240} />
                ) : (
                  <CardMedia
                    component="img"
                    height="240"
                    image={book.coverUrl}
                    alt={book.title}
                    sx={{ objectFit: "cover" }}
                  />
                )}
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    p: 1,
                  }}
                >
                  {loading ? (
                    <>
                      <Skeleton width="80%" height={20} />
                      <Skeleton width="60%" height={18} sx={{ mt: 0.5 }} />
                    </>
                  ) : (
                    <>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          fontSize: 14,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          width: "100%",
                          color: theme.palette.text.primary,
                        }}
                      >
                        {book.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 13,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          width: "100%",
                          mt: 0.5,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {book.author}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
        <Divider sx={{ mt: 2 }} />
      </Box>
    </Box>
  );
};

export default Library;
