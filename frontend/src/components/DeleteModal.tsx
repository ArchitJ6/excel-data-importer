interface DeleteModalProps {
  close: () => void;
  deleteRecord: () => void;
}

const DeleteModal = ({ close, deleteRecord }: DeleteModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#242424] rounded-lg shadow-lg p-6 m-10 md:w-1/2 overflow-hidden flex flex-col">
        <div className="flex flex-col gap-4 justify-center">
          <p className="w-full text-base font-medium text-[#e0e0e0]">
            Are you sure you want to delete this record? This action cannot be
            undone.
          </p>

          <div className="flex justify-end items-center">
            <button
              onClick={close}
              className="p-2 bg-[#e0e0e0] text-black rounded-md mr-4"
            >
              Cancel
            </button>
            <button
              onClick={deleteRecord}
              className="p-2 bg-red-500 text-white rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
