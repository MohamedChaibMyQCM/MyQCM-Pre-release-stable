import wait_top from "../../../public/waitlist/wait-top.svg";
import wait_bottom from "../../../public/waitlist/wait-bottom.svg";
import wait_box from "../../../public/waitlist/wait-box.svg";
import { FaYoutube } from "react-icons/fa";
import { IoLogoLinkedin } from "react-icons/io";
import { FaXTwitter } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";
import Image from "next/image";
import Link from "next/link";

const Page = () => {
  return (
    <div className="bg-[#F7F8FA] w-screen min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Image
        src={wait_top}
        alt="Décoration haut"
        className="w-[300px] max-md:w-[240px] absolute top-0 left-0"
      />
      <Image
        src={wait_bottom}
        alt="Décoration bas"
        className="w-[300px] max-md:w-[240px] absolute bottom-0 right-0"
      />

      <div className="bg-white rounded-[16px] p-6 w-full max-w-[600px] relative z-10">
        <Image src={wait_box} alt="Illustration" className="w-full" />

        <div className="text-center mt-4">
          <h3 className="text-[#191919] font-medium text-xl mb-3">
            Bienvenue sur la liste d&apos;attente MyQCM Beta !
          </h3>

          <p className="text-[13px] text-black mb-4">
            Merci pour votre inscription ! Vous êtes maintenant sur la liste
            d&apos;attente MyQCM Beta. Nous vous enverrons un email dès que
            votre accès sera approuvé.
          </p>

          <Link
            href=""
            className="text-[#F8589F] font-medium text-sm mb-3 inline-block"
          >
            Nous contacter
          </Link>

          <div className="flex justify-center gap-4">
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaXTwitter className="w-6 h-6 transition-colors hover:text-[#FD2E8A]" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/myqcm/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLogoLinkedin className="w-6 h-6 transition-colors hover:text-[#FD2E8A]" />
            </Link>
            <Link
              href="https://www.instagram.com/myqcm.aljazayr/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AiFillInstagram className="w-6 h-6 transition-colors hover:text-[#FD2E8A]" />
            </Link>
            <Link
              href="https://www.youtube.com/@MyQCMAljazayr"
              target="_blank"
              rel="noopener noreferrer"
              className="pb-1"
            >
              <FaYoutube className="w-6 h-6 transition-colors hover:text-[#FD2E8A]" />{" "}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;