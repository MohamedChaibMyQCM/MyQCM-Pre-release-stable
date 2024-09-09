import Image from "next/image";
import doctor from "../../../public/doctor.svg";
import vector from '../../../public/vector.svg'
import vector1 from "../../../public/Icons/vector1.svg";
import vector2 from "../../../public/Icons/vector2.svg";
import vector3 from "../../../public/Icons/vector3.svg";
import vector4 from "../../../public/Icons/vector4.svg";

const Features = () => {
  return (
    <section className="py-[30px] px-[60px]">
      <h4 className="uppercase text-center font-TTInterphases text-[#433E3E] font-bold text-[14px]">
        Features
      </h4>
      <h2 className="relative font-Genty text-center mt-[30px] text-[50px] w-[800px] leading-[66px] text-center mx-auto text-[#000000C7]">
        <span className="stroke text-[#838383]">
          Discover Your Medical Expertise{" "}
        </span>
        in Every Corner of the World
        <Image
          src={vector}
          alt="vector"
          className="absolute bottom-[-16px] right-[56px] feature_anim"
        />
      </h2>
      <div className="flex items-center justify-between">
        <div className="flex flex-col justify-between h-[300px] basis-[30%]">
          <div className="relative w-[300px] py-[18px] px-[30px] box rounded-[10px] self-end">
            <h3 className="font-Genty text-[#000000C7] text-[20px] mb-2">
              Adaptive Learning Paths
            </h3>
            <p className="font-TTInterphases text-[14px]">
              Customized learning journeys for students.
            </p>
            <Image
              src={vector3}
              alt="vector"
              className="absolute w-[50px] top-[-24px] right-[-24px]"
            />
          </div>
          <div className="relative w-[300px] py-[18px] px-[30px] box rounded-[10px] self-start">
            <h3 className="font-Genty text-[#000000C7] text-[20px] mb-2">
              Interactive Quizzes
            </h3>
            <p className="font-TTInterphases text-[14px]">
              Engaging quizzes with instant feedback
            </p>
            <Image
              src={vector4}
              alt="vector"
              className="absolute w-[50px] top-[-24px] right-[-24px]"
            />
          </div>
        </div>
        <div className="basis-[30%] flex items-center justify-center">
          <Image
            src={doctor}
            alt="doctor"
            className="w-[400px] mt-[40px] mr-[30px]"
          />
        </div>
        <div className="flex flex-col justify-between basis-[30%] h-[300px]">
          <div className="relative w-[300px] py-[18px] px-[30px] box rounded-[10px]">
            <h3 className="font-Genty text-[#000000C7] text-[20px] mb-2">
              Video Library
            </h3>
            <p className="font-TTInterphases text-[14px]">
              Videos divided into topic-specific segments
            </p>
            <Image
              src={vector2}
              alt="vector"
              className="absolute w-[50px] top-[-24px] left-[-24px]"
            />
          </div>
          <div className="relative w-[300px] py-[18px] px-[30px] box rounded-[10px] self-end">
            <h3 className="font-Genty text-[#000000C7] text-[20px] mb-2">
              Detailed Analytics
            </h3>
            <p className="font-TTInterphases text-[14px]">
              In-depth performance insights and reports
            </p>
            <Image
              src={vector1}
              alt="vector"
              className="absolute w-[50px] top-[-24px] left-[-24px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;