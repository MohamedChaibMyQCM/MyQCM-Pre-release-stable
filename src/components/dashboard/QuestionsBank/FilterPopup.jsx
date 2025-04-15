import React from "react";
import { X } from "phosphor-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FilterPopup = ({
  selectedUnit,
  setSelectedUnit,
  resetFilter,
  closeFilter,
  units,
  selectContentRef,
}) => {
  return (
    <div className="absolute right-0 top-[calc(100%+5px)] w-[400px] bg-white p-5 rounded-[16px] shadow-lg z-[50] max-md:w-[360px]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-[500] text-[#191919] mb-3 block">
            Select Unit
          </span>
          <X
            size={24}
            className="text-[#B5BEC6] font-[600] cursor-pointer"
            onClick={closeFilter}
          />
        </div>
        <Select
          value={selectedUnit || ""}
          onValueChange={(val) => {
            setSelectedUnit(val);
          }}
        >
          <SelectTrigger
            className={`rounded-[20px] items-center bg-white border border-[#E0E0E0] py-3 px-[20px]`}
          >
            <SelectValue placeholder="Select a Unit" />
          </SelectTrigger>
          <SelectContent
            ref={selectContentRef}
            className="bg-white rounded-[20px] border border-[#E0E0E0]"
          >
            <SelectGroup>
              {units.length > 0 ? (
                units.map((unit) => (
                  <SelectItem
                    key={unit.id}
                    value={unit.id}
                    className="text-[#191919] hover:bg-[#FFF5FA] hover:text-[#F8589F] data-[state=checked]:bg-[#FFF5FA] data-[state=checked]:text-[#F8589F] rounded-[20px] my-1 px-3 py-2"
                  >
                    {unit.name}
                  </SelectItem>
                ))
              ) : (
                <div className="text-center text-gray-500 py-2 px-3 text-sm">
                  No units available
                </div>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-center gap-6">
        <button
          onClick={resetFilter}
          className="text-[#F8589F] px-4 py-2 rounded-lg text-[14px] font-[500]"
        >
          Reset
        </button>
        <button
          onClick={closeFilter}
          className="bg-[#F8589F] text-[14px] font-[500] text-white px-6 py-[6px] rounded-[20px]"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FilterPopup;
