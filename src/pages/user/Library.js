import React, { useEffect, useState } from "react";
import AboutBook from "../../components/AboutBook";
import BookCart from "../../components/BookCart";
import { supabase } from "../../supabase/client";
import "../../css/Library.css";

const Library = ({ view, setView, onBookClick, selectedBookId }) => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from("books")
        .select("books_id, title, cover_image_url");

      if (error) {
        console.error("Error fetching books:", error);
        return;
      }

      const booksWithUrls = data.map((book) => {
        const coverUrl = supabase.storage
          .from("library")
          .getPublicUrl(book.cover_image_url.trim()).data.publicUrl;

        return {
          ...book,
          coverUrl,
        };
      });

      setBooks(booksWithUrls);
    };

    fetchBooks();
  }, []);

  const handleBackToLibrary = () => {
    setView("grid");
  };

  const ButtonGroup = () => (
    <div className="top-button-group">
      <button className="responsive-button" onClick={handleBackToLibrary}>
        ← Back to Library
      </button>
    </div>
  );

  if (view === "about") {
    return (
      <>
        <ButtonGroup />
        <AboutBook bookId={selectedBookId} />
      </>
    );
  }

  if (view === "cart") {
    return (
      <>
        <ButtonGroup />
        <BookCart />
      </>
    );
  }

  return (
    <main className="library-container">
      <div className="book-grid">
        {books.map((book) => (
          <div
            className="book-box"
            key={book.books_id}
            onClick={() => onBookClick(book.books_id)}
          >
            <img src={book.coverUrl} alt={book.title} className="book-cover" />
            <div className="book-title">{book.title}</div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Library;
