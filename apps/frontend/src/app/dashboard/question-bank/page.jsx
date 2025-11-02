import Categories from "@/components/dashboard/QuestionsBank/Categories";
import Exams from "@/components/dashboard/QuestionsBank/Exams";

const page = () => {
  return (
    <div className="bg-background min-h-screen py-[26px] max-md:pt-0">
      <Categories />
      <Exams />
    </div>
  );
};

export default page;