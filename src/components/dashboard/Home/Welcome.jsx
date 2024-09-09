import React from "react";
import Cards from "./Cards";
import Calender from "./Calender";

const Welcome = () => {
  return (
    <div className="pt-[10px] px-[30px] w-[60%]">
      <Cards  />
      <Calender />
    </div>
  );
};

export default Welcome;
