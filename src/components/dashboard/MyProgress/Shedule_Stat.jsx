import React from "react";
import My_Shedule from "./My_Shedule";
import Accuracy_over_time from "./Accuracy_over_time";

const Shedule_Stat = () => {
  return (
    <div className="flex mt-8 gap-6 max-md:flex-col">
      <My_Shedule />
      <Accuracy_over_time />
    </div>
  );
};

export default Shedule_Stat;
