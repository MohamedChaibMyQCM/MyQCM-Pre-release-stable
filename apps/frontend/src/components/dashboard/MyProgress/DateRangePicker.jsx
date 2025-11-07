"use client";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

export function DateRangePicker({
  dateRange,
  setDateRange,
  onCancel,
  onConfirm,
  showTrigger = true,
}) {
  const calendarContent = (
    <div className="flex flex-col gap-2 p-2">
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={dateRange?.from}
        selected={dateRange}
        onSelect={setDateRange}
        numberOfMonths={2}
        className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111111]"
      />
      <div className="flex justify-end gap-2 p-2 pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
        >
          Annuler
        </Button>
        <Button
          size="sm"
          onClick={onConfirm}
          className="bg-[#F8589F] hover:bg-[#e24b8e] text-white"
        >
          Confirmer
        </Button>
      </div>
    </div>
  );

  if (!showTrigger) {
    return calendarContent;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className="w-[280px] justify-start text-left font-normal bg-white hover:bg-gray-50 dark:bg-[#0f0f0f] dark:hover:bg-[#181818]"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Choisir une période</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {calendarContent}
      </PopoverContent>
    </Popover>
  );
}
