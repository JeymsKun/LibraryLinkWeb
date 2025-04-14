import React, { useState } from "react";
import "../css/Book_Cart.css";

const BookCart = () => {
  const [selectedBooks, setSelectedBooks] = useState([]);

  const books = [
    {
      id: 1,
      title: "Book Title",
      author: "Book Author",
      date: "Borrowing date",
    },
    {
      id: 2,
      title: "Book Title",
      author: "Book Author",
      date: "Borrowing date",
    },
    {
      id: 3,
      title: "Book Title",
      author: "Book Author",
      date: "Borrowing date",
    },
    {
      id: 4,
      title: "Book Title",
      author: "Book Author",
      date: "Borrowing date",
    },
  ];

  const suggestedBooks = new Array(6).fill(null);

  const handleCheckboxChange = (bookId) => {
    if (selectedBooks.includes(bookId)) {
      setSelectedBooks(selectedBooks.filter((id) => id !== bookId));
    } else {
      if (selectedBooks.length < 3) {
        setSelectedBooks([...selectedBooks, bookId]);
      } else {
        alert("You can only select up to 3 books.");
      }
    }
  };

  const requestBooking = () => {
    if (selectedBooks.length === 0) {
      alert("Please select at least one book to request booking.");
    } else {
      alert(`Booking requested for ${selectedBooks.length} book(s)!`);
    }
  };

  return (
    <div className="container">
      <div className="book-cart">
        {books.map((book) => (
          <div className="book-item" key={book.id}>
            <input
              type="checkbox"
              className="book-checkbox"
              checked={selectedBooks.includes(book.id)}
              onChange={() => handleCheckboxChange(book.id)}
            />
            <div className="thumbnail"></div>
            <div className="book-details">
              {book.title}
              <br />
              {book.author}
              <br />
              {book.date}
            </div>
          </div>
        ))}
      </div>

      <div className="suggested-books">
        <h3>Suggested Books:</h3>
        <div className="suggested-grid">
          {suggestedBooks.map((_, index) => (
            <div key={index} className="book-suggestion"></div>
          ))}
        </div>
      </div>

      <button className="request-btn" onClick={requestBooking}>
        Request Booking
      </button>
    </div>
  );
};

export default BookCart;
