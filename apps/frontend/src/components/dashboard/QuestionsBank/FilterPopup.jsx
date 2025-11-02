import React, { useMemo } from "react";
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
  isLoading,
  hiddenUnitIds = [], // Receive hidden unit IDs from parent
}) => {
  // Filter and sort units
  const sortedUnits = useMemo(() => {
    if (!units || units.length === 0) return [];

    // Units should already be filtered by the parent component,
    // but we'll double-check to ensure hidden units aren't shown
    const filteredUnits = units.filter(
      (unit) => !hiddenUnitIds.includes(unit.id)
    );

    // Then sort the remaining units
    return [...filteredUnits].sort((a, b) => {
      // Extract unit numbers if available
      const getUnitNumber = (name) => {
        const match = name.match(/UEI-(\d+)/);
        return match ? parseInt(match[1], 10) : Infinity;
      };

      const aNum = getUnitNumber(a.name);
      const bNum = getUnitNumber(b.name);

      // Sort by unit number first
      if (aNum !== bNum) return aNum - bNum;

      // If no number or same number, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [units]);

  return (
    <div className="absolute right-0 top-[calc(100%+5px)] w-[400px] bg-card border border-border p-5 rounded-[16px] shadow-lg z-[50] max-md:w-[360px]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-[500] text-foreground mb-3 block">
            Select Unit
          </span>
          <X
            size={24}
            className="text-muted-foreground font-[600] cursor-pointer hover:text-foreground transition-colors"
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
            className={`rounded-[20px] items-center bg-card border-border py-3 px-[20px]`}
          >
            <SelectValue placeholder="Select a Unit" />
          </SelectTrigger>
          <SelectContent
            ref={selectContentRef}
            className="bg-card rounded-[20px] border-border"
          >
            <SelectGroup>
              {isLoading ? (
                <div className="text-center text-muted-foreground py-2 px-3 text-sm">
                  Loading units...
                </div>
              ) : sortedUnits.length > 0 ? (
                sortedUnits.map((unit) => (
                  <SelectItem
                    key={unit.id}
                    value={unit.id}
                    className="text-foreground hover:bg-accent hover:text-primary data-[state=checked]:bg-accent data-[state=checked]:text-primary rounded-[20px] my-1 px-3 py-2"
                  >
                    {unit.name}
                  </SelectItem>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-2 px-3 text-sm">
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
          className="text-primary hover:opacity-80 transition-opacity px-4 py-2 rounded-lg text-[14px] font-[500]"
        >
          Reset
        </button>
        <button
          onClick={closeFilter}
          className="bg-primary hover:opacity-90 transition-opacity text-[14px] font-[500] text-white px-6 py-[6px] rounded-[20px]"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FilterPopup;
