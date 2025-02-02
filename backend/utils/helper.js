// Function to convert Excel date serial to JavaScript Date
function excelDateToJSDate(excelDate) {
  if (typeof excelDate === 'number') {
      const excelEpoch = new Date(Date.UTC(1900, 0, 1)); // Excel's date system starts on Jan 1, 1900
      const jsDate = new Date(excelEpoch.setDate(excelEpoch.getDate() + excelDate - 2)); // Adjust for leap year bug
      return jsDate;
  }
  return excelDate; // If it's not a number, return it as-is (for example, if it's already a valid date)
}

module.exports = { excelDateToJSDate };
