import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Button,
  Grid,
  IconButton,
  Paper,
  InputAdornment,
} from "@mui/material";
import {
  PhotoCamera,
  AddPhotoAlternate,
  Delete,
  ContentCopy,
  FileDownload,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import uploadBookFiles from "../../components/UploadBookFiles";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase/client";
import UploadTimer from "../../components/UploadTimer";

const AddBookWeb = () => {
  const { staff } = useAuth();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publishedDate, setPublishedDate] = useState(new Date());
  const [copies, setCopies] = useState("");
  const [description, setDescription] = useState("");
  const [barcode, setBarcode] = useState(null);
  const [barcodeCode, setBarcodeCode] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [genreId, setGenreId] = useState("");

  useEffect(() => {
    const fetchGenres = async () => {
      const { data, error } = await supabase.from("genres").select("*");
      if (error) {
        console.error("Error fetching genres:", error);
      } else {
        setGenres(data);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const code = isbn || generateFallbackBarcode();
    setBarcodeCode(code);
    setBarcode(getBarcodeUrl(code));
  }, [isbn, title]);

  const generateFallbackBarcode = () => {
    return `${title?.slice(0, 3)?.toUpperCase() || "BK"}-${Date.now()}`;
  };

  const getBarcodeUrl = (code) => {
    return `https://bwipjs-api.metafloor.com/?bcid=code128&text=${code}&scale=3&includetext&backgroundcolor=ffffff`;
  };

  const handleClear = () => {
    setTitle("");
    setAuthor("");
    setGenre("");
    setIsbn("");
    setPublisher("");
    setPublishedDate(new Date());
    setCopies("");
    setDescription("");
    setCoverImage(null);
    setImages([]);
    const newCode = generateFallbackBarcode();
    setBarcodeCode(newCode);
    setBarcode(getBarcodeUrl(newCode));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(barcodeCode);
    alert("Copied to clipboard!");
  };

  const handleImageChange = (e, isCover = false) => {
    const files = e.target.files;
    if (files.length) {
      const fileURL = URL.createObjectURL(files[0]);
      if (isCover) setCoverImage(fileURL);
      else {
        const newImages = [...images, fileURL];
        if (newImages.length > 5) return alert("Max 5 images allowed.");
        setImages(newImages);
      }
    }
  };

  const handleDeleteImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const textFieldStyle = {
    backgroundColor: "white",
    "& .MuiInputBase-root": { height: 55, textAlign: "center" },
  };

  const handleCopiesChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCopies(value);
    }
  };

  const handleSave = async () => {
    if (!title || !author || !genreId || !publisher || !copies || !coverImage) {
      alert("Please fill in all required fields and upload a cover image.");
      return;
    }

    try {
      setIsUploading(true);

      if (!staff?.staff_uuid) {
        alert("Staff not logged in or missing staff_uuid.");
        setIsUploading(false);
        return;
      }

      const staffUuid = staff.staff_uuid;
      const { coverUrl, imageUrls, barcodeUrl, infoUrl } =
        await uploadBookFiles({
          coverImage,
          images,
          barcode,
          title,
          author,
          genre,
          isbn,
          publisher,
          publishedDate,
          copies,
          description,
          barcodeCode,
        });

      const { data: insertedBook, error: dbError } = await supabase
        .from("books")
        .insert([
          {
            title,
            author,
            genre_id: genreId,
            isbn,
            publisher,
            published_date: publishedDate,
            copies: parseInt(copies),
            description,
            barcode_code: barcodeCode,
            cover_image_url: coverUrl,
            image_urls: imageUrls,
            staff_uuid: staffUuid,
          },
        ])
        .select();

      const bookId = insertedBook?.[0]?.books_id;

      console.log("Check book id: ", bookId);

      if (bookId) {
        const { error: bookGenreError } = await supabase
          .from("book_genres")
          .insert([
            {
              books_id: bookId,
              genre_id: genreId,
            },
          ]);

        if (bookGenreError) {
          console.error("Error linking book to genre:", bookGenreError);
        }
      }

      if (dbError) {
        console.error("Error inserting book:", dbError);
        alert("Error saving book.");
        setIsUploading(false);
        return;
      }

      alert("Book added successfully!");
      handleClear();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Something went wrong while saving the book.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Fill in the details to add a new book to the library collection.
        </Typography>

        <TextField
          fullWidth
          label="Book Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          sx={textFieldStyle}
        />
        <TextField
          fullWidth
          label="Author Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          margin="normal"
          sx={textFieldStyle}
        />
        <TextField
          select
          fullWidth
          label="Genre"
          value={genreId}
          onChange={(e) => setGenreId(e.target.value)}
          margin="normal"
          sx={{
            ...textFieldStyle,
            "& .MuiInputBase-root": { textAlign: "left" },
          }}
          slotProps={{
            select: {
              MenuProps: {
                PaperProps: {
                  sx: {
                    textAlign: "left",
                  },
                },
              },
            },
          }}
        >
          <MenuItem value="">
            <Typography sx={{ textAlign: "left", width: "100%" }}>
              Select a genre
            </Typography>
          </MenuItem>
          {genres.map((g) => (
            <MenuItem key={g.genre_id} value={g.genre_id}>
              {g.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="ISBN Number (optional)"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          margin="normal"
          sx={textFieldStyle}
        />
        <TextField
          fullWidth
          label="Publisher"
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
          margin="normal"
          sx={textFieldStyle}
        />
        <DatePicker
          label="Published Date"
          value={publishedDate}
          onChange={(newValue) => setPublishedDate(newValue)}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              sx: textFieldStyle,
            },
          }}
        />

        <Paper
          sx={{ mt: 2, p: 2, backgroundColor: "white", borderRadius: 2 }}
          elevation={1}
        >
          <Typography gutterBottom>Upload Book Cover</Typography>
          {coverImage ? (
            <Box mb={1}>
              <img
                src={coverImage}
                alt="Cover Preview"
                style={{ width: "100%", maxHeight: 200, objectFit: "contain" }}
              />
            </Box>
          ) : (
            <Box
              mb={1}
              sx={{
                width: "100%",
                height: 200,
                bgcolor: "#f0f0f0",
                border: "1px dashed #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
              }}
            >
              <Typography>No Cover Image Uploaded</Typography>
            </Box>
          )}
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCamera />}
          >
            Upload Cover
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={(e) => handleImageChange(e, true)}
            />
          </Button>
        </Paper>

        <Paper
          sx={{ mt: 2, p: 2, backgroundColor: "white", borderRadius: 2 }}
          elevation={1}
        >
          <Typography gutterBottom>Upload Book Image(s) (optional)</Typography>

          <Grid container spacing={2}>
            {images.length > 0 ? (
              images.slice(0, 5).map((img, idx) => (
                <Grid item xs={6} sm={4} key={idx}>
                  <Paper variant="outlined" sx={{ position: "relative" }}>
                    <img
                      src={img}
                      alt={`Book-${idx}`}
                      style={{
                        width: "100%",
                        height: 250,
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        background: "white",
                      }}
                      onClick={() => handleDeleteImage(idx)}
                    >
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item xs={6} sm={4} md={2}>
                <Box
                  sx={{
                    width: "100%",
                    height: 250,
                    bgcolor: "#f0f0f0",
                    border: "1px dashed #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                  }}
                >
                  <Typography>No Images Uploaded</Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          <Button
            variant="outlined"
            component="label"
            startIcon={<AddPhotoAlternate />}
            sx={{ mt: 1 }}
          >
            Upload More Images
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={(e) => handleImageChange(e)}
            />
          </Button>
        </Paper>

        <Box mt={4}>
          <Typography gutterBottom>Generated Barcode:</Typography>
          <Box
            textAlign="center"
            mt={1}
            sx={{
              backgroundColor: "white",
              padding: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            {barcode ? (
              <img src={barcode} alt="Barcode" style={{ height: 80 }} />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: 80,
                  bgcolor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  borderRadius: 2,
                }}
              >
                <Typography>No Barcode Generated</Typography>
              </Box>
            )}
          </Box>
          <TextField
            fullWidth
            label="Generated Barcode"
            value={barcodeCode}
            margin="normal"
            sx={textFieldStyle}
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={copyToClipboard}>
                      <ContentCopy />
                    </IconButton>
                    <IconButton onClick={() => window.open(barcode, "_blank")}>
                      <FileDownload />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <TextField
          fullWidth
          label="Number of Copies"
          value={copies}
          onChange={handleCopiesChange}
          margin="normal"
          sx={textFieldStyle}
        />

        <TextField
          fullWidth
          label="Description (optional)"
          multiline
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          sx={{ backgroundColor: "white" }}
        />

        <Box
          mt={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <UploadTimer isUploading={isUploading} onSave={handleSave} />
          <Button variant="outlined" color="error" onClick={handleClear}>
            Clear
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AddBookWeb;
