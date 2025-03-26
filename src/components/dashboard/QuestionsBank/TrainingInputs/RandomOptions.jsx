import { Switch } from "@/components/ui/switch";

const RandomOptions = ({ name, value, setFieldValue }) => {
  return (
    <div className="flex items-center justify-between">
      <span className=" text-[15px] text-[#191919] font-[600]">
        Randomize options order
      </span>
      <Switch
        checked={value}
        onCheckedChange={(checked) => setFieldValue(name, checked)}
        className={`switch ${value == false ? "!bg-[grey]" : "!bg-[#FD2E8A]"}`}
      />
    </div>
  );
};

export default RandomOptions;