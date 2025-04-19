import React, { createContext, useContext, useState } from "react";
import { supabase } from "../supabase/client";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);

  const setUserDetails = (userData) => {
    setUser(userData);
  };

  const addBooking = async ({ bookId, userId, status = "pending" }) => {
    const { data: existingBooking, error: fetchError } = await supabase
      .from("booking_cart")
      .select("booking_id, status")
      .eq("user_id", userId)
      .eq("books_id", bookId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking booking cart:", fetchError.message);
      alert("An error occurred while checking your booking cart.");
      return;
    }

    if (existingBooking && existingBooking.status === "borrowed") {
      alert(
        "You have already borrowed this book. Please wait until the end of its selected days."
      );
      return;
    }

    if (existingBooking) {
      alert("You’ve already added this book to your booking cart.");
      return;
    }

    const { data, error } = await supabase.from("booking_cart").insert([
      {
        user_id: userId,
        books_id: bookId,
        status: status,
      },
    ]);

    if (error) {
      console.error("Error adding to booking cart:", error.message);
      alert("Error adding book to cart.");
      return;
    }

    setBookings((prev) => [
      ...prev,
      {
        books_id: bookId,
        user_id: userId,
        status: status,
      },
    ]);

    console.log("Book added to cart successfully:", data);
    alert("Book successfully added to your booking cart.");
  };

  const removeBooking = (id) => {
    setBookings((prev) => prev.filter((b) => b.books_id !== id));
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        addBooking,
        removeBooking,
        user,
        setUserDetails,
        setBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
