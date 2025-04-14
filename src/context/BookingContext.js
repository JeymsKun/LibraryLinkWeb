import React, { createContext, useContext, useState } from "react";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);

  const setUserDetails = (userData) => {
    setUser(userData);
  };

  const addBooking = (book) => {
    setBookings((prev) => {
      const exists = prev.find((b) => b.books_id === book.books_id);
      if (exists) return prev;
      return [...prev, book];
    });
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
