"use client";

const SchedulePopup = ({ selectedDate, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[300px]">
        <h3 className="text-[#191919] font-[500] text-[18px] mb-4">
          Schedule for {selectedDate.toDateString()}
        </h3>
        <textarea
          placeholder="Add your schedule..."
          className="w-full h-[100px] p-2 border border-[#B5BEC6] rounded-lg mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-[#B5BEC6] text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              
              onClose();
            }}
            className="bg-[#F8589F] text-white px-4 py-2 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulePopup;