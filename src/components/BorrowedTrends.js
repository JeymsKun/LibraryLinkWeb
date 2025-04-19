import React, { useEffect, useState } from "react";
import { Paper, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { supabase } from "../supabase/client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BorrowedTrends = () => {
  const [borrowedData, setBorrowedData] = useState([]);

  useEffect(() => {
    const fetchBorrowedTrends = async () => {
      const { data: bookingCart, error } = await supabase
        .from("booking_cart")
        .select("borrow_date, borrow_return_date")
        .eq("status", "borrowed");

      if (error) {
        console.error("Error fetching booking cart: ", error);
        return;
      }

      const currentDate = new Date();
      const monthlyBorrowed = {};

      bookingCart.forEach((item) => {
        const borrowDate = new Date(item.borrow_date);
        const borrowReturnDate = item.borrow_return_date
          ? new Date(item.borrow_return_date)
          : null;

        if (
          borrowDate <= currentDate &&
          (!borrowReturnDate || borrowReturnDate >= currentDate)
        ) {
          const month = borrowDate.getMonth();
          if (monthlyBorrowed[month]) {
            monthlyBorrowed[month]++;
          } else {
            monthlyBorrowed[month] = 1;
          }
        }
      });

      const labels = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const data = labels.map((_, index) => monthlyBorrowed[index] || 0);

      setBorrowedData(data);
    };

    fetchBorrowedTrends();
  }, []);

  const barData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Books Borrowed",
        data: borrowedData,
        backgroundColor: "#36a2eb",
      },
    ],
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" mb={2}>
        Borrowing Trends
      </Typography>
      <Bar data={barData} />
    </Paper>
  );
};

export default BorrowedTrends;
