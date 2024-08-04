import Image from "next/image";
import logo from "../../../../../public/logoMyqcm.svg";
import arrow from "../../../../../public/Icons/arrow-left.svg";
import email from "../../../../../public/Icons/email.svg";
import Link from "next/link";
import { useLocale } from "next-intl";

const Page = () => {
  const locale = useLocale()

  return (
    <div className="bg-[#FFF9F9] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6">
      <Image src={logo} alt="logo" />
      <div className="flex items-center gap-4 self-start w-[567.09px] mx-auto">
        <Link href={`/${locale}/login`}><Image src={arrow} alt="arrow" className="w-[20px]" /></Link>
        <span className="font-Inter text-[20px] font-semibold text-[#141718]">
          Reset your password
        </span>
      </div>
      <form className="w-[567.09px] flex flex-col items-center gap-4">
        <div className="bg-[#FFE7F2] w-full flex items-center gap-4 px-[16px] py-[14px] rounded-[10px]">
          <Image src={email} alt="email icon" />
          <input
            type="password"
            placeholder="Phone number or email"
            className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[10px] font-Inter font-medium"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default Page;
