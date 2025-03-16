import AiSolver from "@/components/dashboard/AIqcmsolver/AiSolver";
import OldQuestions from "@/components/dashboard/AIqcmsolver/OldQuestions";
import React from "react";

const page = () => {
  return (
    <div className="flex h-screen">
      <AiSolver />
      <OldQuestions />
    </div>
  );
};

export default page;