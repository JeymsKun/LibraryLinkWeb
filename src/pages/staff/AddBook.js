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
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase/client";
import UploadTimer from "../../components/UploadTimer";
import { useSelector, useDispatch } from "react-redux";
import {
  setField,
  addImage,
  deleteImage,
  resetForm,
  setBarcode,
} from "../../redux/slices/bookFormSlice";
import { useQuery } from "@tanstack/react-query";
import { fetchGenres } from "../../queries/genres";
import { useUploadBookFiles } from "../../hooks/useUploadBookFiles";

const AddBookWeb = () => {
  const { mutate: uploadFiles } = useUploadBookFiles();
  const dispatch = useDispatch();
  const { staff } = useAuth();
  const {
    title,
    author,
    genre,
    genreId,
    isbn,
    publisher,
    publishedDate,
    copies,
    description,
    barcode,
    barcodeCode,
    coverImage,
    images,
  } = useSelector((state) => state.bookForm);

  const [isUploading, setIsUploading] = useState(false);

  const { data: genres = [] } = useQuery({
    queryKey: ["genres"],
    queryFn: fetchGenres,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    let code = isbn || generateFallbackBarcode();

    if (isbn && code === isbn) {
      code = generateFallbackBarcode();
    }

    dispatch(
      setBarcode({ barcodeCode: code, barcodeUrl: getBarcodeUrl(code) })
    );
  }, [isbn, title, dispatch]);

  const generateFallbackBarcode = () => {
    return `${title?.slice(0, 3)?.toUpperCase() || "BK"}-${Date.now()}`;
  };

  const getBarcodeUrl = (code) => {
    return `https://bwipjs-api.metafloor.com/?bcid=code128&text=${code}&scale=3&includetext&backgroundcolor=ffffff`;
  };

  const handleClear = () => {
    dispatch(resetForm());
    const newCode = generateFallbackBarcode();
    dispatch(
      setBarcode({ barcodeCode: newCode, barcodeUrl: getBarcodeUrl(newCode) })
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(barcodeCode);
    alert("Copied to clipboard!");
  };

  const handleImageChange = (e, isCover = false) => {
    const files = e.target.files;
    if (files.length) {
      const fileURL = URL.createObjectURL(files[0]);
      if (isCover) {
        dispatch(setField({ field: "coverImage", value: fileURL }));
      } else {
        if (images.length >= 5) {
          alert("Max 5 images allowed.");
          return;
        }
        dispatch(addImage(fileURL));
      }
    }
  };

  const handleDeleteImage = (index) => {
    dispatch(deleteImage(index));
  };

  const handleCopiesChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      dispatch(setField({ field: "copies", value }));
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

      const genreName =
        genres.find((g) => g.genre_id === genreId)?.name || "Unknown";

      console.log("Uploading files with the following data:", {
        coverImage,
        images,
        barcode,
        title,
        author,
        genre: genreName,
        isbn,
        publisher,
        publishedDate: publishedDate
          ? new Date(publishedDate).toISOString()
          : null,
        copies,
        description,
        barcodeCode,
        barcode,
      });

      console.log("Checking staff id: ", staffUuid);

      uploadFiles(
        {
          coverImage,
          images,
          barcode,
        },
        {
          onSuccess: async ({ coverUrl, imageUrls, barcodeUrl }) => {
            console.log("Upload successful. Saving to database...");
            const { data: insertedBook, error: dbError } = await supabase
              .from("books")
              .insert([
                {
                  title,
                  author,
                  genre_id: genreId,
                  isbn,
                  publisher,
                  published_date: publishedDate
                    ? new Date(publishedDate).toISOString()
                    : null,
                  copies: parseInt(copies),
                  description,
                  barcode_url: barcodeUrl,
                  barcode: barcodeCode,
                  cover_image_url: coverUrl,
                  image_urls: imageUrls,
                  staff_uuid: staffUuid,
                },
              ])
              .select();

            const bookId = insertedBook?.[0]?.books_id;

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
          },
          onError: (error) => {
            console.error("Upload failed:", error);
            alert("Something went wrong while saving the book.");
          },
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Something went wrong while saving the book.");
    } finally {
      setIsUploading(false);
    }
  };

  const textFieldStyle = {
    margin: "normal",
    backgroundColor: "white",
    "& .MuiInputBase-root": {
      textAlign: "left",
    },
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
          onChange={(e) =>
            dispatch(setField({ field: "title", value: e.target.value }))
          }
          margin="normal"
          sx={textFieldStyle}
        />
        <TextField
          fullWidth
          label="Author Name"
          value={author}
          onChange={(e) =>
            dispatch(setField({ field: "author", value: e.target.value }))
          }
          margin="normal"
          sx={textFieldStyle}
        />
        <TextField
          select
          fullWidth
          label="Genre"
          value={genreId}
          onChange={(e) =>
            dispatch(setField({ field: "genreId", value: e.target.value }))
          }
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
          onChange={(e) =>
            dispatch(setField({ field: "isbn", value: e.target.value }))
          }
          margin="normal"
          sx={textFieldStyle}
        />
        <TextField
          fullWidth
          label="Publisher"
          value={publisher}
          onChange={(e) =>
            dispatch(setField({ field: "publisher", value: e.target.value }))
          }
          margin="normal"
          sx={textFieldStyle}
        />
        <DatePicker
          label="Published Date"
          value={publishedDate ? new Date(publishedDate) : null}
          onChange={(newValue) =>
            dispatch(
              setField({
                field: "publishedDate",
                value: newValue ? new Date(newValue).toISOString() : null,
              })
            )
          }
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
          onChange={(e) =>
            dispatch(setField({ field: "description", value: e.target.value }))
          }
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
