import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Skeleton,
  Box,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import { supabase } from "../supabase/client";

const getActionText = (status) => {
  switch (status?.toLowerCase()) {
    case "borrowed":
      return "Waiting for Due";
    case "returned":
      return "Marked as Returned";
    case "overdue":
      return "Send Reminder";
    default:
      return "";
  }
};

const truncateText = (text, maxLength = 40) => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const TransactionCardList = ({ status = "All" }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const markOverdueTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "transaction_id, status, booking_cart:booking_id(borrow_return_date)"
      )
      .eq("status", "borrowed");

    if (error) {
      console.error("Error fetching transactions:", error);
      return;
    }

    const now = new Date();
    const overdueTransactions = data.filter((tx) => {
      const borrowReturnDate = new Date(tx.booking_cart?.borrow_return_date);
      return borrowReturnDate < now;
    });

    if (overdueTransactions.length > 0) {
      const transactionIds = overdueTransactions.map((tx) => tx.transaction_id);

      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: "overdue", updated_at: new Date() })
        .in("transaction_id", transactionIds);

      if (updateError) {
        console.error("Error updating overdue transactions:", updateError);
      }

      const { error: cartUpdateError } = await supabase
        .from("booking_cart")
        .update({ status: "overdue", updated_at: new Date() })
        .in(
          "booking_id",
          overdueTransactions.map((tx) => tx.booking_cart.id)
        );

      if (cartUpdateError) {
        console.error(
          "Error updating booking cart status for overdue transactions:",
          cartUpdateError
        );
      }
    }
  };

  const markReturnedTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "transaction_id, status, booking_cart:booking_id(borrow_return_date)"
      )
      .eq("status", "borrowed");

    if (error) {
      console.error("Error fetching transactions:", error);
      return;
    }

    const now = new Date();
    const returnedTransactions = data.filter((tx) => {
      const borrowReturnDate = new Date(tx.booking_cart?.borrow_return_date);
      return borrowReturnDate.toDateString() === now.toDateString();
    });

    if (returnedTransactions.length > 0) {
      const transactionIds = returnedTransactions.map(
        (tx) => tx.transaction_id
      );

      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: "returned", updated_at: new Date() })
        .in("transaction_id", transactionIds);

      if (updateError) {
        console.error("Error updating returned transactions:", updateError);
      }

      const { error: cartUpdateError } = await supabase
        .from("booking_cart")
        .update({ status: "returned", updated_at: new Date() })
        .in(
          "booking_id",
          returnedTransactions.map((tx) => tx.booking_cart.id)
        );

      if (cartUpdateError) {
        console.error(
          "Error updating booking cart status for returned transactions:",
          cartUpdateError
        );
      }
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("transactions")
        .select(
          `transaction_id,
          status,
          users:user_id (full_name),
          booking_cart:booking_id (borrow_date, borrow_return_date, books:books_id (title))`
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        const now = new Date();

        const formatted = data.map((tx) => {
          const dueDateObj = tx.booking_cart?.borrow_return_date
            ? new Date(tx.booking_cart.borrow_return_date)
            : null;

          const isOverdue =
            tx.status === "borrowed" && dueDateObj && dueDateObj < now;

          const isReturned =
            tx.status === "borrowed" &&
            dueDateObj &&
            dueDateObj.toDateString() === now.toDateString();

          const title = tx.booking_cart?.books?.title || "Unknown Title";

          return {
            id: tx.transaction_id,
            title,
            displayTitle: truncateText(title),
            borrower: tx.users?.full_name || "Unknown User",
            borrowDate: tx.booking_cart?.borrow_date
              ? new Date(tx.booking_cart.borrow_date).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )
              : "N/A",
            dueDate: dueDateObj
              ? dueDateObj.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A",
            status: isOverdue ? "overdue" : isReturned ? "returned" : tx.status,
          };
        });

        setTransactions(formatted);
      }

      setLoading(false);
    };

    fetchTransactions();
    markOverdueTransactions();
    markReturnedTransactions();
  }, []);

  const filtered = transactions.filter(
    (tx) =>
      status === "All" || tx.status?.toLowerCase() === status.toLowerCase()
  );

  const handleClickStatus = (status) => {
    if (status === "borrowed") {
      setSnackbarMessage(
        "The book is still borrowed, waiting for the due date."
      );
      setOpenSnackbar(true);
    } else if (status === "returned") {
      setSnackbarMessage("The book is returned on time.");
      setOpenSnackbar(true);
    } else if (status === "overdue") {
      setSnackbarMessage(
        "This book is overdue. You may want to send a reminder."
      );
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" gap={2}>
        {[...Array(3)].map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rounded"
            height={120}
            width="100%"
            sx={{ maxWidth: 600 }}
          />
        ))}
      </Box>
    );
  }

  if (filtered.length === 0) {
    return (
      <Typography variant="body1" sx={{ mt: 2, color: "gray" }}>
        No transactions found.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxHeight: "70vh",
        overflowY: "auto",
        width: "100%",
      }}
    >
      {filtered.map((tx) => (
        <Card
          key={tx.id}
          variant="outlined"
          sx={{
            width: "100%",
            maxWidth: 600,
            p: 1,
            minHeight: 180,
            backgroundColor: "#ffffff",
            overflow: "hidden",
          }}
        >
          <CardContent>
            <Stack spacing={0.5}>
              <Typography
                noWrap
                title={tx.title}
                sx={{ fontWeight: 500, maxWidth: "100%" }}
              >
                📖 Book Title: "{tx.displayTitle}"
              </Typography>

              <Typography noWrap title={tx.borrower} sx={{ maxWidth: "100%" }}>
                👤 Borrower: {tx.borrower}
              </Typography>

              <Typography>
                📅 Borrowed: {tx.borrowDate} | Due: {tx.dueDate}
              </Typography>

              <Typography>
                ⏱️ Status:{" "}
                <span
                  style={{
                    color:
                      tx.status === "overdue"
                        ? "red"
                        : tx.status === "returned"
                        ? "green"
                        : "inherit",
                  }}
                >
                  [ {tx.status} ]
                </span>
              </Typography>

              <Typography
                color="primary"
                sx={{ mt: 1, cursor: "pointer", fontWeight: "bold" }}
                onClick={() => handleClickStatus(tx.status)}
              >
                [ {getActionText(tx.status)} ]
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="info"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionCardList;
