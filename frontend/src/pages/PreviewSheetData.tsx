import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Table from "../components/Table";
import Loader from "../components/Loader";

const PreviewSheetData = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState("");

  const [data, setData] = useState([]);
  const limit = 5;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/api/files/fetchPaginatedData",
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
      const data = response.data;
      setTotalPages(data.totalPages);
      setTotalRows(data.totalRows);
      setData(data.data);
      setLoading(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || "Error fetching data";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    const uploadedFiles = localStorage.getItem("uploadedFiles");
    if (uploadedFiles) {
      const files = JSON.parse(uploadedFiles);
      const validFiles = files.filter(
        (file: { fileId: string; timestamp: string }) => {
          const diff =
            new Date().getTime() - new Date(file.timestamp).getTime();
          return diff < 3600000;
        }
      );
      localStorage.setItem("uploadedFiles", JSON.stringify(validFiles));
      setUploadedFiles(validFiles);
    } else {
      localStorage.setItem("uploadedFiles", JSON.stringify([]));
      setUploadedFiles([]);
    }
  }, []);

  useEffect(() => {
    const fetchSheets = async () => {
      if (selectedFile) {
        try {
          setLoading(true);
          const response = await axios.get(
            "http://localhost:3000/api/files/getSheetNames",
            {
              params: { fileId: selectedFile },
            }
          );
          if (response.status !== 200) {
            toast.error("Error fetching sheets");
            setLoading(false);
            return;
          }
          const data = response.data;
          setSheets(data.sheets);
          setSelectedSheet("");
          setPage(1);
          setData([]);
          setLoading(false);
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error || "Error fetching sheets";
          toast.error(errorMessage);
          setSheets([]);
          setSelectedSheet("");
          setPage(1);
          setData([]);
          setLoading(false);
        }
      }
    };
    if (!selectedFile) {
      setSheets([]);
      setSelectedSheet("");
      setPage(1);
      setData([]);
    }
    fetchSheets();
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile && selectedSheet) {
      fetchData();
    }
  }, [selectedSheet, page]);

  useEffect(() => {
    setPage(1);
  }, [selectedSheet]);

  const deleteRecord = async (recordId: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/api/files/deleteTempData",
        {
          fileId: selectedFile,
          recordId,
        }
      );
      if (response.status !== 200) {
        toast.error("Error deleting record");
        setLoading(false);
        return;
      }
      toast.success("Record deleted successfully");
      fetchData();
      setLoading(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || "Error deleting record";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const importToDatabaseFinally = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/api/files/importToDatabaseFinally",
        {
          fileId: selectedFile,
        }
      );
      if (response.status !== 200) {
        toast.error("Error importing data to database");
        setLoading(false);
        return;
      }
      toast.success("Data imported to database successfully");
      setSelectedFile("");
      setSheets([]);
      setSelectedSheet("");
      setPage(1);
      setData([]);

      // Remove the uploaded file from the list
      const updatedFiles = uploadedFiles.filter(
        (file: { fileId: string }) => file.fileId !== selectedFile
      );
      setUploadedFiles(updatedFiles);

      setLoading(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || "Error importing data to database";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const downloadValidatedFile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/api/files/downloadValidatedFile",
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
              {uploadedFiles.map(
                (file: { fileId: string; timestamp: string }) => (
                  <option key={file.fileId} value={file.fileId}>
                    {file.fileId?.split("-").slice(1).join("-") +
                      " (" +
                      new Date(file.timestamp).toLocaleString() +
                      ")"}
                  </option>
                )
              )}
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
              onClick={importToDatabaseFinally}
              className="text-sm md:text-base p-2 bg-[#333232a8] text-white rounded-md outline-none border-none hover:bg-[#333232]"
            >
              Import to Database
            </button>
            <button
              onClick={downloadValidatedFile}
              className="text-sm md:text-base p-2 bg-[#333232a8] text-white rounded-md outline-none border-none hover:bg-[#333232]"
            >
              Download Validated File
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
              deleteRecord={deleteRecord}
              totalPages={totalPages}
              showDeleteColumn={true}
              showStatusColumn={true}
            />
          )}
        </div>
      </div>
      {loading && (
        <div className="w-full h-full flex flex-col items-center justify-center absolute top-0 left-0 bg-[#00000080] z-50">
          <Loader />
        </div>
      )}
    </>
  );
};

export default PreviewSheetData;
