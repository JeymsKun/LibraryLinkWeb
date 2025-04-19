import { supabase } from "../supabase/client";
import { decode } from "base64-arraybuffer";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const handleUploadFileToSupabase = async (
  fileUri,
  storagePath,
  contentType
) => {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        try {
          const base64data = reader.result;
          const base64FileData = base64data.split(",")[1];
          const arrayBuffer = decode(base64FileData);

          const { error } = await supabase.storage
            .from("library")
            .upload(storagePath, arrayBuffer, {
              contentType,
              upsert: true,
            });

          if (error) {
            console.error(`❌ Error uploading ${storagePath}:`, error);
            return reject(error);
          }

          resolve(true);
        } catch (err) {
          console.error("❌ Upload error inside FileReader:", err);
          reject(err);
        }
      };

      reader.onerror = (err) => reject(err);
    });
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    throw error;
  }
};

const handleUploadTextToSupabase = async (text, storagePath) => {
  const blob = new Blob([text], { type: "text/plain" });
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      try {
        const base64data = reader.result.split(",")[1];
        const arrayBuffer = decode(base64data);

        const { error } = await supabase.storage
          .from("library")
          .upload(storagePath, arrayBuffer, {
            contentType: "text/plain",
            upsert: true,
          });

        if (error) {
          console.error(`❌ Error uploading ${storagePath}:`, error);
          return reject(error);
        }

        resolve(true);
      } catch (err) {
        console.error("❌ Error encoding text blob:", err);
        reject(err);
      }
    };

    reader.onerror = reject;
  });
};

const uploadBookFiles = async ({
  coverImage,
  images = [],
  barcode,
  title,
  author,
  genreId,
  isbn,
  publisher,
  publishedDate,
  copies,
  description,
  barcodeCode,
}) => {
  const bookId = uuidv4();
  const basePath = `books/${bookId}`;

  const coverPath = `${basePath}/cover.jpg`;
  const coverSuccess = await handleUploadFileToSupabase(
    coverImage,
    coverPath,
    "image/jpeg"
  );
  if (!coverSuccess) throw new Error("Cover image upload failed.");

  for (let i = 0; i < images.length; i++) {
    const imgPath = `${basePath}/image${i + 1}.jpg`;
    const success = await handleUploadFileToSupabase(
      images[i],
      imgPath,
      "image/jpeg"
    );
    if (!success) {
      console.warn(`Optional image ${i + 1} failed to upload.`);
    }
  }

  const barcodePath = `${basePath}/barcode.png`;
  const barcodeSuccess = await handleUploadFileToSupabase(
    barcode,
    barcodePath,
    "image/png"
  );
  if (!barcodeSuccess) throw new Error("Barcode upload failed.");

  const bookInfoText = `
Title: ${title}
Author: ${author}
Genre: ${genreId}
ISBN: ${isbn}
Publisher: ${publisher}
Published Date: ${publishedDate.toDateString()}
Copies: ${copies}
Description: ${description}
Barcode: ${barcodeCode}
  `.trim();

  const infoPath = `${basePath}/info.txt`;
  const infoSuccess = await handleUploadTextToSupabase(bookInfoText, infoPath);
  if (!infoSuccess) throw new Error("Book info upload failed.");

  return {
    bookId,
    coverUrl: coverPath,
    imageUrls: images.map((_, i) => `${basePath}/image${i + 1}.jpg`),
    barcodeUrl: barcodePath,
    infoUrl: infoPath,
  };
};

export default uploadBookFiles;
