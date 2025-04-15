import Calendar from "@/components/dashboard/Home/Calender";
import Dash_Header from "@/components/dashboard/Dash_Header";
import Modules from "@/components/dashboard/Home/Modules";
import Study_time from "@/components/dashboard/Home/Study_time";
import Units from "@/components/dashboard/Home/Units";

const Page = async () => {
  return (
    <div className="bg-[#F7F8FA] pb-10">
      <Dash_Header />
      <div className="px-5 mt-4 max-md:mt-0 max-xl:mt-8">
        <Units />
        <Modules />
        <div className="flex items-start gap-6 mt-10 max-md:flex-col w-[100%] max-md:mt-6">
          <div className="flex-1 w-[100%]">
            <Calendar />
          </div>
          <div className="flex-1 w-full">
            <Study_time />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
