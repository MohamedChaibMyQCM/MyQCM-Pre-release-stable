import Image from "next/image";
import doctors from "../../../public/Doctors.svg";
import { IoIosArrowDropright } from "react-icons/io";
import { IoIosPlayCircle } from "react-icons/io";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="h-[88vh] bg-[#F8F8F8] pl-[100px] flex items-center justify-between">
      <div className="flex flex-col gap-4">
        <h1 className=" font-Genty text-[70px] leading-[80px]">
          <span className="text-[#00000078] stroke">
            Enhance your <br /> Med-learning
          </span>
          <span className="text-[#000000C7]">
            {" "}
            <br />
            With <span className="text-[#F8589FC9]">MY</span>QCM <br />{" "}
            Aljazayr.
          </span>
        </h1>
        <p className=" font-TTInterphases text-[17px] text-[#000] font-light">
          Enhance your{" "}
          <span className="text-[#F8589F] font-semibold">
            learning experience{"   "}
          </span>
          with
          <span className=" font-semibold"> adaptive MCQ’S</span> <br />{" "}
          designed to tailor each session to your
          <span className="font-semibold text-[#F8589F]">
            {" "}
            individual needs
          </span>
          , and <br />{" "}
          <span className="font-semibold">intelligent tutoring</span> systems
          that provide personalized <br /> feedback and guidance to{" "}
          <span className="text-[#EE4590] font-semibold">
            help you understand
          </span>{" "}
          <span className="font-semibold">
            complex <br /> concepts more effectively.
          </span>
        </p>
        <div className="flex items-center gap-8">
          <Link
            href="/SignUp"
            className="font-TTInterphases bg-[#F8589FCC] w-fit py-[8px] flex gap-2 items-center px-[20px] rounded-[10px] font-semibold text-[14px] text-[#fff]"
          >
            Try it now for free
            <IoIosArrowDropright className="text-[18px]" />
          </Link>
          <button className="flex items-center gap-3">
            <div className="relative after:w-[30px] after:h-[30px] after:absolute after:z-10 after:left-[-6.6px] after:top-[-6px] after:rounded-[50%] after:bg-[#EE459045]">
              <IoIosPlayCircle className="text-[#F8589FD6] text-[18px] z-50" />
            </div>
            <span className=" font-TTInterphases font-semibold text-[14px] text-[#433E3E]">
              Watch introducing video !{" "}
            </span>
          </button>
        </div>
      </div>
      <Image src={doctors} alt="doctors" className="w-[580px] self-end" />
    </section>
  );
};

export default HeroSection;
