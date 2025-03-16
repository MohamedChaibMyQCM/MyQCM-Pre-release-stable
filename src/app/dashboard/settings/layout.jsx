import Dash_Header from "@/components/dashboard/Dash_Header";
import Settings_Links from "@/components/dashboard/settings/Settings_Links";

const layout = ({ children }) => {
  return (
    <div className="bg-[#F7F8FA] pb-8">
      <div className="max-md:hidden">
        <Dash_Header path={"/Settings"} sub_path={"/Profile Info"} />
      </div>
      <Settings_Links />
      {children}
    </div>
  );
};

export default layout;
