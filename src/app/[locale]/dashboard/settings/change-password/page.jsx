import Image from "next/image";
import password from "../../../../../../public/settings/password.svg";

const page = () => {
  return (
    <div className="mx-5 bg-[#FFFFFF] py-5 px-6 mt-12 rounded-[16px]">
      <h3 className="text-[#191919] font-[500] mb-1">New password</h3>
      <p className="text-[#666666] text-[13.6px]">
        Update your password to keep your account secure. Choose a strong,
        unique password to protect your information and <br /> maintain privacy.
      </p>
      <form className="mt-6">
        <div className="flex flex-col mb-6">
          <span className="text-[#F8589F] text-[14px] mb-1">
            Current password
          </span>
          <input
            type="password"
            className="border w-[48%] rounded-[16px] py-[6px] px-4 outline-none"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col w-[48%]">
            <span className="text-[#F8589F] text-[14px] mb-1">
              New password
            </span>
            <input
              type="password"
              className="border w-[100%] rounded-[16px] py-[6px] px-4 outline-none"
            />
          </div>
          <div className="flex flex-col w-[48%]">
            <span className="text-[#F8589F] text-[14px] mb-1">
              Confirm new password
            </span>
            <input
              type="password"
              className="border w-[100%] rounded-[16px] py-[6px] px-4 outline-none"
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-10">
          <span className="text-[#B5BEC6] text-[13px]">
            You will be asked to log in again with your new password after you
            save your changes.
          </span>
          <button className="bg-[#F8589F] text-[#FFFFFF] px-5 py-2 rounded-[16px] text-[13px]">
            Save Changes
          </button>
        </div>
      </form>
      <Image src={password} alt="password" className="mx-auto mt-8" />
    </div>
  );
};

export default page;
