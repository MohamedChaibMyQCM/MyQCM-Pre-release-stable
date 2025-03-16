import Image from "next/image";
import Avatar from "../../../../public/Icons/Avatar.svg";
import medical from "../../../../public/Question_Bank/medical.svg";
import { CaretRight, ListBullets, Stack } from "phosphor-react";
import { Stethoscope } from "lucide-react";

const Module = ({ data }) => {
  return (
    <div className="flex flex-col gap-4 px-[22px] py-[26px] rounded-[16px] bg-[#FFFFFF] basis-[56%] box">
      <Image
        src={medical}
        width={400}
        height={200}
        alt="stock"
        className="w-full"
      />
      <span className="text-[15px] text-[#F8589F] font-medium">Module</span>
      <span className="text-[20px] text-[#191919] font-semibold">
        {data.name}
      </span>
      <div className="w-full bg-[#FFF5FA] flex items-center justify-between px-[22px] py-[14px] rounded-[16px] max-md:px-[12px]">
        <div className="flex items-center gap-3 max-md:flex-col">
          <div className="bg-[#F8589F] w-[30px] h-[30px] flex items-center justify-center rounded-[16px]">
            <ListBullets size={18} className="text-[#FFFFFF]" />
          </div>
          <span className="text-[14px] font-[500] text-[#0C092A] max-md:text-[12px]">
            <span className="text-[#F8589F] pr-1">
              {data.qcm_count + data.qcs_count}
            </span>
            QCM + QCS
          </span>
        </div>
        <span className="w-[1.6px] h-[34px] bg-[#CCCCCC80] rounded-full max-md:h-[60px]"></span>
        <div className="flex items-center gap-3 max-md:flex-col">
          <div className="bg-[#7996FD] w-[30px] h-[30px] flex items-center justify-center rounded-[16px]">
            <Stack size={18} className="text-[#FFFFFF]" />
          </div>
          <span className="font-[500] text-[14px] text-[#191919] max-md:text-[12px]">
            <span className="text-[#7996FD] pr-1">{data.qroc_count}</span> QROC
          </span>
        </div>
        <span className="w-[1.6px] h-[34px] bg-[#CCCCCC80] rounded-full max-md:h-[60px]"></span>
        <div className="flex items-center gap-3 max-md:flex-col">
          <div className="bg-[#47B881] w-[30px] h-[30px] flex items-center justify-center rounded-[16px]">
            <Stethoscope size={16} className="text-[#FFFFFF]" />
          </div>
          <span className="font-[500] text-[14px] text-[#191919] max-md:text-[12px]">
            <span className="text-[#47B881] pr-1">0</span> Cas Clinique
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 my-2">
        <span className="font-Poppins font-medium text-[14px] text-[#F8589F]">
          DESCRIPTION
        </span>
        <p className="text-[13px] text-[#666666]">
          {data.description}
        </p>
      </div>
      <div className="flex items-center gap-3 ">
        <Image src={Avatar} alt="avatar" />
        <div className="flex flex-col gap-1">
          <span className="text-[#191919] font-semibold text-[14px]">
            Nait Si Mohand Mohammed Saadi
          </span>
          <span className="text-[#666666] text-[12px]">
            Creator of 3rd-year medical content, top 6 in 3rd year.
          </span>
        </div>
      </div>
      {/* <div className="flex justify-center gap-12 mt-[16px]">
        <button className="text-[#F8589F] text-[13px] font-medium max-md:text-[12px]">
          Jouer par Unite
        </button>
        <button className="flex items-center gap-2 font-medium bg-[#F8589F] rounded-[20px] px-[28px] py-[12px] text-[13px] text-[#FFFFFF] max-md:text-[12px]">
          Simulation pour toutes les unités <CaretRight size={18} />
        </button>
      </div> */}
    </div>
  );
};

export default Module;
