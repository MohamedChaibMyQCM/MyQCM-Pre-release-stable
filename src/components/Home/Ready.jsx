import { logos } from "@/data/data";
import Image from "next/image";
import Link from "next/link";
import patern from "../../../public/Patern.svg";
import { useLocale } from "next-intl";

const Ready = () => {
  const locale = useLocale();

  return (
    <section className="relative bg-[#F8589F] px-[100px] pt-[60px] pb-[40px] text-center flex flex-col gap-4">
      <Image src={patern} alt="patern" className="absolute top-0 left-0" />
      <h2 className="font-Genty text-[59px] stroke text-[#FFFFFF] leading-[69px] z-50">
        Prêt à améliorer vos connaissances médicales <br /> et à faire
        progresser votre carrière
      </h2>
      <p className="font-TTInterphases font-medium text-[#FFFFFF] z-50 w-[1000px] mx-auto">
        Notre plateforme vous offre un accès à une éducation médicale de premier
        plan depuis le confort de votre domicile. Faites progresser votre
        carrière dès aujourd'hui en vous engageant avec des QCM et des tutoriels
        soigneusement conçus sur MyQCM Aljazayr.
      </p>
      <div className="flex items-center gap-6 justify-center mb-[40px] mt-[16px] z-50">
        <Link
          href={`${locale}/signup`}
          className="bg-[#FFFFFF] py-[8px] px-[40px] font-semibold rounded-[14px] text-[#F8589F] font-TTInterphases text-[14px] font-medium"
        >
          Commencez
        </Link>
        <Link
          href=""
          className="bg-[#FFFFFF] py-[8px] px-[40px] font-semibold rounded-[14px] text-[#F8589F] font-TTInterphases text-[14px] font-medium"
        >
          Contactez-nous
        </Link>
      </div>
      <ul className="flex items-center gap-8">
        {logos.map((item, index) => {
          return (
            <li key={index}>
              <Image src={item.src} alt="logo" />
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default Ready;
