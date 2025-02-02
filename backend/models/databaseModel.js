const mongoose = require("mongoose");

const DataBaseSchema = new mongoose.Schema({
  sno: { type: Number, required: true },
  fileId: { type: String, required: true },
  sheetName: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  verified: { type: String, required: false },
  timestamp: { type: Date, default: Date.now }, // Timestamp to track when the document was created
  ipAddress: { type: String, required: true }, // IP address field
});

const DataBaseModel = mongoose.model('data', DataBaseSchema);

module.exports = DataBaseModel;