import React, { useState } from "react";

export interface SheetError {
  sheet: string;
  sheetIndex: number;
  errors: {
    row: number;
    errors: string[];
  }[];
}

interface ErrorModalProps {
  errors: SheetError[];
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ errors, onClose }) => {
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-2/3 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Validation Errors</h2>
          <p
            onClick={onClose}
            className="text-red-500 hover:text-red-700 transition-colors duration-300 hover:underline cursor-pointer"
          >
            Close
          </p>
        </div>

        {/* Error Table */}
        <div className="flex-grow overflow-y-auto mb-4">
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Row</th>
                  <th className="py-2 text-left">Error</th>
                </tr>
              </thead>
              <tbody>
                {errors
                  .find((sheet) => sheet.sheetIndex === activeSheetIndex)
                  ?.errors.map((errorItem, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{errorItem.row}</td>
                      <td className="py-2">
                        <ul className="list-disc space-y-1">
                          {errorItem.errors}
                        </ul>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sheet Tabs */}
        <div className="flex justify-start items-center space-x-4 mt-4 border-t pt-2">
          {errors
            .sort((a, b) => a.sheetIndex - b.sheetIndex)
            .map((sheet) => (
              <p
                key={sheet.sheetIndex}
                onClick={() => setActiveSheetIndex(sheet.sheetIndex)}
                className={`${
                  activeSheetIndex === sheet.sheetIndex
                    ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-600"
                } py-2 px-4 focus:outline-none cursor-pointer`}
              >
                {sheet.sheet}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
