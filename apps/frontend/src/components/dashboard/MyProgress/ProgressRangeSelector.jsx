"use client";

const OPTIONS = [
  { value: "all", label: "Tout" },
  { value: "30d", label: "30 j" },
  { value: "7d", label: "7 j" },
];

const ProgressRangeSelector = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2 flex-wrap justify-end max-sm:justify-start">
      {OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-[999px] px-3 py-1 text-[12px] font-medium transition-colors ${
              isActive
                ? "bg-[#F8589F] text-white shadow-sm"
                : "bg-white text-foreground dark:bg-[#1a1a1a] dark:text-white border border-border"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default ProgressRangeSelector;
