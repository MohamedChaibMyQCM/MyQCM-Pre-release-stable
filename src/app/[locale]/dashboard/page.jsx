"use client"

import Statistical from "@/components/dashboard/Home/Statistical";
import Welcome from "@/components/dashboard/Home/Welcome";
import { useState } from "react";

const page = async () => {
  // const [unit, setUnit] = useState()

  return (
    <div className="flex border-l border-[#E4E4E4]">
      <Welcome  />
      <Statistical />
    </div>
  );
};

export default page;
