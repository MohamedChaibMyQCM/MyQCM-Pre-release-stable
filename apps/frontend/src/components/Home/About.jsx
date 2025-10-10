// pages/about.js
import Image from "next/image";
import achivement from "../../../public/Landing/Achiev.svg";
import About_Icons from "./About_Icons"; 

const About = () => {
  return (
    <section className="relative bg-[#FFDDEC] px-[100px] py-[60px] flex justify-between items-center overflow-hidden">
      <div>
        <h2 className="text-[#FD2E8A] text-[26px] font-[700] mb-2">About us</h2>
        <div className="my-5">
          <h4 className="text-[#191919] mb-1 text-[15px] font-[500]">
            Empowering Tomorrow&apos;s Healthcare Heroes
          </h4>
          <p className="text-[#666666] text-[14px]">
            At MyQCM, we&apos;re on a mission to transform medical education
            through the <br /> power of AI. We believe every student deserves a
            personalized path to success, <br /> preparing them to excel in the
            complex world of healthcare. With our <br /> innovative platform,
            recognized nationally for excellence in EdTech, and <br /> positive
            adoption by Algerian medical students, we&apos;re building a future
            of <br /> highly skilled and compassionate healthcare professionals.
          </p>
        </div>
        <button className="text-[#F8589F] flex items-center gap-2 text-[14px] font-[500]">
          Show achievements{" "}
          <Image src={achivement} alt="achievements" className="w-[12px]" />
        </button>
      </div>
      <div className="flex-shrink-0 overflow-visible">
        {/* <About_Icons /> */}
      </div>
    </section>
  );
};

export default About;
