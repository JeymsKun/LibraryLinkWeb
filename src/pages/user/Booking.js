import React, { useState } from "react";
import "../../css/Booking.css";

const Booking = () => {
  const [successVisible, setSuccessVisible] = useState(false);
  const [selectedDays, setSelectedDays] = useState("1");

  const handleBooking = () => {
    setSuccessVisible(true);
    setTimeout(() => setSuccessVisible(false), 3000);
  };

  return (
    <div>
      <div className="card">
        <div className="book-image">
          <div className="image-placeholder">Image</div>
        </div>
        <div className="book-details">
          <p>
            <strong>Book Title</strong>
          </p>
          <p>Author</p>
          <p>Borrower's name</p>
          <p>ID Number</p>
          <label htmlFor="days">Select days</label>
          <select
            id="days"
            value={selectedDays}
            onChange={(e) => setSelectedDays(e.target.value)}
          >
            {[...Array(6)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <span>(max. 6 days)</span>
        </div>
      </div>

      {successVisible && (
        <div className="success-message" id="successMessage">
          <strong>Success!</strong> You have booked "
          <span id="bookTitle">title of the book</span>".
          <span className="close" onClick={() => setSuccessVisible(false)}>
            ×
          </span>
        </div>
      )}

      <button className="confirm-button" onClick={handleBooking}>
        CONFIRM BOOKING
      </button>
    </div>
  );
};

export default Booking;
