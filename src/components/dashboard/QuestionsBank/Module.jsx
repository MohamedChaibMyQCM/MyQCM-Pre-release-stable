import Image from "next/image";
import stock from "../../../../public/MyQCM Stock 1.svg";
import Avatar from "../../../../public/Icons/Avatar.svg";
import qcm from "../../../../public/Icons/QCM.svg";
import qroc from "../../../../public/Icons/Qroc.svg";
import clinical from "../../../../public/Icons/casClinical.svg";

const Module = ({ data }) => {
  return (
    <div className="flex flex-col gap-4 px-[22px] py-[26px] rounded-[16px] bg-[#FFFFFF] basis-[56%] box">
      <Image src={stock} alt="stock" className="w-full" />
      <span className="font-Poppins text-[14px] text-[#858494] font-medium">
        Module
      </span>
      <span className="font-Poppins text-[20px] text-[#0C092A] font-semibold">
        {data.name}
      </span>
      <div className="w-full bg-[#FFF5FA] flex items-center justify-between px-[22px] py-[14px] rounded-[16px]">
        <div className="flex items-center gap-3">
          <Image src={qcm} alt="QCM + QCS" />
          <span className="font-Poppins font-semibold text-[14px] text-[#0C092A]">
            {data.qcm_count + data.qcs_count} QCM + QCS
          </span>
        </div>
        <span className="w-[1.6px] h-[34px] bg-[#CCCCCC80] rounded-full"></span>
        <div className="flex items-center gap-3">
          <Image src={qroc} alt="QCM + QCS" />
          <span className="font-Poppins font-semibold text-[14px] text-[#0C092A]">
            {data.qroc_count} QROC
          </span>
        </div>
        <span className="w-[1.6px] h-[34px] bg-[#CCCCCC80] rounded-full"></span>
        <div className="flex items-center gap-3">
          <Image src={clinical} alt="QCM + QCS" />
          <span className="font-Poppins font-semibold text-[14px] text-[#0C092A]">
            30 Cas Clinique
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 my-2">
        <span className="font-Poppins font-semibold text-[14px] text-[#858494]">
          DESCRIPTION
        </span>
        <p className="font-Poppins text-[13px] text-[#49465F]">
          {data.description}
        </p>
      </div>
      <div className="flex items-center gap-3 pb-[22px] border-b-[2px]">
        <Image src={Avatar} alt="avatar" />
        <div className="flex flex-col gap-1">
          <span className="font-Poppins text-[#0C092A] font-semibold text-[14px]">
            Nait Si Mohand Mohammed Saadi{" "}
          </span>
          <span className="font-Poppins text-[#858494] text-[12px]">
            Creator of 3rd-year medical content, top 6 in 3rd year.
          </span>
        </div>
      </div>
      <div className="flex self-end gap-12 mt-[16px]">
        <button className="font-Poppins text-[#F8589F] text-[14px] font-medium">
          Play by Unite
        </button>
        <button className="font-Poppins font-medium bg-[#FF95C4] rounded-[16px] px-[20px] py-[10px] text-[14px] text-[#FFFFFF]">
          Simulation for all Unites
        </button>
      </div>
    </div>
  );
};

export default Module;
