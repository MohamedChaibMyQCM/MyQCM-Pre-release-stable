import Categories from "@/components/dashboard/QuestionsBank/Categories";
import Exams from "@/components/dashboard/QuestionsBank/Exams";

const page = () => {
  return (
    <div className="py-[26px] max-md:pt-0">
      <Categories />
      <Exams />
    </div>
  );
};

export default page;