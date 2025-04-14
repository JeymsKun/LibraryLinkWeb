import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./../supabase/client";
import { useBooking } from "./../context/BookingContext";
import "./../css/About_Book.css";

const SUPABASE_URL = "https://ejgelmxicmlgzzpksbip.supabase.co";
const BUCKET_NAME = "library";

const makePublicUrl = (path) =>
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;

const AboutBook = ({ bookId }) => {
  const params = useParams();
  const id = bookId || params.id;
  const [book, setBook] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addBooking } = useBooking();

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        alert("No book ID provided.");
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("books_id", id)
        .single();

      if (error) {
        alert("Error fetching book: " + error.message);
      } else {
        setBook(data);
      }

      setLoading(false);
    };

    fetchBook();
  }, [id]);

  const images = book
    ? [
        makePublicUrl(book.cover_image_url),
        ...(book.image_urls || []).map(makePublicUrl),
      ]
    : [];

  if (loading) {
    return <div className="loading">Loading book details...</div>;
  }

  if (!book) {
    return <div className="loading">Book not found.</div>;
  }

  return (
    <div className="book-container">
      <div className="carousel-container">
        {images.length > 0 ? (
          images.map((url, index) => (
            <div
              key={index}
              className={`carousel-slide ${
                currentIndex === index ? "active" : ""
              }`}
            >
              <img src={url} alt={`Preview ${index + 1} of ${book.title}`} />
            </div>
          ))
        ) : (
          <div>No images available for this book.</div>
        )}

        <div className="carousel-controls">
          {images.map((_, i) => (
            <span
              key={i}
              className={`dot ${currentIndex === i ? "active" : ""}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      </div>

      <h2 className="book-title">{book.title}</h2>
      <p className="book-description">{book.description}</p>

      <button
        className="booking-button"
        onClick={() =>
          addBooking
            ? addBooking(book)
            : console.log("addBooking not available")
        }
      >
        Add to Booking Cart
      </button>
    </div>
  );
};

export default AboutBook;
