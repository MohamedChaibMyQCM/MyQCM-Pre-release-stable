import Dash_Header from "@/components/dashboard/Dash_Header";
import Progress_Links from "@/components/dashboard/MyProgress/Progress_Links";

const layout = ({ children }) => {
  return (
    <div className="bg-[#F7F8FA] dark:bg-[#0a0a0a] pb-8 ">
      <Dash_Header path={"/My Progress"} sub_path={"/Summary"} />
      <Progress_Links />
      {children}
    </div>
  );
};

export default layout;
