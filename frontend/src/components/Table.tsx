import { useState } from "react";
import DeleteModal from "./DeleteModal";

interface TableProps {
  data: any[];
  limit: number;
  page: number;
  setPage: (page: number) => void;
  totalRows: number;
  totalPages: number;
  deleteRecord: (recordId: string) => void;
  showDeleteColumn?: boolean;
  showStatusColumn?: boolean;
}

const Table = ({
  data,
  limit,
  page,
  setPage,
  totalRows,
  totalPages,
  deleteRecord,
  showDeleteColumn = false,
  showStatusColumn = false,
}: TableProps) => {
  const [showPopOver, setShowPopOver] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<string>("");

  return (
    <>
      <div className="mt-8 relative flex flex-col w-full h-auto overflow-auto text-white bg-[#242424] shadow-md rounded-lg bg-clip-border select-none">
        <table className="w-full text-center table-auto min-w-max">
          <thead>
            <tr>
              <th className="p-4 border-b border-[#444444] bg-[#353535]">
                <p className="text-sm font-normal leading-none text-[#e0e0e0]">
                  S.No.
                </p>
              </th>
              <th className="p-4 border-b border-[#444444] bg-[#353535]">
                <p className="text-sm font-normal leading-none text-[#e0e0e0]">
                  Name
                </p>
              </th>
              <th className="p-4 border-b border-[#444444] bg-[#353535]">
                <p className="text-sm font-normal leading-none text-[#e0e0e0]">
                  Amount
                </p>
              </th>
              <th className="p-4 border-b border-[#444444] bg-[#353535]">
                <p className="text-sm font-normal leading-none text-[#e0e0e0]">
                  Date
                </p>
              </th>
              <th className="p-4 border-b border-[#444444] bg-[#353535]">
                <p className="text-sm font-normal leading-none text-[#e0e0e0]">
                  Verified
                </p>
              </th>
              {showStatusColumn && (
                <th className="p-4 border-b border-[#444444] bg-[#353535]">
                  <p className="text-sm font-normal leading-none text-[#e0e0e0]">
                    Status
                  </p>
                </th>
              )}
              {showDeleteColumn && (
                <th className="p-4 border-b border-[#444444] bg-[#353535]">
                  <p className="text-sm font-normal leading-none text-[#e0e0e0]"></p>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr
                key={row.sno}
                className="hover:bg-[#3a3a3a] border-b border-[#444444]"
              >
                <td className="p-4 py-2">
                  <p className="block font-semibold text-sm text-white">
                    {row.sno}
                  </p>
                </td>
                <td className="p-4 py-2">
                  <p className="text-sm text-[#b0b0b0]">{row.name}</p>
                </td>
                <td className="p-4 py-2">
                  <p className="text-sm text-[#b0b0b0]">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(row.amount)}
                  </p>
                </td>
                <td className="p-4 py-2">
                  <p className="text-sm text-[#b0b0b0]">
                    {new Date(row.date).toLocaleDateString()}
                  </p>
                </td>
                <td className="p-4 py-2">
                  <p className="text-sm text-[#b0b0b0]">
                    {row.verified ? "Yes" : "No"}
                  </p>
                </td>
                {showStatusColumn && (
                  <td className="px-6 py-4">
                    {row.valid ? (
                      <div className="flex items-center gap-2 justify-center">
                        <div
                          className="p-[0.25rem] text-[#05df72] rounded-full"
                          style={{
                            backgroundColor:
                              "color-mix(in oklab, #05df72 5%, transparent)",
                          }}
                        >
                          <div className="h-[0.375rem] w-[0.375rem] rounded-full bg-[#05df72]"></div>
                        </div>
                        Valid
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-2 justify-center relative"
                        onMouseEnter={() => setShowPopOver(row._id)}
                        onMouseLeave={() => setShowPopOver("")}
                      >
                        <div
                          className="p-[0.25rem] text-[#ff637e] rounded-full"
                          style={{
                            backgroundColor:
                              "color-mix(in oklab, #ff637e 5%, transparent)",
                          }}
                        >
                          <div className="h-[0.375rem] w-[0.375rem] rounded-full bg-[#ff637e]"></div>
                        </div>
                        Error
                        {showPopOver === row._id && (
                          <div className="absolute min-w-[300px] bg-[#27272a] rounded-lg shadow-lg p-2 text-[#b0b0b0]">
                            {row.error
                              .split(", ")
                              .map((error: string, index: number) => (
                                <p key={index} className="text-sm">
                                  {error}
                                </p>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                )}
                {showDeleteColumn && (
                  <td className="p-4 py-2">
                    <p
                      onClick={() => setShowDeleteModal(row._id)}
                      className="block cursor-pointer text-red-600 font-sans text-sm antialiased font-medium leading-normal text-blue-gray-900"
                    >
                      Delete
                    </p>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center px-4 py-3">
          <div className="text-sm text-[#b0b0b0]">
            Showing{" "}
            <b>
              {Math.min(limit * (page - 1) + 1, totalRows)}-
              {Math.min(limit * page, totalRows)}
            </b>{" "}
            of <b>{totalRows}</b>
          </div>
          <div className="flex space-x-1">
            <button
              className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-[#b0b0b0] bg-[#242424] border border-[#444444] rounded hover:bg-[#353535] hover:border-[#555555] transition duration-200 ease cursor-pointer disabled:cursor-default disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-[#b0b0b0] bg-[#242424] border border-[#444444] rounded hover:bg-[#353535] hover:border-[#555555] transition duration-200 ease cursor-pointer disabled:cursor-default disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <DeleteModal
          close={() => setShowDeleteModal("")}
          deleteRecord={() => {
            deleteRecord(showDeleteModal);
            setShowDeleteModal("");
          }}
        />
      )}
    </>
  );
};

export default Table;
