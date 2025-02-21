import GeneraleStat from "@/components/dashboard/MyProgress/GeneraleStat";
import Shedule_Stat from "@/components/dashboard/MyProgress/Shedule_Stat";
import Strength_Stat from "@/components/dashboard/MyProgress/Strength_Stat";

const page = () => {
  return (
    <div className="px-6 mt-8">
      <GeneraleStat />
      <Strength_Stat />
      <Shedule_Stat />
    </div>
  );
};

export default page;