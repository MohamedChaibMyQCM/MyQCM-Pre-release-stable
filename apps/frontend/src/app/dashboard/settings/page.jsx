import { redirect } from "next/navigation";

const SettingsIndexPage = () => {
  redirect("/dashboard/settings/personal-info");
};

export default SettingsIndexPage;
