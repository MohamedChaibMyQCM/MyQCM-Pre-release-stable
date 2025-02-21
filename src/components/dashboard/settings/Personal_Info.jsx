import Image from "next/image";
import background_profile from "../../../../public/settings/background_profile.svg";
import edit from "../../../../public/settings/edit.svg";
import avatar from "../../../../public/Icons/Avatar.svg";

const Personal_Info = () => {
  return (
    <div className="mx-5">
      <div className="relative mt-8 bg-[#FFFFFF] h-[160px] rounded-[16px] overflow-hidden h-[180px] box">
        <Image
          src={background_profile}
          alt="vector"
          className="absolute w-[100%]"
        />
        <div className="flex items-center justify-between px-6 mt-[86px]">
          <div className="flex items-center gap-4">
            <Image src={avatar} alt="profile img" className="w-[70px]" />
            <div className="flex flex-col">
              <span className="text-[#191919] text-[15px] font-[500]">Rayane Boucheraine</span>
              <span className="text-[#B5BEC6] text-[14px]">Premium + AI account</span>
            </div>
          </div>
          <button className="flex items-center gap-1 border border-[#F8589F] px-3 py-[3px] rounded-[16px] h-fit">
            <span className="text-[13px] text-[#F8589F] h-[16px]">Edit</span>
            <Image src={edit} alt="edit" className="w-[11px]" />
          </button>
        </div>
      </div>
      <div className="my-8 bg-[#FFFFFF] p-6 rounded-[16px] box">
        <div className="flex items-center justify-between mb-8">
          <div className="">
            <h3 className="text-[#191919] font-[500] mb-1 text-[17px]">
              Personal information
            </h3>
            <p className="text-[#666666] text-[13px]">
              Manage your personal information, update your contact details, to
              keep your profile up to date. Ensure your account <br /> settings
              reflect your latest information for a seamless experience.
            </p>
          </div>
          <button className="flex items-center gap-1 border border-[#F8589F] px-3 py-[3px] rounded-[16px] h-fit">
            <span className="text-[13px] text-[#F8589F] h-[16px]">Edit</span>
            <Image src={edit} alt="edit" className="w-[11px]" />
          </button>
        </div>
        <ul className="flex flex-col gap-8">
          <div className="flex">
            <li className="flex flex-col gap-2 mr-[400px]">
              <span className="text-[#F8589F] text-[14px] font-[500]">
                First Name
              </span>
              <span className="text-[13px] text-[#191919]">Rayane</span>
            </li>
            <li className="flex flex-col gap-2">
              <span className="text-[#F8589F] text-[14px] font-[500]">
                Last Name
              </span>
              <span className="text-[13px] text-[#191919]">Boucheraine</span>
            </li>
          </div>
          <div className="flex">
            <li className="flex flex-col gap-2 mr-[371px]">
              <span className="text-[#F8589F] text-[14px] font-[500]">
                Phone number
              </span>
              <span className="text-[13px] text-[#191919]">066666666</span>
            </li>
            <li className="flex flex-col gap-2">
              <span className="text-[#F8589F] text-[14px] font-[500]">
                Email
              </span>
              <span className="text-[13px] text-[#191919]">
                chaibmohamed@gmail.com
              </span>
            </li>
          </div>
        </ul>
      </div>
      <div className="bg-[#FFFFFF] p-6 rounded-[16px] box">
        <div className="flex justify-between">
          <div className="mb-4">
            <h3 className="text-[#191919] font-[500] mb-1 text-[17px]">
              University
            </h3>
            <p className="text-[#666666] text-[13px]">
              Submit a request to update your university details
            </p>
          </div>
          <button className="flex items-center gap-1 border border-[#F8589F] px-3 py-[3px] rounded-[16px] h-fit">
            <span className="text-[13px] text-[#F8589F] h-[16px]">Edit</span>
            <Image src={edit} alt="edit" className="w-[11px]" />
          </button>
        </div>
        <ul className="flex flex-col gap-8">
          <div className="flex">
            <li className="flex flex-col gap-2 mr-[400px]">
              <span className="text-[#F8589F] text-[14px] font-[500]">
                University
              </span>
              <span className="text-[13px] text-[#191919]">ISM Blida</span>
            </li>
            <li className="flex flex-col gap-2">
              <span className="text-[#F8589F] text-[14px] font-[500]">
                Year of study
              </span>
              <span className="text-[13px] text-[#191919]">3rd year</span>
            </li>
          </div>
          <div className="flex">
            <li className="flex flex-col gap-2 mr-[371px]">
              <span className="text-[#F8589F] text-[14px] font-[500]">
                Group
              </span>
              <span className="text-[13px] text-[#191919]">3</span>
            </li>
          </div>
        </ul>
      </div>
    </div>
  );
};

export default Personal_Info;
