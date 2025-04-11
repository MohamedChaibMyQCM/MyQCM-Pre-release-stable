"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import signup from "../../../public/Landing/signup.svg";

const Header = () => {
  const path = usePathname();

  // Liens de navigation
  const navLinks = [
    { name: "À propos", href: "" },
    { name: "Fonctionnalités", href: "" },
    { name: "Tarifs", href: "" },
    { name: "Contact", href: "" },
  ];

  return (
    <header
      className={`flex justify-between items-center h-[12vh] px-[100px] py-[20px] max-md:px-[20px] font-[600] top-0 z-50 bg-white/80 backdrop-blur-md transition-all duration-300`}
    >
      {/* Logo avec animation au survol */}
      <Link href="/">
        <Image
          src={logo}
          alt="Logo MYQCM"
          className="w-[120px] hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Navigation principale */}
      <nav>
        <ul className="flex items-center gap-16 max-md:hidden">
          {navLinks.map((link, index) => (
            <li key={index} className="relative flex items-center group">
              <Link
                href={link.href}
                className={`font-[500] text-[16px] ${
                  path === link.href ? "text-[#F8589F]" : "text-[#191919]"
                } relative hover:text-[#F8589F] transition-all duration-300`}
              >
                {link.name}
                {/* Soulignement animé */}
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

      {/* Bouton d'inscription */}
      <div className="flex items-center gap-3">
        <Link
          href={`/signup`}
          className="bg-[#F8589FCC] py-[8px] font-[500] flex gap-3 items-center px-[20px] text-[14px] text-[#FFFFFF] rounded-[16px] bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] hover:from-[#FD2E8A] hover:to-[#F8589F] transition-all duration-300 hover:shadow-lg hover:shadow-pink-200 hover:scale-[1.02] active:scale-95"
        >
          S&apos;inscrire{" "}
          <Image
            src={signup}
            alt="Icône d'inscription"
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
