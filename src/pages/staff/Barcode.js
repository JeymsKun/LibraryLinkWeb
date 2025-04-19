import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Stack,
  Paper,
  Alert,
} from "@mui/material";
import Webcam from "react-webcam";
import { supabase } from "../../supabase/client";
import jsQR from "jsqr";

const BarcodeScannerWeb = () => {
  const [barcode, setBarcode] = useState("");
  const [bookInfo, setBookInfo] = useState(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState("");

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const fetchBookInfo = async (barcodeData) => {
    try {
      setError("");

      const { data, error } = await supabase
        .from("books")
        .select("*, genres: genre_id (genre_id, name)")
        .eq("barcode_code", barcodeData)
        .single();

      if (error || !data) {
        console.error("Book not found:", error);
        setError("No book found for the provided barcode.");
        return;
      }

      const coverUrl = supabase.storage
        .from("library")
        .getPublicUrl(data.cover_image_url.trim()).data.publicUrl;

      const imageUrls = Array.isArray(data.image_urls)
        ? data.image_urls.map(
            (imgPath) =>
              supabase.storage.from("library").getPublicUrl(imgPath.trim()).data
                .publicUrl
          )
        : [];

      setBookInfo({
        ...data,
        genre: data.genres?.name ?? "Unknown",
        coverUrl,
        imageUrls,
      });
    } catch (err) {
      console.error("Error fetching book info:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleManualInput = () => {
    if (manualBarcode.trim()) {
      fetchBookInfo(manualBarcode.trim());
    } else {
      setError("Please enter a barcode.");
    }
  };

  const scanBarcode = () => {
    const video = webcamRef.current?.video;
    if (!video || !video.readyState || video.readyState < 2) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      setBarcode(code.data);
      fetchBookInfo(code.data);
    }
  };

  useEffect(() => {
    if (scanning && !bookInfo) {
      const interval = setInterval(scanBarcode, 500);
      return () => clearInterval(interval);
    }
  }, [scanning, bookInfo]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      {!bookInfo && (
        <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
          {scanning ? "Scan the barcode" : "Enter the barcode manually:"}
        </Typography>
      )}

      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          alignItems: "center",
        }}
      >
        {!bookInfo && (
          <>
            {error && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {error}
              </Alert>
            )}

            {scanning ? (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "environment" }}
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </Box>
            ) : (
              <Box sx={{ width: "100%" }}>
                <TextField
                  label="Enter barcode"
                  variant="standard"
                  fullWidth
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                />
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  sx={{ mt: 2 }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleManualInput}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setScanning(true)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Box>
            )}

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mt: 2 }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setError("");
                  setScanning(!scanning);
                }}
              >
                {scanning ? "Stop Scanning" : "Start Scanning"}
              </Button>
            </Stack>
          </>
        )}

        {bookInfo && (
          <Box sx={{ mt: 3, width: "100%", textAlign: "center" }}>
            {bookInfo.coverUrl && (
              <img
                src={bookInfo.coverUrl}
                alt="Book Cover"
                style={{
                  width: "200px",
                  height: "300px",
                  objectFit: "cover",
                  marginBottom: "1rem",
                }}
              />
            )}
            <Typography variant="h6">{bookInfo.title}</Typography>
            <Typography variant="body1" color="textSecondary">
              By: {bookInfo.author}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Genre: {bookInfo.genre}
            </Typography>
            {bookInfo.isbn && (
              <Typography variant="body2" color="textSecondary">
                ISBN: {bookInfo.isbn}
              </Typography>
            )}
            <Typography variant="body2" color="textSecondary">
              Published: {new Date(bookInfo.published_date).toDateString()}
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              {bookInfo.description}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mt: 3 }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setBookInfo(null);
                  setBarcode("");
                  setManualBarcode("");
                  setScanning(true);
                  setError("");
                }}
              >
                Done
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setBookInfo(null);
                  setBarcode("");
                  setManualBarcode("");
                  setScanning(false);
                  setError("");
                }}
              >
                Close
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default BarcodeScannerWeb;
