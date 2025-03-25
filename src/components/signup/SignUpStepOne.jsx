"use client";

import Image from "next/image";
import GoogleAuthButton from "@/app/comp/google-auth.button"; 
import avatar1 from '../../../public/auth/avatar1.svg';
import avatar2 from '../../../public/auth/avatar2.svg';
import avatar3 from '../../../public/auth/avatar3.svg';
import avatar4 from '../../../public/auth/avatar4.svg';
import avatar5 from '../../../public/auth/avatar5.svg';
import avatar6 from '../../../public/auth/avatar6.svg';
import user from '../../../public/auth/user.svg';

const SignUpStepOne = ({ setStep, setUserName, user_name }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  return (
    <>
      <div className="w-[567.09px] flex items-center justify-center bg-transparent max-md:w-[90%]">
        <GoogleAuthButton />
      </div>
      <span className="relative w-[567.09px] my-2 flex items-center justify-center text-[#6C727580] text-[13px] after:bg-[#6C727580] after:absolute after:w-[260px] after:max-md:w-[120px] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[260px] before:max-md:w-[120px] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%] max-md:w-[90%]">
        OR
      </span>
      <form
        className="w-[567.09px] flex flex-col items-center gap-4 max-md:w-[90%]"
        onSubmit={handleSubmit}
      >
        <div className="w-full flex flex-col gap-2 pb-[12px]">
          <label
            htmlFor="full_name"
            className="text-[#191919] text-[15px] font-medium mb-1"
          >
            Avatar
          </label>
          <div className="w-full flex items-center gap-3 ">
            <Image src={avatar1} alt="avatar" />
            <Image src={avatar2} alt="avatar" />
            <Image src={avatar3} alt="avatar" />
            <Image src={avatar4} alt="avatar" />
            <Image src={avatar5} alt="avatar" />
            <Image src={avatar6} alt="avatar" />
            <Image src={avatar1} alt="avatar" />
          </div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="full_name"
            className="text-[#191919] text-[15px] font-medium"
          >
            Full Name
          </label>
          <div className="bg-[#FFF] w-full flex items-center gap-4 px-[16px] py-[12px] rounded-[12px] border border-[#E4E4E4]">
            <Image src={user} alt="User icon" />
            <input
              type="text"
              id="full_name"
              placeholder="Enter your full name"
              className="text-[#666666] text-[14px] bg-transparent outline-none w-full"
              value={user_name}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[12px] font-medium mt-4"
        >
          Continue
        </button>
      </form>
    </>
  );
};

export default SignUpStepOne;
