import { Switch } from "@/components/ui/switch";

const MultipleChoise = ({ name, value, setFieldValue }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="font-Poppins text-[13px] text-[#0C092A] font-semibold">
        Multiple Choice (MCQs)
      </span>
      <Switch
        checked={value}
        onCheckedChange={(checked) => setFieldValue(name, checked)}
        className={`switch ${value == false ? "!bg-[grey]" : "!bg-[#FF6EAF]"}`}
      />
    </div>
  );
};

export default MultipleChoise;
