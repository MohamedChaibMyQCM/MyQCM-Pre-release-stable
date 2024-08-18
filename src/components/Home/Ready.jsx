import { logos } from "@/data/data";
import Image from "next/image";
import Link from "next/link";
import patern from '../../../public/Patern.svg'

const Ready = () => {
  return (
    <section className="relative bg-[#F8589F] px-[100px] pt-[60px] pb-[40px] text-center flex flex-col gap-4">
      <Image src={patern} alt="patern" className="absolute top-0 left-0" />
      <h2 className="font-Genty text-[60px] stroke text-[#FFFFFF] leading-[69px] z-50">
        Ready to Enhance Your Medical <br /> Knowledge and Advance Your Career
      </h2>
      <p className="font-TTInterphases font-medium text-[#FFFFFF] z-50">
        Our platform provides access to top-tier medical education from the
        comfort of your home. Elevate your career today by engaging with
        expertly <br /> designed MCQs and tutorials on MyQCM Aljaxayr
      </p>
      <div className="flex items-center gap-6 justify-center mb-[40px] mt-[16px] z-50">
        <Link
          href=""
          className="bg-[#FFFFFF] py-[8px] px-[40px] rounded-[14px] text-[#F8589F] font-TTInterphases text-[14px] font-medium"
        >
          Get started
        </Link>
        <Link
          href=""
          className="bg-[#FFFFFF] py-[8px] px-[40px] rounded-[14px] text-[#F8589F] font-TTInterphases text-[14px] font-medium"
        >
          Contact us
        </Link>
      </div>
      <ul className="flex items-center gap-8">
        {logos.map((item, index) => {
          return (
            <li key={index}>
              <Image src={item.src} alt="logo" />
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default Ready;
