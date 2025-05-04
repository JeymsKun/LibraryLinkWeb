import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { supabase } from "../../supabase/client";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("dateDesc");
  const [genreFilter, setGenreFilter] = useState("All");
  const [expandedRow, setExpandedRow] = useState(null);
  const [genres, setGenres] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select(`*, genres:genre_id (name)`)
        .order("created_at", { ascending: false });

      if (booksError) {
        console.error("Error fetching books:", booksError.message);
      } else {
        setBooks(booksData);
      }

      const { data: genresData, error: genresError } = await supabase
        .from("genres")
        .select("name");

      if (genresError) {
        console.error("Error fetching genres:", genresError.message);
      } else {
        setGenres(["All", ...genresData.map((g) => g.name)]);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    if (books.length > 0) {
      setFilteredBooks(
        books
          .filter((book) => {
            const matchesGenre =
              genreFilter === "All" || book.genres?.name === genreFilter;
            return matchesGenre;
          })
          .sort((a, b) => {
            switch (sortField) {
              case "dateDesc":
                return new Date(b.published_date) - new Date(a.published_date);
              case "dateAsc":
                return new Date(a.published_date) - new Date(b.published_date);
              case "authorAsc":
                return a.author.localeCompare(b.author);
              case "authorDesc":
                return b.author.localeCompare(a.author);
              case "genre":
                return (a.genres?.name || "").localeCompare(
                  b.genres?.name || ""
                );
              default:
                return 0;
            }
          })
          .map((book, index) => ({ ...book, book_number: index + 1 }))
      );
    }
  }, [books, genreFilter, sortField]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === "") {
      // Reset to default filtered and sorted books (without search)
      setFilteredBooks(
        books
          .filter((book) => {
            const matchesGenre =
              genreFilter === "All" || book.genres?.name === genreFilter;
            return matchesGenre;
          })
          .sort((a, b) => {
            switch (sortField) {
              case "dateDesc":
                return new Date(b.published_date) - new Date(a.published_date);
              case "dateAsc":
                return new Date(a.published_date) - new Date(b.published_date);
              case "authorAsc":
                return a.author.localeCompare(b.author);
              case "authorDesc":
                return b.author.localeCompare(a.author);
              case "genre":
                return (a.genres?.name || "").localeCompare(
                  b.genres?.name || ""
                );
              default:
                return 0;
            }
          })
          .map((book, index) => ({
            ...book,
            book_number: index + 1,
          }))
      );
    }
  };

  const handleSortFieldChange = (e) => setSortField(e.target.value);
  const handleGenreChange = (e) => setGenreFilter(e.target.value);

  const handleRowClick = (bookIndex) => {
    setExpandedRow((prev) => (prev === bookIndex ? null : bookIndex));
  };

  const handleSearchSubmit = () => {
    const trimmed = search.trim().toLowerCase();
    const filtered = books.filter((book) => {
      const titleMatch = book.title.toLowerCase().includes(trimmed);
      const authorMatch = book.author.toLowerCase().includes(trimmed);
      const genreMatch = (book.genres?.name || "")
        .toLowerCase()
        .includes(trimmed);

      const matchesSearch = titleMatch || authorMatch || genreMatch;
      const matchesGenre =
        genreFilter === "All" || book.genres?.name === genreFilter;

      return matchesSearch && matchesGenre;
    });

    setFilteredBooks(
      filtered
        .sort((a, b) => {
          switch (sortField) {
            case "dateDesc":
              return new Date(b.published_date) - new Date(a.published_date);
            case "dateAsc":
              return new Date(a.published_date) - new Date(b.published_date);
            case "authorAsc":
              return a.author.localeCompare(b.author);
            case "authorDesc":
              return b.author.localeCompare(a.author);
            case "genre":
              return (a.genres?.name || "").localeCompare(b.genres?.name || "");
            default:
              return 0;
          }
        })
        .map((book, index) => ({
          ...book,
          book_number: index + 1,
        }))
    );
  };

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">List of All Books</Typography>

        <Box display="flex" gap={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search a book..."
            value={search}
            onChange={handleSearchChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchSubmit();
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ cursor: "pointer" }}
                      onClick={handleSearchSubmit}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl variant="outlined" size="small" sx={{ width: 180 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortField}
              onChange={handleSortFieldChange}
              label="Sort By"
              sx={{ width: "100%" }}
            >
              <MenuItem value="dateDesc">Date Published (Newest)</MenuItem>
              <MenuItem value="dateAsc">Date Published (Oldest)</MenuItem>
              <MenuItem value="authorAsc">Author A-Z</MenuItem>
              <MenuItem value="authorDesc">Author Z-A</MenuItem>
              <MenuItem value="genre">Genre</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" size="small" sx={{ width: 180 }}>
            <InputLabel>Genre</InputLabel>
            <Select
              value={genreFilter}
              onChange={handleGenreChange}
              label="Genre"
              sx={{ width: "100%" }}
            >
              {genres.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#f5f5f5",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              <TableCell
                align="center"
                sx={{ borderRight: "1px solid #e0e0e0", fontWeight: "bold" }}
              >
                Book #
              </TableCell>
              <TableCell
                align="center"
                sx={{ borderRight: "1px solid #e0e0e0", fontWeight: "bold" }}
              >
                Book Name
              </TableCell>
              <TableCell
                align="center"
                sx={{ borderRight: "1px solid #e0e0e0", fontWeight: "bold" }}
              >
                Author
              </TableCell>
              <TableCell
                align="center"
                sx={{ borderRight: "1px solid #e0e0e0", fontWeight: "bold" }}
              >
                Genre
              </TableCell>
              <TableCell
                align="center"
                sx={{ borderRight: "1px solid #e0e0e0", fontWeight: "bold" }}
              >
                Date Published
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Quantity
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBooks.map((book) => (
              <React.Fragment key={book.id}>
                <TableRow
                  hover
                  onClick={() => handleRowClick(book.book_number)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell
                    align="center"
                    sx={{
                      borderRight: "1px solid #e0e0e0",
                      textAlign: "center",
                    }}
                  >
                    {book.book_number}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      maxWidth: 150,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    {book.title}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      maxWidth: 150,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    {book.author}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      borderRight: "1px solid #e0e0e0",
                      textAlign: "center",
                    }}
                  >
                    {book.genres?.name}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      borderRight: "1px solid #e0e0e0",
                      textAlign: "center",
                    }}
                  >
                    {new Date(book.published_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      borderRight: "1px solid #e0e0e0",
                      textAlign: "center",
                    }}
                  >
                    {book.copies}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{ paddingBottom: 0, paddingTop: 0 }}
                  >
                    <Collapse
                      in={expandedRow === book.book_number}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          <strong>{book.title}</strong> by {book.author}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Description:</strong>{" "}
                          {book.description || "No description available."}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Genre:</strong> {book.genres?.name || "N/A"}{" "}
                          &nbsp; | &nbsp;
                          <strong>ISBN:</strong> {book.isbn || "N/A"} &nbsp; |
                          &nbsp;
                          <strong>Publisher:</strong> {book.publisher || "N/A"}{" "}
                          &nbsp; | &nbsp;
                          <strong>Published Date:</strong>{" "}
                          {book.published_date || "N/A"}
                        </Typography>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}

            {filteredBooks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No books found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
