// src/pages/UploadPage.tsx
import React, { useState } from "react";
import FileUploader from "../components/FileUploader";
import ErrorModal, { SheetError } from "../components/ErrorModal";
import { DataRow } from "../components/DataPreview";
import axios from "axios";
import { toast } from "react-toastify";

const UploadPage: React.FC = () => {
  const [errors, setErrors] = useState<SheetError[]>([]);
  const [data, setData] = useState<DataRow[]>([]);
  const [showErrors, setShowErrors] = useState<boolean>(false);

  const handleUploadSuccess = (data: {
    fileId: string;
    errors: SheetError[];
    inserted: number;
    message: string;
  }) => {
    // Save file id as Cookie or LocalStorage as an array of all uploaded files
    const uploadedFiles = JSON.parse(
      localStorage.getItem("uploadedFiles") || "[]"
    );
    // uploadedFiles.push(data.fileId);
    uploadedFiles.push({
      fileId: data.fileId,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));

    // Once file is uploaded, process it immediately
    processFile(data.fileId);
  };

  const processFile = async (fileId: string) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/files/getTempFileData",
        {
          params: { fileId },
        }
      );
      if (response.status !== 200) {
        toast.error("Error processing file");
        return;
      }
      const { sheets, rows } = response.data;
      setData(rows);
      if (rows.length > 0) {
        const errorRows = rows.filter((row) => row.valid === false);
        if (errorRows.length > 0) {
          const sheetErrors: SheetError[] = [];
          errorRows.forEach((row) => {
            const sheetIndex = sheets.findIndex(
              (sheet) => sheet === row.sheetName
            );

            const sheetError = sheetErrors.find(
              (sheetError) => sheetError.sheetIndex === sheetIndex
            );
            if (sheetError) {
              sheetError.errors.push({
                row: row.sno,
                errors: row.error,
              });
            } else {
              sheetErrors.push({
                sheet: row.sheetName,
                sheetIndex,
                errors: [{ row: row.sno, errors: row.error }],
              });
            }
          });
          console.log(sheetErrors);
          setErrors(sheetErrors);
          setShowErrors(true);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || "Error processing file";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Excel Data Importer</h1>
      <FileUploader onUploadSuccess={handleUploadSuccess} />

      <div className="mt-8">
        <p className="text-base font-semibold mb-4">
          * Please open the preview tab to review the data before importing it
          into the database. Kindly note that the data will be automatically
          deleted 1 hour after upload if not imported, and it will be
          unrecoverable.
        </p>
      </div>
      {showErrors && errors.length > 0 && (
        <ErrorModal errors={errors} onClose={() => setShowErrors(false)} />
      )}
    </div>
  );
};

export default UploadPage;
