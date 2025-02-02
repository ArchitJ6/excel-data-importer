# Excel Data Importer

## 📌 Overview
The **Excel Data Importer** is a web-based application that allows users to upload Excel files (`.xlsx`), validate their contents, preview data, and import valid records into a database. It includes error handling, pagination, and real-time progress updates.

## ✨ Features

### **Frontend**
- **File Upload**  
  - Drag-and-drop functionality with a fallback file input button  
  - Only accepts `.xlsx` files (max size: 2MB)  
- **Error Handling**  
  - Displays validation errors in a modal  
  - Shows row numbers and error descriptions  
  - Separate tabs for validation errors from multiple sheets  
- **Data Preview**  
  - Dropdown to select and preview sheets  
  - Paginated table view of sheet data  
  - Date formatting: `DD-MM-YYYY`  
  - Indian number format: `12,34,456.00`  
  - Row deletion with confirmation prompt  
- **Data Import**  
  - Imports valid rows while skipping invalid ones  
  - Success message with highlighted skipped rows  

### **Backend**
- **File Processing**  
  - Parses `.xlsx` files using `xlsx` and `exceljs`  
- **Validation Rules**  
  - Required columns: `Name`, `Amount`, `Date`, `Verified (Yes/No)`  
  - Mandatory fields: `Name`, `Amount`, `Date`  
  - Date should be within the current month  
  - Amount must be numeric and greater than zero  
- **Error Reporting**  
  - Provides sheet name, row number, and error description  
- **Additional Features**  
  - Export validated data back to `.xlsx`  
  - Real-time upload progress tracking  

---

## 🏗️ Project Structure

```
backend
 ├── config
 │   ├── db.js
 ├── controllers
 │   ├── fileController.js
 ├── models
 │   ├── databaseModel.js    # Stores validated data
 │   ├── dataModel.js        # Temporarily stores processed data
 ├── routes
 │   ├── fileRoutes.js
 ├── utils
 │   ├── helper.js
 ├── server.js
 ├── .env

frontend
 ├── src
 │   ├── components
 │   │   ├── DataPreview.tsx
 │   │   ├── DeleteModal.tsx
 │   │   ├── ErrorModal.tsx
 │   │   ├── FileUploader.tsx
 │   │   ├── Loader.tsx
 │   │   ├── Loader.css
 │   │   ├── Table.tsx
 │   ├── pages
 │   │   ├── DatabaseSorted.tsx
 │   │   ├── PreviewSheetData.tsx
 │   │   ├── UploadPage.tsx
 │   ├── App.tsx
 │   ├── index.css
 │   ├── main.tsx
```

---

## 🚀 Installation

### **Prerequisites**
- Node.js `>=18`
- MongoDB

### **1️⃣ Backend Setup**
```sh
cd backend
npm install
cp .env.example .env   # Add database credentials
npm start
```

### **2️⃣ Frontend Setup**
```sh
cd frontend
npm install
npm run dev
```

---

## ⚙️ Technologies Used

### **Frontend**
- React (`18.3.1`)
- TypeScript (`5.6.2`)
- React Dropzone (`14.3.5`)
- React Modal (`3.16.3`)
- React Router (`7.1.5`)
- React Toastify (`11.0.3`)
- Tailwind CSS (`3.4.17`)
- Vite (`6.0.5`)
- Axios (`1.7.9`)

### **Backend**
- Express (`4.21.2`)
- Mongoose (`8.9.6`)
- Multer (`1.4.5-lts.1`)
- XLSX (`0.18.5`)
- Socket.io (`4.8.1`)
- dotenv (`16.4.7`)
- Nodemon (`3.1.9` for development)

---

## 🎯 Usage Guide

1. Upload an Excel file (`.xlsx`) through the UI.
2. View validation errors (if any) in a modal.
3. Preview the data in a tabular format.
4. Delete rows if needed.
5. Click **Import** to save valid rows to the database.
6. Export validated data if required.

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).
