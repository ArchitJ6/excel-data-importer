const multer = require("multer");
const xlsx = require("xlsx");
const Data = require("../models/dataModel");
const DataBaseFinal = require("../models/databaseModel");
const { excelDateToJSDate } = require("../utils/helper");

// Multer Config (File Upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx)$/)) {
      return cb(new Error("Only .xlsx files are allowed"));
    }
    cb(null, true);
  },
}).single("file");

// Funtion for Uploading and Processing File
const processFile = async (req, res) => {
  try {
    const io = req.io;
    const socketId = req.headers["socket-id"];

    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: "File is required" });

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetNames = workbook.SheetNames;
      const parseData = [];

      if (sheetNames.length === 0) {
        return res.status(400).json({ error: "No sheets found in the file" });
      }

      const clientIp = req.connection.remoteAddress;
      const fileId = Date.now() + "-" + req.file.originalname;

      let totalRecords = 0;
      let processedRecords = 0;

      io.to(socketId).emit("fileProcessingStart", { fileId, totalSheets: sheetNames.length });

      sheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);
        totalRecords = jsonData.length;
        processedRecords = 0;

        io.to(socketId).emit("sheetProcessing", { sheetName, totalRecords, processedRecords: 0 });

        jsonData.forEach(async (row, index) => {
          let { Name, Amount, Date: inputDate, Verified } = row;

          if (Name) {
            Name = Name.trim().toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
          }

          if (inputDate) inputDate = excelDateToJSDate(inputDate);

          if (Verified) {
            Verified = Verified.toString().trim().toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
          }

          let rowErrors = [];
          if (!Name) rowErrors.push("Name is required");
          if (!Amount || Amount <= 0 || isNaN(Amount)) rowErrors.push("Amount must be a valid number greater than 0");
          if (!inputDate) rowErrors.push("Date is required");
          if (Verified && Verified !== "Yes" && Verified !== "No") rowErrors.push("Verified must be 'Yes' or 'No'");

          if (inputDate) {
            const currentDate = new Date();
            const inputMonth = new Date(inputDate).getMonth();
            const inputYear = new Date(inputDate).getFullYear();
            if (currentDate.getMonth() !== inputMonth || currentDate.getFullYear() !== inputYear) {
              rowErrors.push("Date must fall within the current month");
            }
          }

          processedRecords++;
          io.to(socketId).emit("progressUpdate", { sheetName, processedRecords, totalRecords });

          parseData.push({
            sno: index + 1,
            fileId: fileId,
            sheetName: sheetName,
            name: Name,
            amount: Amount,
            date: new Date(inputDate),
            verified: Verified,
            ipAddress: clientIp,
            valid: rowErrors.length === 0,
            error: rowErrors.join(", ") || null,
          });
        });

        if (totalRecords > 0)
          io.to(socketId).emit("sheetProcessingComplete", { sheetName, processedRecords, totalRecords });
      });

      if (parseData.length === 0) {
        return res.status(400).json({ error: "No valid data found" });
      }

      if (parseData.length > 0) {
        await Data.insertMany(parseData);
      }

      io.to(socketId).emit("fileProcessingComplete", { fileId, totalRecords });
      return res.json({ message: "File processed", fileId });
    });
  } catch (error) {
    console.error("❌ Error processing file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function for Fetching Temporary Processed Data Saved for 1 Hour
const getTempFileData = async (req, res) => {
  try {
    const { fileId, valid } = req.query;
    console.log("fileId", fileId);
    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }
    let data, sheets;
    if (valid) {
      data = await Data.find({ fileId, valid: valid === "true" }).sort({
        sno: 1,
      });
    } else {
      data = await Data.find({ fileId }).sort({ sno: 1 });
    }
    sheets = await Data.distinct("sheetName", { fileId });

    return res.json({ rows: data, sheets });
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function for Fetching Sheet Names for Temporary Processed Data
const getSheetNames = async (req, res) => {
  try {
    const { fileId } = req.query;
    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }
    const sheets = await Data.distinct("sheetName", { fileId });
    return res.json({ sheets });
  } catch (error) {
    console.error("❌ Error fetching sheet names:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function for Fetching Paginated Data from Temporary Processed Data
const fetchPaginatedData = async (req, res) => {
  try {
    const { fileId, sheetName, page, limit } = req.query;
    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }
    if (!sheetName) {
      return res.status(400).json({ error: "Sheet name is required" });
    }
    const data = await Data.find({ fileId, sheetName })
      .sort({ sno: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalRows = await Data.countDocuments({ fileId, sheetName });
    const totalPages = Math.ceil(totalRows / limit);

    return res.json({ data, totalPages, totalRows });
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function for Deleting Temporary Processed Data
const deleteTempData = async (req, res) => {
  try {
    const { fileId, recordId } = req.body;
    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }
    if (!recordId) {
      return res.status(400).json({ error: "Record ID is required" });
    }
    await Data.deleteOne({ fileId, _id: recordId });
    return res.json({ message: "Record deleted" });
  } catch (error) {
    console.error("❌ Error deleting data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function for Importing Validated Data to Database
const importToDatabaseFinally = async (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }
    const data = await Data.find({ fileId, valid: true });

    if (data.length > 0) {
      await DataBaseFinal.insertMany(data);
      await Data.deleteMany({ fileId });
    }

    return res.json({ message: "Data imported to database" });
  } catch (error) {
    console.error("❌ Error importing data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function for Downloading Validated Data from Temporary Processed Data
const downloadValidatedFile = async (req, res) => {
  try {
    const { fileId } = req.query;
    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }
    const data = await Data.find({ fileId, valid: true });
    if (data.length === 0) {
      return res.status(400).json({ error: "No valid data found" });
    }
    const workbook = xlsx.utils.book_new();
    const sheetNames = await Data.distinct("sheetName", { fileId, valid: true }).sort({ sno: 1 });
    sheetNames.forEach((sheetName) => {
      const sheetData = data.filter((row) => row.sheetName === sheetName);
      const formattedData = sheetData.map((row) => ({
        Name: row.name,
        Amount: new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.amount),
        Date: row.date.toLocaleDateString(),
        Verified: row.verified
      }));
      const sheet = xlsx.utils.json_to_sheet(formattedData, {
        header: ["Name", "Amount", "Date", "Verified"],
      });
      xlsx.utils.book_append_sheet(workbook, sheet, sheetName);
    });
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileId}-validated.xlsx`
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (error) {
    console.error("❌ Error downloading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function for Listing Files Imported to Database
const listFilesImportedToDatabase = async (req, res) => {
  try {
    const files = await DataBaseFinal.distinct("fileId");
    return res.json({ files });
  } catch (error) {
    console.error("❌ Error fetching files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function for Listing Sheets Imported to Database for a File
const listSheetsImportedToDatabase = async (req, res) => {
  try {
    const { fileId } = req.query;
    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }
    const sheets = await DataBaseFinal.distinct("sheetName", { fileId });
    return res.json({ sheets });
  } catch (error) {
    console.error("❌ Error fetching sheets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function for Fetching Records from Database for a File and Sheet
const fetchRecordsFromFileImportedToDatabase = async (req, res) => {
  try {
    const { fileId, sheetName, page, limit } = req.query;
    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }
    if (!sheetName) {
      return res.status(400).json({ error: "Sheet name is required" });
    }
    const data = await DataBaseFinal.find({ fileId, sheetName })
      .sort({ sno: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalRows = await DataBaseFinal.countDocuments({ fileId, sheetName });
    const totalPages = Math.ceil(totalRows / limit);

    return res.json({ rows: data, totalPages, totalRows });
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function for Downloading Validated Data from Database
const downloadValidatedFileFromDatabase = async (req, res) => {
  try {
    const { fileId } = req.query;
    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }
    const data = await DataBaseFinal.find({ fileId });
    if (data.length === 0) {
      return res.status(400).json({ error: "No data found" });
    }
    const workbook = xlsx.utils.book_new();
    const sheetNames = await DataBaseFinal.distinct("sheetName", { fileId }).sort({ sno: 1 });
    sheetNames.forEach((sheetName) => {
      const sheetData = data.filter((row) => row.sheetName === sheetName);
      const formattedData = sheetData.map((row) => ({
        Name: row.name,
        Amount: new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.amount),
        Date: row.date.toLocaleDateString(),
        Verified: row.verified
      }));
      const sheet = xlsx.utils.json_to_sheet(formattedData, {
        header: ["Name", "Amount", "Date", "Verified"],
      });
      xlsx.utils.book_append_sheet(workbook, sheet, sheetName);
    });
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileId}-validated.xlsx`
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (error) {
    console.error("❌ Error downloading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function for Deleting Data Imported to Database
const deleteFileDataFromDatabase = async (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }
    await DataBaseFinal.deleteMany({ fileId });
    return res.json({ message: "Data deleted" });
  } catch (error) {
    console.error("❌ Error deleting data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  processFile,
  getTempFileData,
  getSheetNames,
  fetchPaginatedData,
  deleteTempData,
  importToDatabaseFinally,
  downloadValidatedFile,
  listFilesImportedToDatabase,
  listSheetsImportedToDatabase,
  fetchRecordsFromFileImportedToDatabase,
  downloadValidatedFileFromDatabase,
  deleteFileDataFromDatabase,
};
