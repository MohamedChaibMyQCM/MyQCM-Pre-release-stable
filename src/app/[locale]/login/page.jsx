import Image from "next/image";
import logo from "../../../../public/logoMyqcm.svg";
import Link from "next/link";
import { useLocale } from "next-intl";
import email from "../../../../public/Icons/email.svg";
import lock from "../../../../public/Icons/lock.svg";
import google from "../../../../public/Icons/google.svg";

const Page = () => {
  const locale = useLocale();

  return (
    <div className="bg-[#FFF9F9] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6">
      <Image src={logo} alt="logo" />
      <div className="flex items-center justify-between bg-[#F7F3F6] w-[567.09px] p-[5px] rounded-[10px]">
        <Link
          href={`/${locale}/login`}
          className="py-[8px] bg-[#FEFEFE] box text-[#232627] font-semibold text-[14px] font-Inter flex items-center justify-center basis-1/2 rounded-[10px]"
        >
          Sign in
        </Link>
        <Link
          href={`/${locale}/signup`}
          className="py-[8px] text-[#6C7275] font-semibold font-Inter text-[14px] basis-1/2 flex items-center justify-center"
        >
          Create account
        </Link>
      </div>
      <button className="flex items-center justify-center rounded-[10px] border-[2px] border-[#E8ECEF] font-Inter text-[15px] py-[10px] gap-4 font-Inter font-semibold border border-[#E8ECEF] text-[#141718] w-[567.09px]">
        <Image src={google} alt="Google icon" /> Continue with Google
      </button>
      <span className="relative w-[567.09px] my-2 flex items-center justify-center text-[#6C727580] font-Inter text-[13px] after:bg-[#6C727580] after:absolute after:w-[250px] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[250px] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%]">
        OR
      </span>
      <form className="w-[567.09px] flex flex-col items-center gap-4">
        <div className="bg-[#FFE7F2] w-full flex items-center gap-4 px-[16px] py-[14px] rounded-[10px]">
          <Image src={email} alt="Email icon" />
          <input
            type="email"
            placeholder="Username or email"
            className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
          />
        </div>
        <div className="bg-[#FFE7F2] w-full flex items-center gap-4 px-[16px] py-[14px] rounded-[10px]">
          <Image src={lock} alt="Lock icon" />
          <input
            type="password"
            placeholder="Password"
            className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
          />
        </div>
        <Link
          href={`/${locale}/login/reset`}
          className="text-[#F8589F] font-Inter self-start text-[14px] font-medium mb-2"
        >
          Forgot password?
        </Link>
        <button
          type="submit"
          className="bg-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[10px] font-Inter font-medium"
        >
          Sign In with MyQcm Aljazayr
        </button>
      </form>
    </div>
  );
};

export default Page;
