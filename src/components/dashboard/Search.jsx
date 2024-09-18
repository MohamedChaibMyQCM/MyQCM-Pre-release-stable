import search from "../../../public/Aside/Search.svg";
import notification from "../../../public/Aside/bell.svg";
import Image from "next/image";
import { Input } from "../ui/input";

const Search = () => {
  return (
    <div className="flex items-center justify-between mb-[20px] pr-[20px]">
      <form className="flex items-center gap-4 w-[80%]">
        <Image src={search} alt="search" className="w-[20px]" />
        <Input
          type="text"
          placeholder="Search"
          className="w-[80%] bg-transparent inputs font-Inter text-[#808191] text-[13px] font-Inter outline-none"
        />
      </form>
      <div className="bg-[#FFFFFF] w-[36px] h-[36px] rounded-full relative flex items-center justify-center cursor-pointer">
        <Image src={notification} alt="notification" className="w-[16px]" />
        <span className=" absolute bg-[#FF754C] text-[#FFFFFF] flex items-center justify-center font-Inter w-[16px] h-[16px] rounded-full text-[9.6px] right-[-6px] top-[-2px]">
          0
        </span>
      </div>
    </div>
  );
};

export default Search;
