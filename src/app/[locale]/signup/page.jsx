import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import user from "../../../../public/Icons/user.svg";
import email from "../../../../public/Icons/email.svg";
import lock from "../../../../public/Icons/lock.svg";
import google from "../../../../public/Icons/google.svg";
import logo from "../../../../public/logoMyqcm.svg";

const Page = () => {
  const locale = useLocale();

  return (
    <div className="bg-[#FFF9F9] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6">
      <Image src={logo} alt="logo" />
      <div className="flex items-center justify-between bg-[#F7F3F6] w-[567.09px] p-[5px] rounded-[10px]">
        <Link
          href={`/${locale}/login`}
          className="py-[8px] text-[#6C7275] font-semibold font-Inter text-[14px] basis-1/2 flex items-center justify-center"
        >
          Sign in
        </Link>
        <Link
          href={`/${locale}/signup`}
          className="py-[8px] bg-[#FEFEFE] box text-[#232627] font-semibold text-[14px] font-Inter flex items-center justify-center basis-1/2 rounded-[10px]"
        >
          Create account
        </Link>
      </div>
      <button className="flex items-center justify-center rounded-[10px] border-[2px] border-[#E8ECEF] font-Inter text-[15px] py-[10px] gap-4 font-Inter font-semibold border border-[#E8ECEF] text-[#141718] w-[567.09px]">
        <Image src={google} alt="google icon" /> Continue with Google
      </button>
      <span className="relative w-[567.09px] my-2 flex items-center justify-center text-[#6C727580] font-Inter text-[13px] after:bg-[#6C727580] after:absolute after:w-[250px] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[250px] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%]">
        OR
      </span>
      <form className="w-[567.09px] flex flex-col items-center gap-4">
        <div className="bg-[#FFE7F2] flex items-center gap-4 w-full px-[16px] py-[14px] rounded-[10px]">
          <Image src={user} alt="user icon" />
          <input
            type="text"
            placeholder="Full name"
            className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
          />
        </div>
        <div className="bg-[#FFE7F2] w-full flex items-center gap-4 px-[16px] py-[14px] rounded-[10px]">
          <Image src={email} alt="email icon" />
          <input
            type="email"
            placeholder="Username or email"
            className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
          />
        </div>
        <div className="bg-[#FFE7F2] w-full flex items-center gap-4 px-[16px] py-[14px] rounded-[10px]">
          <Image src={lock} alt="lock icon" />
          <input
            type="password"
            placeholder="Password"
            className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[10px] font-Inter font-medium"
        >
          Sign Up with MyQcm Aljazayr
        </button>
      </form>
      <span className="text-[#6C7275] font-Inter text-[13px]">
        By creating an account, you agree to our
        <span className="text-[#F8589F] font-semibold">
          {" "}
          Terms of Service{" "}
        </span>{" "}
        and
        <span className="text-[#F8589F] font-semibold">
          {" "}
          Privacy & Cookie Statement
        </span>
        .
      </span>
    </div>
  );
};

export default Page;
