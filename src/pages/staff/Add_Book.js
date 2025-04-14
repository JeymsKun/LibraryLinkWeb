import React from "react";
import "../../css/Add_Book.css";

const AddBook = () => {
  return (
    <div>
      <div style={{ flex: 1 }}>
        <h3>
          Fill in the details to add a new book to the library collection.
        </h3>
        <form
          className="book-form"
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div className="form-group">
            <label>Book Title:</label>
            <input type="text" className="form-input" />
            <label>Author Name:</label>
            <input type="text" className="form-input" />
          </div>

          <div className="form-group">
            <label>Category/Genre:</label>
            <select>
              <option>Select genre</option>
            </select>
            <label>ISBN Number (optional):</label>
            <input type="text" className="form-input" />
          </div>

          <div className="form-group">
            <label>Publisher:</label>
            <input type="text" className="form-input" />
            <label>Published Date:</label>
            <input type="date" />
          </div>

          <div className="form-group">
            <label>Book Cover Upload (optional):</label>
            <input type="file" />
          </div>

          <div className="form-group">
            <label>Number of Copies:</label>
            <input type="number" />
          </div>

          <div
            className="button-group"
            style={{ display: "flex", gap: "10px" }}
          >
            <button type="submit">SAVE BOOK</button>
            <button type="button">CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
