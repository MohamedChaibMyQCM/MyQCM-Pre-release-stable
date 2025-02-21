"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.svg";
import SwitchLanguage from "./SwitchLanguage";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoIosPlayCircle } from "react-icons/io";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const path = usePathname();

  return (
    <header
      className={`flex justify-between items-center h-[12vh] px-[100px] py-[20px] max-md:px-[20px] font-[600]`}
    >
      <Image src={logo} alt="logo" className="w-[150px]" />
      <ul className="flex justify-between items-center basis-[50%] max-md:hidden">
        <li className="">
          <a
            href=""
            className={` h-[22.5px] block text-[15px] text-[#191919] relative  
             after:w-[8px] after:h-[8px] after:absolute after:left-[50%] after:bottom-[-11px] after:translate-x-[-50%] after:bg-[#F8589F] after:rounded-[50%]`}
          >
            Page d'accueil
          </a>
        </li>
        <li className="">
          <a
            href=""
            className={`text-[15px] text-[#191919] relative after:hidden after:w-[8px] after:h-[8px] flex items-center gap-2 after:absolute after:bottom-[-10px] after:left-[50%] after:translate-x-[-50%] after:bg-[#F8589F] after:rounded-[50%] duration-300 hover:text-[#F8589F]`}
          >
            Fonctionnalités
            <MdKeyboardArrowDown className="text-[18px] mt-[2.2px]" />
          </a>
        </li>
        <li className="">
          <a
            href=""
            className={`text-[15px] text-[#191919] relative after:hidden after:w-[8px] after:h-[8px] flex items-center gap-2 after:absolute after:bottom-[-10px] after:left-[50%] after:translate-x-[-50%] after:bg-[#F8589F] after:rounded-[50%] duration-300 hover:text-[#F8589F]`}
          >
            Tarification
            <MdKeyboardArrowDown className="mt-[2.2px] text-[18px]" />
          </a>
        </li>
        <li className="">
          <a
            href=""
            className={`h-[22.5px] block text-[15px] text-[#191919] relative after:hidden after:w-[8px] after:h-[8px] after:absolute after:left-[50%] after:bottom-[-10px] after:translate-x-[-50%] after:bg-[#F8589F] after:rounded-[50%] duration-300 hover:text-[#F8589F]`}
          >
            Contactez-nous
          </a>
        </li>
      </ul>
      <div className="flex items-center gap-3">
        <Link
          href={`/signup`}
          className="bg-[#F8589FCC] py-[8px] flex gap-2 items-center px-[20px] rounded-[10px] text-[14px] text-[#fff]"
        >
          Inscrivez-vous <IoIosPlayCircle className="text-[18px]" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
