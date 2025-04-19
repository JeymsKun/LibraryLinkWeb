import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Paper, Typography } from "@mui/material";
import { supabase } from "../supabase/client";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const BookAvailability = () => {
  const [availabilityStats, setAvailabilityStats] = useState({
    available: 0,
    borrowed: 0,
    totalBooks: 0,
  });

  useEffect(() => {
    const fetchBookAvailability = async () => {
      const { data: books, error: bookError } = await supabase
        .from("books")
        .select("*");

      if (bookError) {
        console.error("Error fetching books: ", bookError);
        return;
      }

      const { data: bookingCart, error: bookingCartError } = await supabase
        .from("booking_cart")
        .select(
          "books_id, booking_id, borrow_date, borrow_return_date, status"
        );

      if (bookingCartError) {
        console.error("Error fetching booking cart: ", bookingCartError);
        return;
      }

      let available = 0;
      let borrowed = 0;
      let totalBooks = 0;

      const currentDate = new Date();

      books.forEach((book) => {
        const totalCopies = book.copies || 1;
        totalBooks += totalCopies;

        const borrowedCopies = bookingCart.filter((item) => {
          return (
            item.books_id === book.books_id &&
            item.status === "borrowed" &&
            currentDate >= new Date(item.borrow_date) &&
            currentDate <= new Date(item.borrow_return_date)
          );
        }).length;

        borrowed += borrowedCopies;
        available += totalCopies - borrowedCopies;
      });

      setAvailabilityStats({ available, borrowed, totalBooks });
    };

    fetchBookAvailability();
  }, []);

  const total = availabilityStats.totalBooks;
  const availablePercent = total
    ? ((availabilityStats.available / total) * 100).toFixed(1)
    : 100;
  const borrowedPercent = total
    ? ((availabilityStats.borrowed / total) * 100).toFixed(1)
    : 0;

  const pieData = {
    labels: [
      `Available Books ${availablePercent}%`,
      `Borrowed Books ${borrowedPercent}%`,
    ],
    datasets: [
      {
        data: [availabilityStats.available, availabilityStats.borrowed],
        backgroundColor: ["#4bc0c0", "#36a2eb"],
      },
    ],
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" mb={2}>
        Book Availability
      </Typography>
      <Pie data={pieData} />
    </Paper>
  );
};

export default BookAvailability;
