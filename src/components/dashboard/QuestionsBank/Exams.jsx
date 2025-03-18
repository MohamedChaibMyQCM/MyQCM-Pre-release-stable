import { exams } from '@/data/data';
import Image from 'next/image';
import options from '../../../../public/Icons/options.svg'
import unit from "../../../../public/Question_Bank/unit.svg";
import year from "../../../../public/Question_Bank/year.svg";

const Exams = () => {
  return (
    <div className="mx-[28px] py-[20px] rounded-[16px]">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-[#191919] font-[500] text-[18px] max-md:text-[16px]">
          Old exams
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#FFFFFF] gap-2 px-4 py-[6px] rounded-[16px] box">
            <button className="text-[14px] font-[500]">Unit</button>
            <Image src={unit} alt='unit' className="w-[13px]" />
          </div>
          <div className="flex items-center bg-[#FFFFFF] gap-2 px-4 py-[6px] rounded-[16px] box">
            <button className="text-[14px] font-[500]">Year</button>
            <Image src={year} alt='year' className="w-[13px]" />
          </div>
        </div>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-4 gap-5 bg-[#FFF] p-5 rounded-[16px] max-w-full box">
        {exams.map((item, index) => {
          return (
            <li
              key={index}
              className="flex flex-col border border-[#E4E4E4] rounded-[16px] p-[20px] cursor-pointer"
            >
              <span className="text-[#191919] font-semibold font-Poppins text-[15px] mb-3">
                {item.exam}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-[#F8589F] text-[14px] font-[600] bg-[#FFF5FA] py-[4px] px-2 rounded-[6px]">
                  QCM • {item.question} Question
                </span>{" "}
                <span className="text-[#F8589F] text-[13px] font-[500] font-Poppins">
                  2023/2024
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Exams