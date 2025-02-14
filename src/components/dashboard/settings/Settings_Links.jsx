import { useLocale } from "next-intl";
import Link from "next/link";

const Settings_Links = () => {
  const locale = useLocale();

  return (
    <ul className="flex items-center gap-4 px-5 mt-6">
      <li>
        <Link
          href={`/${locale}/dashboard/settings`}
          className="bg-[#F8589F] text-[#FFFFFF] px-4 py-2 rounded-[20px] text-[14px]"
        >
          Profile info
        </Link>
      </li>
      <li>
        <Link
          href={`/${locale}/dashboard/settings/change-password`}
          className="bg-[#F8589F] text-[#FFFFFF] px-4 py-2 rounded-[20px] text-[14px]"
        >
          Change password
        </Link>
      </li>
      {/* <li>
        <Link
          href={`/${locale}/dashboard/settings/change-password`}
          className="bg-[#F8589F] text-[#FFFFFF] px-4 py-2 rounded-[20px] text-[14px]"
        >
          Upgrade account
        </Link>
      </li> */}
      <li>
        <Link
          href={`/${locale}/dashboard/settings/question-bank`}
          className="bg-[#F8589F] text-[#FFFFFF] px-4 py-2 rounded-[20px] text-[14px]"
        >
          Question bank
        </Link>
      </li>
      <li>
        <Link
          href={`/${locale}/dashboard/settings/notification`}
          className="bg-[#F8589F] text-[#FFFFFF] px-4 py-2 rounded-[20px] text-[14px]"
        >
          Notification
        </Link>
      </li>
    </ul>
  );
};

export default Settings_Links;
