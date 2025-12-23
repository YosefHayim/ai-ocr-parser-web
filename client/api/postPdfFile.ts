import axios from "axios";
import { envPaths } from "@/envPaths";

export const postPdfFile = async (file: File) => {
  if (!file) {
    throw new Error("No PDF file provided");
  }

  const url = `${envPaths.NODE_ENV === "production" ? envPaths.DEPLOYED_URL : envPaths.LOCAL_URL}/api/pdf/extract`;

  const formData = new FormData();
  formData.append("pdfFile", file);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading PDF file:", error.response.data.error);
    throw error;
  }
};
