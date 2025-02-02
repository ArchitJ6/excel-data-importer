import React from "react";
import UploadPage from "./pages/UploadPage";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import PreviewSheetData from "./pages/PreviewSheetData";
import DatabaseStored from "./pages/DatabaseStored";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="w-full h-[95%] m-auto p-10">
      <div className="flex flex-row w-full">
        <div className="w-full flex flex-row justify-center gap-10 items-center">
          <div
            className={`px-4 py-2 cursor-pointer rounded-3xl ${
              currentPath === "/"
                ? "bg-white text-black duration-700 ease-in"
                : ""
            }`}
            onClick={() => navigate("/")}
          >
            Upload Sheet
          </div>
          <div
            className={`px-4 py-2 cursor-pointer rounded-3xl ${
              currentPath === "/preview"
                ? "bg-white text-black duration-1000 ease-in"
                : ""
            }`}
            onClick={() => navigate("/preview")}
          >
            Preview Sheet
          </div>
          <div
            className={`px-4 py-2 cursor-pointer rounded-3xl ${
              currentPath === "/database"
                ? "bg-white text-black duration-1000 ease-in"
                : ""
            }`}
            onClick={() => navigate("/database")}
          >
            Database Stored
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/preview" element={<PreviewSheetData />} />
        <Route path="/database" element={<DatabaseStored />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;
