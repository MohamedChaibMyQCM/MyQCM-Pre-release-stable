"use client";

import { BounceLoader } from "react-spinners";

const Loading = () => {
  return (
    <div className="absolute h-[100%] w-[100%] top-0 left-0 bg-[#FFFFFF] flex items-center justify-center">
      <BounceLoader color="#FF6EAF" />
    </div>
  );
};

export default Loading;
