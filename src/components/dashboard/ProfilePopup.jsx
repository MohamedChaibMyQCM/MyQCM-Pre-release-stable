import { useLocale } from "next-intl";
import secureLocalStorage from "react-secure-storage";
import { useRouter } from "next/navigation";
import { IoLogOut } from "react-icons/io5";

const ProfilePopup = () => {
  const locale = useLocale();
  const router = useRouter();

  const handleLogout = () => {
    secureLocalStorage.removeItem("token");
    router.push(`/${locale}`);
  };

  return (
    <div className="absolute flex items-center gap-2 px-[16px] text-center top-[-48px] right-[20px] py-[7px] w-[120px] rounded-[6px] bg-[#11142D]">
      <IoLogOut className="text-[#FFF] text-[18px]" />
      <button
        className="font-[500] text-center text-[#FFF] text-[15px]"
        onClick={() => handleLogout()}
      >
        Logout
      </button>
    </div>
  );
};

export default ProfilePopup;
