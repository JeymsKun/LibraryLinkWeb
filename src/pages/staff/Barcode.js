import React, { useState } from "react";
import "../../css/Barcode.css";

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState("");

  const handleBarcodeChange = (e) => {
    setBarcode(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted barcode:", barcode);
  };

  return (
    <div>
      <h3>Enter the barcode manually:</h3>

      <div className="scanner-container">
        <form onSubmit={handleSubmit}>
          <div className="enter_barcode">
            <label>Enter barcode:</label>
            <input
              type="number"
              className="barcode-input"
              value={barcode}
              onChange={handleBarcodeChange}
            />
          </div>

          <div className="button">
            <button type="submit">SUBMIT</button>
            <button type="button">CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BarcodeScanner;
