import wait_top from "../../../public/waitlist/wait-top.svg";
import wait_bottom from "../../../public/waitlist/wait-bottom.svg";
import wait_box from "../../../public/waitlist/wait-box.svg";
import twitter from "../../../public/waitlist/twitter.svg";
import linkedin from "../../../public/waitlist/linkedin.svg";
import insta from "../../../public/waitlist/insta.svg";
import tiktok from "../../../public/waitlist/tiktok.svg";
import Image from "next/image";
import Link from "next/link";

const Page = () => {
  return (
    <div className="bg-[#F7F8FA] w-screen min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Décorations */}
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

      {/* Contenu principal */}
      <div className="bg-white rounded-[16px] p-6 w-full max-w-[600px] relative z-10">
        <Image src={wait_box} alt="Illustration" className="w-full" />

        <div className="text-center mt-4">
          <h3 className="text-[#191919] font-medium text-xl mb-3">
            Bienvenue sur la liste d'attente MyQCM Beta !
          </h3>

          <p className="text-[13px] text-black mb-4">
            Merci pour votre inscription ! Vous êtes maintenant sur la liste
            d'attente MyQCM Beta. Nous vous enverrons un email dès que votre
            accès sera approuvé.
          </p>

          <Link
            href=""
            className="text-[#F8589F] font-medium text-sm mb-3 inline-block"
          >
            Nous contacter
          </Link>

          <div className="flex justify-center gap-4">
            {[twitter, linkedin, insta, tiktok].map((icon, index) => (
              <Image
                key={index}
                src={icon}
                alt="Réseau social"
                className="w-4 h-4"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
