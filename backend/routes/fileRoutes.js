const express = require("express");
const { processFile, getTempFileData, getSheetNames, deleteFileDataFromDatabase, fetchPaginatedData, downloadValidatedFileFromDatabase, deleteTempData, importToDatabaseFinally, fetchRecordsFromFileImportedToDatabase, downloadValidatedFile, listFilesImportedToDatabase, listSheetsImportedToDatabase } = require("../controllers/fileController");
const router = express.Router();

router.post("/upload", processFile);
router.get("/getTempFileData", getTempFileData);
router.get("/getSheetNames", getSheetNames);
router.get("/fetchPaginatedData", fetchPaginatedData);
router.post("/deleteTempData", deleteTempData);
router.post("/importToDatabaseFinally", importToDatabaseFinally);
router.get("/downloadValidatedFile", downloadValidatedFile);
router.get("/listFilesImportedToDatabase", listFilesImportedToDatabase);
router.get("/listSheetsImportedToDatabase", listSheetsImportedToDatabase);
router.get("/fetchRecordsFromFileImportedToDatabase", fetchRecordsFromFileImportedToDatabase);
router.get("/downloadValidatedFileFromDatabase", downloadValidatedFileFromDatabase);
router.post("/deleteFileDataFromDatabase", deleteFileDataFromDatabase);

module.exports = router;