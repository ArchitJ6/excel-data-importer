import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";
import Loader from "./Loader";
import { SheetError } from "./ErrorModal";

interface UploadResult {
  fileId: string;
  errors:  SheetError[];
  inserted: number;
  message: string;
}

interface FileUploaderProps {
  onUploadSuccess: (data: UploadResult) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileStatus, setFileStatus] = useState<string>("");
  const [currentSheet, setCurrentSheet] = useState<string>("");
  const [totalSheets, setTotalSheets] = useState<number>(0);
  const [sheetsProcessed, setSheetsProcessed] = useState<number>(0);
  const [processedRecords, setProcessedRecords] = useState<number>(0);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null); // Persistent socket reference

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      console.log(file);
      if (!file) return;

      // Validate file type and size
      if (!file.name.endsWith(".xlsx")) {
        toast.error("Only .xlsx files are allowed.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size exceeds 2MB.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        setUploading(true);
        // Change the URL as needed (assuming backend runs on port 3000)
        const response = await axios.post(
          "http://localhost:3000/api/files/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "socket-id": socketRef.current?.id,
            },
          }
        );
        // Assuming the backend returns a file identifier (or filename) in response.data.file
        onUploadSuccess(response.data);
        toast.success("File uploaded successfully");
      } catch (error: any) {
        // Handle errors from the backend
        const errorMessage =
          error?.response?.data?.error || "Error uploading file";
        toast.error(errorMessage);
      } finally {
        setUploading(false);
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } as Accept, // Accept as an object with MIME type"
  });

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("fileProcessingStart", (data) => {
      setFileStatus(data.fileId);
      setCurrentSheet("");
      setProcessedRecords(0);
      setTotalSheets(data.totalSheets);
      setProgress(0);
      // console.log(data);
    });

    socket.on("sheetProcessing", (data) => {
      setCurrentSheet(data.sheetName);
      setProcessedRecords(data.processedRecords);
      setTotalRecords(data.totalRecords);
    });

    socket.on("progressUpdate", (data) => {
      const progressPercentage = Math.floor(
        (data.processedRecords / data.totalRecords) * 100
      );
      setProgress(progressPercentage);
      setProcessedRecords(data.processedRecords);
    });

    socket.on("sheetProcessingComplete", (data) => {
      toast.success(`Sheet processed: ${data.sheetName}`);
      setSheetsProcessed((prev) => prev + 1);
    });

    socket.on("fileProcessingComplete", (data) => {
      setFileStatus(`File processing complete for file: ${data.fileId}`);
      setProgress(0);
      setSheetsProcessed(0);
      setProcessedRecords(0);
      setCurrentSheet("");
      setFileStatus("");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      if (socket) {
        socket.disconnect();
        console.log("Cleaning up socket connection");
      }
    };
  }, []);

  return (
    <div className="border-dashed border-2 rounded p-6 text-center">
      <div {...getRootProps()} className="cursor-pointer">
        <input {...getInputProps()} />
        {uploading ? (
          <p>Uploading...</p>
        ) : isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <p>Drag & drop a .xlsx file here, or click to select one</p>
        )}
      </div>
      {uploading && (
        <div className="w-full h-full absolute top-0 left-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="w-96 bg-[#242424] bg-opacity-80 rounded-lg p-6 flex flex-col items-center justify-center">
            {/* Title */}
            <h3 className="text-xl font-semibold text-white mb-4">
              Upload in Progress
            </h3>

            {/* File Name */}
            <p className="text-sm text-gray-300 mb-2">
              <strong>File Name:</strong>{" "}
              {fileStatus.split("-").slice(1).join("-")}
            </p>

            {/* Sheet Name */}
            <p className="text-sm text-gray-300 mb-2">
              <strong>Sheet Name:</strong> {currentSheet}
            </p>

            {/* Sheets Processed */}
            <p className="text-sm text-gray-300 mb-2">
              <strong>Sheets Processed:</strong> {sheetsProcessed} /{" "}
              {totalSheets}
            </p>

            {/* Records Processed */}
            <p className="text-sm text-gray-300 mb-4">
              <strong>Records Processed:</strong> {processedRecords} /{" "}
              {totalRecords} {" ("+progress+"%)"}
            </p>
            <Loader />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
