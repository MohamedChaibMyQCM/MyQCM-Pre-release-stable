"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.svg";
import arrows from "../../../public/Aside/list.svg";
import user from "../../../public/Aside/user.svg";
import Link from "next/link";
import { aside_links } from "@/data/data";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

const Aside = () => {
  const locale = useLocale();
  const path = usePathname();
  const afterDashboard = path.split("/dashboard/")[1] || "";

  return (
    <aside className="fixed w-60 h-screen justify-between flex flex-col pt-[30px] pb-[18px] fixed top-0 left-0">
      <Image src={logo} alt="logo" className="w-[180px] mx-auto" />
      <ul className="flex flex-col mb-[40px] gap-1">
        {aside_links.map((item, index) => {
          return (
            <li
              key={index}
              className={`rounded-r-[12px] py-[14px] pl-[16px] w-[88%] ${
                afterDashboard == item.href ? "bg-[#F8589F]" : ""
              }`}
            >
              <Link
                href={`/${locale}/dashboard/${item.href}`}
                className="text-[#808191] flex items-center gap-4"
              >
                {afterDashboard === item.href ? (
                  <Image
                    src={item.hoverIcon}
                    alt="icon"
                    className="w-[20px] font-[500]"
                  />
                ) : (
                  <Image
                    src={item.icon}
                    alt="icon"
                    className="w-[20px] font-[500]"
                  />
                )}
                <span
                  className={`font-Poppins text-[14.6px] font-[500] ${
                    afterDashboard == item.href ? "text-[#FFFFFF]" : ""
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2 items-center mx-auto">
        <Image src={user} alt="user" className="w-[44px]" />
        <div className="flex flex-col font-Inter">
          <span className="text-[13.4px] text-[#11142D] font-[600]">
            Chaib Mohamed
          </span>
          <span className="text-[12.4px] text-[#808191] font-[500]">
            Premium +AI account
          </span>
        </div>
        <button>
          <Image src={arrows} alt="arrows" className="w-[24px]" />
        </button>
      </div>
    </aside>
  );
};

export default Aside;
