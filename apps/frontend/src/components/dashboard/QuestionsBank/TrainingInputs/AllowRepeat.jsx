import { Switch } from "@/components/ui/switch";

const AllowRepeat = ({ name, value, setFieldValue }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px] text-[#191919] font-[500]">
        Autoriser la répétition du MCQ
      </span>
      <Switch
        checked={value}
        onCheckedChange={(checked) => setFieldValue(name, checked)}
        className={`switch ${value == false ? "!bg-[grey]" : "!bg-[#FD2E8A]"}`}
      />
    </div>
  );
};

export default AllowRepeat;
