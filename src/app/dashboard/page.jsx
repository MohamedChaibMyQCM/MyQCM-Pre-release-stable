import Calendar from "@/components/dashboard/Home/Calender";
import Dash_Header from "@/components/dashboard/Dash_Header";
import Modules from "@/components/dashboard/Home/Modules";
import Study_time from "@/components/dashboard/Home/Study_time";
import Units from "@/components/dashboard/Home/Units";

const Page = async () => {
  return (
    <div className="bg-[#F7F8FA] pb-8">
      <Dash_Header />
      <div className="px-6">
        <Units />
        <Modules />
        <div className="flex items-start gap-6 mt-12">
          <div className="flex-1">
            <Calendar />
          </div>
          <div className="flex-1">
            <Study_time />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
