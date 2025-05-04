import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { supabase } from "../supabase/client";

const UserSummaryTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [userSort, setUserSort] = useState("name");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: users, error: userError } = await supabase
        .from("users")
        .select("user_id, full_name");

      const { data: books, error: bookError } = await supabase
        .from("books")
        .select("books_id, title");

      if (userError || bookError) {
        console.error("Supabase error:", userError || bookError);
        setLoading(false);
        return;
      }

      const simulatedTransactions = users.map((user) => {
        const borrowedBooks = books
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3) + 1);

        return {
          userId: user.user_id,
          fullName: user.full_name,
          borrowedBooks,
        };
      });

      const groupedTransactions = simulatedTransactions.reduce((acc, user) => {
        if (!acc[user.userId]) {
          acc[user.userId] = user;
        } else {
          acc[user.userId].borrowedBooks = [
            ...acc[user.userId].borrowedBooks,
            ...user.borrowedBooks,
          ];
        }
        return acc;
      }, {});

      setTransactions(Object.values(groupedTransactions));
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredUsers = transactions.filter((user) =>
    user.fullName.toLowerCase().includes(userSearch.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (userSort === "name") return a.fullName.localeCompare(b.fullName);
    if (userSort === "books")
      return b.borrowedBooks.length - a.borrowedBooks.length;
    if (userSort === "total")
      return b.borrowedBooks.length - a.borrowedBooks.length;
    return 0;
  });

  return (
    <Grid container spacing={3} mt={3} justifyContent="center">
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ padding: 2, width: 800 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            flexWrap="wrap"
          >
            <Typography variant="h6">List of Users</Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                sx={{ width: 250 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <FormControl size="small" sx={{ width: 150 }}>
                <InputLabel id="user-sort-label">Sort by</InputLabel>
                <Select
                  labelId="user-sort-label"
                  value={userSort}
                  label="Sort by"
                  onChange={(e) => setUserSort(e.target.value)}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="books">Number of Books</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ height: 450 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                      borderRight: "1px solid #ddd",
                    }}
                  >
                    Full Name
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                      borderRight: "1px solid #ddd",
                    }}
                  >
                    List of Books
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                      borderRight: "1px solid #ddd",
                    }}
                  >
                    Total Books
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers.map((user, idx) => (
                  <TableRow key={idx}>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid #ddd" }}
                    >
                      {user.fullName}
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>
                      <Box
                        sx={{
                          pr: 1,
                        }}
                      >
                        <List dense disablePadding>
                          {user.borrowedBooks.map((book, index) => (
                            <ListItem key={index} disableGutters>
                              <ListItemText primary={book.title} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ borderRight: "1px solid #ddd" }}
                    >
                      {user.borrowedBooks.length}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default UserSummaryTable;
