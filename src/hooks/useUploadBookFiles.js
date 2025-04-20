import { useMutation } from "@tanstack/react-query";
import uploadBookFiles from "../components/UploadBookFiles";

export const useUploadBookFiles = () => {
  return useMutation({
    mutationFn: uploadBookFiles,
    onSuccess: (data) => {
      console.log("Upload successful:", data);
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });
};
