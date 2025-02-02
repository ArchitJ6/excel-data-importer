const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
  sno: { type: Number, required: true },
  fileId: { type: String, required: true },
  sheetName: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  verified: { type: String, required: false },
  timestamp: { type: Date, default: Date.now }, // Timestamp to track when the document was created
  ipAddress: { type: String, required: true }, // IP address field
  valid: { type: Boolean, default: true }, // Field to track if the document has been marked as invalid
  error: { type: String, required: false }, // Field to store error messages
});

// Set the TTL index to expire documents 1 hour after the `timestamp`
DataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 3600 });

// Create a model from the schema
const DataModel = mongoose.model('temp', DataSchema);

module.exports = DataModel;