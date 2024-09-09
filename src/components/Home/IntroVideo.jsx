import Image from "next/image";
import exit from "../../../public/Icons/exit.svg";

const IntroVideo = ({ setVideo }) => {
  return (
    <div className="h-[100%] w-[100%] fixed left-0 top-0 bg-[#0000004D] flex items-center justify-center z-[100]">
      <div className="bg-[#FFFFFF] w-[400px] p-[20px] rounded-[16px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-Poppins text-[#0C092A] font-semibold">
            Introducing MyQCM Aljazayr
          </h3>
          <Image
            src={exit}
            alt="exit"
            className="w-[18px] cursor-pointer"
            onClick={() => setVideo(false)}
          />
        </div>
        <p className="font-Poppins text-[#49465F] font-light text-[12px]">
          Welcome to MyQCM Aljazayr, your personalized medical learning
          platform. <br /> <br />
          Discover adaptive quizzes, real-time feedback, and expert-driven
          content to help you succeed. Start mastering your medical courses
          today!
        </p>
      </div>
    </div>
  );
};

export default IntroVideo;
