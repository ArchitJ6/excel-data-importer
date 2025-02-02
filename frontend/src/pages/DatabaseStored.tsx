import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import axios from "axios";
import { toast } from "react-toastify";
import Table from "../components/Table";
import { DataRow } from "../components/DataPreview";
import DeleteModal from "../components/DeleteModal";

const DatabaseStored = () => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const limit = 5;
  const [showDeleteModal, setShowDeleteModal] = useState<string>("");

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/api/files/listFilesImportedToDatabase"
      );
      if (response.status !== 200) {
        toast.error("Error fetching files");
        setLoading(false);
        return;
      }
      setUploadedFiles(response.data.files);
      setLoading(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || "Error fetching files";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const fetchSheets = async (fileId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/api/files/listSheetsImportedToDatabase",
        {
          params: { fileId },
        }
      );
      if (response.status !== 200) {
        toast.error("Error fetching sheets");
        setLoading(false);
        return;
      }
      setSheets(response.data.sheets);
      setLoading(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || "Error fetching sheets";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/api/files/fetchRecordsFromFileImportedToDatabase",
        {
          params: {
            fileId: selectedFile,
            sheetName: selectedSheet,
            page,
            limit,
          },
        }
      );
      if (response.status !== 200) {
        toast.error("Error fetching data");
        setLoading(false);
        return;
      }
      const { rows, totalRows } = response.data;
      setData(rows);
      setTotalRows(totalRows);
      setTotalPages(Math.ceil(totalRows / limit));
      setLoading(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || "Error fetching data";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetchSheets(selectedFile);
    } else {
      setSheets([]);
      setSelectedSheet("");
      setPage(1);
      setData([]);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile && selectedSheet) {
      fetchData();
    }
  }, [selectedSheet, page]);

  useEffect(() => {
    setPage(1);
  }, [selectedSheet]);

  const downloadValidatedFileFromDatabase = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/api/files/downloadValidatedFileFromDatabase",
        {
          params: { fileId: selectedFile },
          responseType: "blob",
        }
      );
      if (response.status !== 200) {
        toast.error("Error downloading file");
        setLoading(false);
        return;
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "validatedFile.xlsx");
      document.body.appendChild(link);
      link.click();
      setLoading(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || "Error downloading file";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const deleteFileDataFromDatabase = async (fileId: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/api/files/deleteFileDataFromDatabase",
        { fileId }
      );
      if (response.status !== 200) {
        toast.error("Error deleting file data");
        setLoading(false);
        return;
      }
      toast.success(response.data.message);
      fetchFiles();
      setSelectedSheet("");
      setData([]);
      setPage(1);
      setSelectedFile("");
      setLoading(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || "Error deleting file data";
      toast.error(errorMessage);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="m-auto w-full h-full md:p-10 pt-10">
        <div className="flex flex-col md:flex-row justify-start items-center w-full gap-4">
          {uploadedFiles.length === 0 ? (
            <div className="text-center text-lg text-gray-500">
              No files uploaded yet
            </div>
          ) : (
            <select
              className="w-full md:w-auto p-2 bg-[#242424] border border-gray-300 rounded-md"
              onChange={(e) => setSelectedFile(e.target.value)}
            >
              <option value="">
                Choose the Uploaded Files to Preview Data...
              </option>
              {uploadedFiles.map((file) => (
                <option key={file} value={file}>
                  {file.split("-").slice(1).join("-")}
                </option>
              ))}
            </select>
          )}
          {sheets.length > 0 && (
            <select
              className="w-full md:w-auto p-2 bg-[#242424] border border-gray-300 rounded-md"
              onChange={(e) => setSelectedSheet(e.target.value)}
            >
              <option value="">Choose the Sheet...</option>
              {sheets.map((sheet) => (
                <option key={sheet} value={sheet}>
                  {sheet}
                </option>
              ))}
            </select>
          )}
        </div>
        {selectedFile && sheets && (
          <div className="mt-5 flex gap-4 flex-row w-full">
            <button
              onClick={downloadValidatedFileFromDatabase}
              className="text-sm md:text-base p-2 bg-[#333232a8] text-white rounded-md outline-none border-none hover:bg-[#333232]"
            >
              Download File
            </button>
            <button
              onClick={() => setShowDeleteModal(selectedFile)}
              className="text-sm md:text-base p-2 bg-[#333232a8] text-white rounded-md outline-none border-none hover:bg-[#333232]"
            >
              Delete File
            </button>
          </div>
        )}
        <div className="w-full">
          {selectedSheet && (
            <Table
              data={data}
              limit={limit}
              page={page}
              setPage={setPage}
              totalRows={totalRows}
              totalPages={totalPages}
              deleteRecord={() => {}}
              showDeleteColumn={false}
              showStatusColumn={false}
            />
          )}
        </div>
      </div>
      {loading && (
        <div className="w-full h-full flex flex-col items-center justify-center absolute top-0 left-0 bg-[#00000080] z-50">
          <Loader />
        </div>
      )}
      {showDeleteModal && (
        <DeleteModal
          close={() => setShowDeleteModal("")}
          deleteRecord={() => {
            deleteFileDataFromDatabase(showDeleteModal);
            setShowDeleteModal("");
          }}
        />
      )}
    </>
  );
};

export default DatabaseStored;
