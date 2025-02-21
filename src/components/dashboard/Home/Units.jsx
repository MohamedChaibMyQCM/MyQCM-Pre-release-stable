import Image from "next/image";
import heart from "../../../../public/Home/heart.svg";
import play from "../../../../public/Home/play.svg";

const Units = () => {
  return (
    <div className="relative w-[100%] p-6 py-4 rounded-[20px] overflow-hidden bg-gradient-to-r from-[#FD2E8A] to-[#F8589F]">
      <div>
        <h2 className="text-[#FFFFFF] text-[18px] font-[500]">
          Unite 01: Cardio-respiratory and Medical Psychology
        </h2>
        <p className="text-[13px] text-[#FFFFFF] mt-2 mb-5 font-[400]">
          Explore the cardiovascular and respiratory systems' relationship and
          the psychological aspects of medical care. This unit <br /> includes
          five modules: semiology, physiopathology, radiology, biochemistry, and
          medical psychology, providing a <br /> comprehensive understanding of
          their impact on patient health and treatment.
        </p>
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-2 text-[#FFFFFF] bg-[#191919] rounded-[20px] px-5 py-[6px] text-[13px] font-[500]">
            Start Unite <Image src={play} alt="play" />
          </button>
          <button className="text-[13px] text-[#FFFFFF] font-[500]">
            Quick Exam Simulation
          </button>
        </div>
      </div>
      <Image
        src={heart}
        alt="heart"
        className="absolute w-[220px] right-2 bottom-[-40px]"
      />
    </div>
  );
};

export default Units;
