"use client";

import React from "react";
import Learning_calendar from "@/components/dashboard/MyProgress/Learning_calender";
import Performance from "@/components/dashboard/MyProgress/Performance";
import Progress_per_module from "@/components/dashboard/MyProgress/Progress_per_module";
import Recent_Quiz from "@/components/dashboard/MyProgress/Recent_Quiz";

const Page = () => {
  return (
    <div className="space-y-8 p-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Progress_per_module />
        <Performance />
        <Recent_Quiz />
      </div>
      <Learning_calendar />
    </div>
  );
};

export default Page;
