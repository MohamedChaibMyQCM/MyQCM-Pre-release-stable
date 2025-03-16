"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import signup from "../../../public/Landing/signup.svg";
import Line from "../../../public/Landing/Line.svg";

const Header = () => {
  const path = usePathname();

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`flex justify-between items-center h-[12vh] px-[100px] py-[20px] max-md:px-[20px] font-[600]`}
    >
      <Image src={logo} alt="logo" className="w-[100px]" />
      <nav>
        <ul className="flex items-center gap-10 max-md:hidden">
          {navLinks.map((link, index) => (
            <li key={index} className="relative flex items-center">
              <Link
                href={link.href}
                className={`font-[500] text-[16px] ${
                  path === link.href ? "text-[#F8589F]" : "text-[#191919]"
                } relative hover:text-[#F8589F] transition duration-300`}
              >
                {link.name}
              </Link>

              {/* {index !== navLinks.length - 1 && (
                <Image src={Line} alt="line" className="w-[2.3px] mx-6" />
              )} */}
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href={`/signup`}
          className="bg-[#F8589FCC] py-[8px] font-[500] flex gap-3 items-center px-[20px] text-[14px] text-[#FFFFFF] rounded-[16px] bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] hover:from-[#FD2E8A] hover:to-[#F8589F] transition-all duration-300"
        >
          Sign up <Image src={signup} alt="signup" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
