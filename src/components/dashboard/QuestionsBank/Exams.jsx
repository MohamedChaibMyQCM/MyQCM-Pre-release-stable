import { exams } from '@/data/data';
import Image from 'next/image';
import options from '../../../../public/Icons/options.svg'

const Exams = () => {
  return (
    <div className="mx-[28px] px-[30px] py-[20px] border border-[#E4E4E4] rounded-[16px] box mb-[20px] max-md:px-[20px] max-md:mx-[20px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-Poppins text-[#0C092A] font-semibold">
          Anciens examens <span className='max-md:hidden'>(et simulations)</span>
        </h3>
        <span className="text-[13px] font-Poppins text-[#FF95C4]">
          Voir Tout
        </span>
      </div>
      <ul className="flex items-center justify-between flex-wrap gap-5">
        {exams.map((item, index) => {
          return (
            <li
              key={index}
              className="flex flex-col border border-[#E4E4E4] p-[20px] rounded-[16px] cursor-pointer"
            >
              <div className="mb-5 flex justify-between items-start max-md:block max-md:mx-auto">
                <div className="flex items-center bg-[#FF95C4] w-fit py-[8px] px-[20px] rounded-[16px] max-md:w-[100%]">
                  <Image
                    src={item.university}
                    alt="university logo"
                    className="w-[36px] max-md:w-[26px]"
                  />
                  <span className="bg-[#FFFFFF] w-[1.6px] h-[40px] ml-[6px] mr-[10px] rounded-full max-md:h-[30px]"></span>
                  <Image
                    src={item.module}
                    alt="module"
                    className="w-[28px] max-md:w-[20px]"
                  />
                </div>
                <Image
                  src={options}
                  alt="options"
                  className=" cursor-pointer max-md:hidden"
                />
              </div>
              <span className="text-[#0C092A] font-semibold font-Poppins text-[15px] mb-2">
                {item.exam}
              </span>
              <span className="text-[#858494] text-[13px] font-light font-Poppins">
                QCM • {item.question} Question
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Exams