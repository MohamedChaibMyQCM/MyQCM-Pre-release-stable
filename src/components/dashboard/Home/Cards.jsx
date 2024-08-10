import { cards } from '@/data/data';
import Image from 'next/image';
import Link from 'next/link';

const Cards = () => {
  return (
    <div>
      <h1 className="text-[#11142D] font-Poppins text-[40px] font-[600] mb-[20px]">
        <span className="text-[20px] font-[500]">Hi Mohammed,</span> <br />
        What will you learn today?
      </h1>
      <div>
        {cards.map((item, index) => {
          return (
            <div
              className="flex items-center bg-[#FD2E8A] rounded-[16px] px-[10px] mb-[60px]"
              key={index}
            >
              <Image src={item.img} className="w-[400px]" />
              <div className="flex flex-col gap-2">
                <h3 className="font-Poppins text-[#FFFFFF] font-semibold text-[20px]">
                  Unite 01: <br /> Cardio-respiratory <br /> and Medical Psychology
                </h3>
                <p className="font-Inter text-[#FFFFFF] leading-[26px] font-light text-[12px]">
                  {item.description}
                </p>
                <div className="flex items-center gap-4">
                  <Link
                    href=""
                    className="font-Inter bg-[#FFFFFF] text-[#11142D] rounded-[20px] py-[8px] px-[22px] box text-[13px] font-semibold"
                  >
                    Quick Exam Simulation
                  </Link>
                  <Link
                    href=""
                    className="font-Inter bg-[#FF26A1] text-[#FFFFFF] rounded-[20px] py-[8px] px-[22px] text-[13px] box font-semibold"
                  >
                    Start Unite
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Cards