import Image from "next/image";
import Link from "next/link";
import facebook from "../../../public/Landing/facebook.svg";
import instagram from "../../../public/Landing/instagram.svg";
import linkedin from "../../../public/Landing/linkedin.svg";
import twitter from "../../../public/Landing/twitter.svg";
import tiktok from "../../../public/Landing/tiktok.svg";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] flex items-center justify-between px-[100px] py-[26px]">
      <div>
        <span className="text-[#FFDDEC] text-[14px]">
          ©2024 myqcm Group. All rights reserved.
        </span>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-white italic font-semibold text-[20px] tracking-[-0.04px] mt-[6.6px]">
          Follow us
        </span>
        <ul className="flex items-center gap-5">
          <li>
            <Link href="">
              <Image src={facebook} alt="facebook" className="w-[13px]" />
            </Link>
          </li>
          <li>
            <Link href="">
              <Image src={instagram} alt="instagram" className="w-[20px]" />
            </Link>
          </li>
          <li>
            <Link href="">
              <Image src={tiktok} alt="tiktok" className="w-[18px]" />
            </Link>
          </li>
          <li>
            <Link href="">
              <Image src={linkedin} alt="linkedin" className="w-[20px]" />
            </Link>
          </li>
          <li>
            <Link href="">
              <Image src={twitter} alt="twitter" className="w-[18px]" />
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
