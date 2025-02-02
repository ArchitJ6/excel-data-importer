import React, { useState } from "react";

export interface DataRow {
  name: string;
  amount: number;
  date: string; // ISO string or any string that can be parsed as a date
  verified: string;
}

interface DataPreviewProps {
  data: DataRow[];
  onRowDelete: (index: number) => void;
}

const ITEMS_PER_PAGE = 10;

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  // Format as DD-MM-YYYY
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatNumberIndian = (num: number) => {
  // Use Intl.NumberFormat for Indian locale formatting
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
};

const DataPreview: React.FC<DataPreviewProps> = ({ data, onRowDelete }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginatedData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this row?")) {
      onRowDelete(index + (currentPage - 1) * ITEMS_PER_PAGE);
    }
  };

  return (
    <div>
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Verified</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-100">
              <td className="border p-2">{row.name}</td>
              <td className="border p-2">{formatNumberIndian(row.amount)}</td>
              <td className="border p-2">{formatDate(row.date)}</td>
              <td className="border p-2">{row.verified}</td>
              <td className="border p-2 text-center">
                <button onClick={() => handleDelete(idx)} className="text-red-500">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-center space-x-4 mt-4">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="px-3 py-1 border rounded">
          Prev
        </button>
        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="px-3 py-1 border rounded">
          Next
        </button>
      </div>
    </div>
  );
};

export default DataPreview;
