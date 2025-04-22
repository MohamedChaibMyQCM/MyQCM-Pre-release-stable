import { logos } from "@/data/data"; 
import Image from "next/image";
import vector from "../../../public/Landing/Vector.svg";

const InfiniteCarousel = () => {
  return (
    <div className="relative w-full overflow-hidden h-[180px] ">
      <div className="flex animate-alternate-scroll w-max flex-nowrap">
        {[...logos, ...logos, ...logos].map((item, index) => (
          <div key={index} className="flex items-center shrink-0 mx-8">
            <div className="shrink-0">
              <Image
                src={item.src}
                alt="logo"
                width={160}
                height={80}
                className="w-[200px] object-contain"
              />
            </div>
            <div className="shrink-0 ml-8">
              <Image
                src={vector}
                alt="separator"
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteCarousel;
