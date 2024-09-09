"use client"

import TimeLearning from "./TimeLearning";
import Progress from "./Progress";
import Search from "../Search";

const Statistical = () => {
  return (
    <div className="bg-[#FFF5FA] py-[30px] px-[24px] flex-1">
      <Search />
      <Progress  />
      <TimeLearning />
    </div>
  );
};

export default Statistical;