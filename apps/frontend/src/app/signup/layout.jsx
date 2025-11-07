"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import doctors from "../../../public/ShapeDocters.svg";
import beta from "../../../public/auth/beta.svg";

const heroContentByRoute = {
  default: {
    title: "Commencez votre parcours médical",
    description:
      "Inscrivez-vous dès aujourd'hui pour entreprendre un parcours d'apprentissage personnalisé !",
    titleWidthClass: "w-[300px]",
    descriptionWidthClass: "w-[280px]",
  },
  setProfile: {
    title: "Personnalisons votre apprentissage",
    description:
      "Répondez à quelques questions rapides pour nous aider à adapter votre parcours d'éducation médicale.",
    titleWidthClass: "w-[320px]",
    descriptionWidthClass: "w-[300px]",
  },
  verification: {
    title: "Vérifiez votre adresse e-mail",
    description:
      "Entrez le code reçu afin de confirmer votre compte et accéder à l'expérience MyQCM.",
    titleWidthClass: "w-[320px]",
    descriptionWidthClass: "w-[320px]",
  },
};

const resolveHeroContent = (pathname) => {
  if (!pathname) return heroContentByRoute.default;
  if (pathname.startsWith("/signup/set-profile")) {
    return heroContentByRoute.setProfile;
  }
  if (pathname.startsWith("/signup/verification")) {
    return heroContentByRoute.verification;
  }
  return heroContentByRoute.default;
};

const Layout = ({ children }) => {
  const pathname = usePathname();
  const { title, description, titleWidthClass, descriptionWidthClass } =
    resolveHeroContent(pathname);

  return (
    <section className="h-[100vh] w-[100vw] overflow-hidden flex bg-[#FB63A6] p-[26px] px-[40px] max-xl:flex-col max-xl:items-center max-md:px-[20px] max-md:overflow-y-auto scrollbar-hide">
      <div className="flex flex-col gap-4 self-end max-xl:mx-auto">
        <Image
          src={beta}
          alt="version bêta"
          className="w-[150px] ml-[74px] max-xl:mx-auto"
        />
        <h1
          className={`text-[#FFFFFF] text-[30px] font-semibold text-center leading-[36px] max-xl:w-[600px] max-md:w-[340px] ${titleWidthClass}`}
        >
          {title}
        </h1>
        <p
          className={`${descriptionWidthClass} mb-[14px] text-[#FFFFFFD6] text-center font-light text-[14px] max-xl:w-[560px] max-md:w-[340px]`}
        >
          {description}
        </p>
        <Image
          src={doctors}
          alt="Médecins"
          className="w-[620px] ml-[-40px] max-xl:hidden"
        />
      </div>
      {children}
    </section>
  );
};

export default Layout;
