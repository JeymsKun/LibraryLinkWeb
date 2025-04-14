import React, { useState } from "react";
import "../../css/Browse.css";

const genres = [
  "Fiction",
  "Non-fiction",
  "Sci-fi",
  "Mystery",
  "Romance",
  "Biography",
  "More",
];

const UserBrowse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [setSelectedGenre] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", searchTerm);
  };

  const filterGenre = (genre) => {
    setSelectedGenre(genre);
    console.log("Filtering genre:", genre);
  };

  return (
    <div className="container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search a book"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} className="search-icon-button">
          🔍
        </button>
      </div>

      <div className="genres">
        <label>Genres</label>
        <div className="genre-buttons">
          {genres.map((genre) => (
            <button key={genre} onClick={() => filterGenre(genre)}>
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="recent">
        <h3>Recently browse</h3>
        <div className="recent-items">
          <div className="book-placeholder">X</div>
          <div className="book-placeholder">X</div>
        </div>
      </div>
    </div>
  );
};

export default UserBrowse;
