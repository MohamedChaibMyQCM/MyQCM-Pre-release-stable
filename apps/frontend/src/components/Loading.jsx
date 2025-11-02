import Image from "next/image";

const Loading = () => {
  return (
    <div className="absolute h-[100%] w-[100%] top-0 left-0 bg-[#FFFFFF] flex items-center justify-center z-[1000]">
      <div className="animate-pulse">
        <Image
          src="/logoMyqcm.png"
          alt="logo"
          width={160}
          height={160}
          className="w-[160px] h-auto"
          priority
        />
      </div>
    </div>
  );
};

export default Loading;
