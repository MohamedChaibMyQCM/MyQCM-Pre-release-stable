import Statistical from "@/components/dashboard/Home/Statistical";
import Welcome from "@/components/dashboard/Home/Welcome";

const wait = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const page = async () => {
  await wait(2000);
  return (
    <div className="flex border-l border-[#E4E4E4]">
      <Welcome />
      <Statistical />
    </div>
  );
};

export default page;
