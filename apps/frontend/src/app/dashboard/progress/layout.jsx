import Dash_Header from "@/components/dashboard/Dash_Header";

const layout = ({ children }) => {
  return (
    <div className="bg-[#F7F8FA] dark:bg-[#0a0a0a] pb-6 md:pb-8 min-h-screen">
      <Dash_Header path={"/My Progress"} sub_path={"/Summary"} />
      {children}
    </div>
  );
};

export default layout;
