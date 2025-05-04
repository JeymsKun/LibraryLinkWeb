import React, { useEffect, useState } from "react";
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
  Button,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { supabase } from "../supabase/client";

const BookingRequestsFeed = () => {
  const [requests, setRequests] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("booking_requests")
      .select(
        "request_id, status, requested_at, users(full_name), books(title)"
      )
      .eq("status", "waiting")
      .order("requested_at", { ascending: false });

    if (error) {
      console.error("Error fetching booking requests:", error.message);
    } else {
      setRequests(data);
    }

    setLoading(false);
  };

  const handleAccept = async (request_id) => {
    const { data: requestData, error: fetchError } = await supabase
      .from("booking_requests")
      .select("user_id, books_id")
      .eq("request_id", request_id)
      .single();

    if (fetchError) {
      console.error("Error fetching request details:", fetchError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from("booking_requests")
      .update({ status: "approved" })
      .eq("request_id", request_id);

    if (updateError) {
      console.error("Error updating booking request:", updateError.message);
      return;
    }

    const { user_id, books_id } = requestData;

    const { data: existingActivity, error: fetchActivityError } = await supabase
      .from("activity")
      .select("activity_id")
      .eq("user_id", user_id)
      .eq("books_id", books_id)
      .eq("status", "pending")
      .single();

    if (fetchActivityError) {
      console.error(
        "Error fetching activity details:",
        fetchActivityError.message
      );
      return;
    }

    if (existingActivity) {
      const { error: updateActivityError } = await supabase
        .from("activity")
        .update({ status: "borrowed" })
        .eq("activity_id", existingActivity.activity_id);

      if (updateActivityError) {
        console.error(
          "Error updating activity status:",
          updateActivityError.message
        );
        return;
      }
    } else {
      console.log("No 'waiting' activity found for this user and book.");
    }

    fetchRequests();
  };

  const handleRowClick = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const sortedRequests = [...requests].sort((a, b) => {
    const dateA = new Date(a.requested_at);
    const dateB = new Date(b.requested_at);
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const filteredRequests = sortedRequests.filter(
    (req) =>
      (req.users?.full_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (req.books?.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Grid container spacing={3} mt={3} justifyContent="center">
      <Grid item xs={12} mt={4}>
        <Paper
          elevation={3}
          sx={{
            padding: 2,
            width: "1000px",
            height: "600px",
            overflow: "auto",
            mx: "auto",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            flexWrap="wrap"
          >
            <Typography variant="h6">Pending Book Requests</Typography>
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

          <TableContainer component={Paper}>
            <Table stickyHeader sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    User
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    Book
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    Requested At
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No pending requests.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => (
                    <React.Fragment key={req.request_id}>
                      <TableRow
                        hover
                        onClick={() => handleRowClick(req.request_id)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          {req.users?.full_name || "Unknown"}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          {req.books?.title || "Unknown"}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                          }}
                        >
                          {new Date(req.requested_at).toLocaleDateString(
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
                          {req.status}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} sx={{ padding: 0 }}>
                          <Collapse
                            in={expandedRow === req.request_id}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box
                              sx={{ padding: 2, backgroundColor: "#f9f9f9" }}
                            >
                              <Typography variant="body2" gutterBottom>
                                <strong>User:</strong>{" "}
                                {req.users?.full_name || "Unknown"}
                                <br />
                                <strong>Book:</strong>{" "}
                                {req.books?.title || "Unknown"}
                                <br />
                                <strong>Status:</strong> {req.status}
                                <br />
                                <strong>Request ID:</strong> {req.request_id}
                              </Typography>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleAccept(req.request_id)}
                              >
                                Approve
                              </Button>
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

export default BookingRequestsFeed;
