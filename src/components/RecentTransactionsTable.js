import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { supabase } from "../supabase/client";

const RecentActivityTable = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from("activity")
        .select(
          `
          activity_id,
          book_number,
          status,
          created_at,
          books:books_id (
            title,
            author,
            published_date
          ),
          users:user_id (
            id_number,
            email,
            full_name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activities:", error);
      } else {
        setActivities(data);
      }
    };

    fetchActivities();
  }, []);

  const handleRowClick = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredActivities = sortedActivities.filter(
    (activity) =>
      activity.books.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.users.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      activity.users.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Grid container spacing={3} mt={3} justifyContent="center">
      <Grid item xs={12} mt={4}>
        <Paper elevation={3} sx={{ padding: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            flexWrap="wrap"
          >
            <Typography variant="h6">Recent Activity</Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search..."
                sx={{ width: 250 }}
                value={searchQuery}
                onChange={handleSearchChange}
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
                <InputLabel id="sort-label">Sort by Date</InputLabel>
                <Select
                  labelId="sort-label"
                  value={sortOrder}
                  label="Sort by Date"
                  onChange={handleSortChange}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ height: 450 }}>
            <Table stickyHeader sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow>
                  {[
                    "Book #",
                    "Book Title",
                    "Author",
                    "Date Published",
                    "ID Number",
                    "Email Address",
                    "Full Name",
                    "Date Created",
                    "Status",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        borderRight: "1px solid #e0e0e0",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No activities found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((row) => (
                    <React.Fragment key={row.activity_id}>
                      <TableRow
                        hover
                        onClick={() => handleRowClick(row.activity_id)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          {row.book_number}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            maxWidth: 150,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          {row.books.title}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            maxWidth: 120,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          {row.books.author}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          {new Date(
                            row.books.published_date
                          ).toLocaleDateString("en-PH", {
                            timeZone: "Asia/Manila",
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
                          }}
                        >
                          {row.users.id_number}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            maxWidth: 180,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          {row.users.email}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          {row.users.full_name}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          {new Date(row.created_at).toLocaleDateString(
                            "en-PH",
                            {
                              timeZone: "Asia/Manila",
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          {row.status}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          sx={{
                            paddingBottom: 0,
                            paddingTop: 0,
                          }}
                        >
                          <Collapse
                            in={expandedRow === row.activity_id}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box
                              sx={{ padding: 2, backgroundColor: "#f9f9f9" }}
                            >
                              <Typography variant="body2">
                                <strong>Book:</strong> {row.books.title}
                                <br />
                                <strong>Author:</strong> {row.books.author}
                                <br />
                                <strong>Email:</strong> {row.users.email}
                                <br />
                                <strong>Activity ID:</strong> {row.activity_id}
                                <br />
                                <strong>Status:</strong> {row.status}
                              </Typography>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default RecentActivityTable;
