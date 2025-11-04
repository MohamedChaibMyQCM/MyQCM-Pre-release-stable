import { Switch } from "@/components/ui/switch";

const RandomOptions = ({ name, value, setFieldValue }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px] text-[#191919] dark:text-white font-[500]">
        Mélanger l&apos;ordre des options
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
