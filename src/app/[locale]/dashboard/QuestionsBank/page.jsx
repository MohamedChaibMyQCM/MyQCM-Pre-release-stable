import Categories from "@/components/dashboard/QuestionsBank/Categories";
import Exams from "@/components/dashboard/QuestionsBank/Exams";

const page = () => {
  return (
    <div className="py-[26px]">
      <Categories />
      <Exams />
    </div>
  );
};

export default page;