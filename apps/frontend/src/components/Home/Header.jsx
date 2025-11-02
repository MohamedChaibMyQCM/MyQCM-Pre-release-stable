"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import signup from "../../../public/Landing/signup.svg";

const Header = () => {
  const path = usePathname();

  const navLinks = [
    { name: "À propos", href: "/#about" }, 
    { name: "Fonctionnalités", href: "/#features" },
    { name: "Tarifs", href: "/#pricing" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <header
      className={`bg-white flex justify-between items-center h-[12vh] min-h-[70px] max-md:h-[8vh] px-4 sm:px-6 md:px-12 lg:px-24 py-4 font-[600] sticky top-0 z-50  backdrop-blur-md transition-all duration-300 border-b border-gray-200/50 z-[100]`}
    >
      <Link href="/">
        <Image
          src="/logoMyqcm.png"
          alt="Logo MYQCM"
          width={120}
          height={40}
          className="w-[90px] md:w-[120px] h-auto hover:scale-105 transition-transform duration-300"
          priority
        />
      </Link>

      <nav className="hidden md:flex">
        <ul className="flex items-center gap-6 lg:gap-10 xl:gap-16">
          {navLinks.map((link) => (
            <li key={link.name} className="relative group">
              <Link
                href={link.href}
                className={`font-[500] text-sm lg:text-[16px] ${
                  path === link.href ? "text-[#F8589F]" : "text-[#191919]"
                } relative hover:text-[#F8589F] transition-colors duration-300 whitespace-nowrap`} 
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-[#F8589F] transition-all duration-300 ${
                    path === link.href ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center">
        <Link
          href={`/signup`}
          className="bg-[#F8589FCC] py-1.5 md:py-[8px] font-[500] flex gap-2 md:gap-3 items-center px-3 md:px-[20px] text-[13px] md:text-[14px] text-[#FFFFFF] rounded-[12px] md:rounded-[16px] bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] hover:from-[#FD2E8A] hover:to-[#F8589F] transition-all duration-300 hover:shadow-lg hover:shadow-pink-200 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
        >
          S&apos;inscrire{" "}
          <Image
            src={signup}
            alt="signup"
            width={16}
            height={16}
            className="w-3.5 h-3.5 md:w-auto transition-transform duration-300"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
