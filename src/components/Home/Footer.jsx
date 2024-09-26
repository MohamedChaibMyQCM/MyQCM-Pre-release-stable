import Image from 'next/image';
import logo from '../../../public/whiteLogo.svg'
import { fouterLinks, socialMediaLogos } from '@/data/data';
import Link from 'next/link';
import Tahsin from "../../../public/TAHSIN Healthcare group 1.svg";

const Footer = () => {
  return (
    <footer className="flex flex-col bg-[#F8589F] py-[20px]">
      <div className="px-[100px] flex justify-between border-b-[2px] border-b-[#FFFFFF] pb-[50px]">
        <div className="flex flex-col gap-4">
          <Image src={logo} alt="logo" className="w-[130px]" />
          <p className="w-[410px] text-[#FFFFFF] text-[15px] font-TTInterphases font-medium">
            MyQCM est une plateforme d'apprentissage en ligne avancée, pilotée
            par l'IA, conçue pour révolutionner l'éducation médicale. Nous
            offrons un contenu personnalisé, des retours en temps réel et une
            gamification pour rendre l'apprentissage engageant et efficace.{" "}
          </p>
        </div>
        <div className="flex gap-20">
          {fouterLinks.map((item, index) => {
            return (
              <div className="" key={index}>
                <h3 className="text-[#FFFFFF] font-TTInterphases pb-2 font-medium text-[18px]">
                  {item.title}
                </h3>
                <ul className="flex flex-col gap-2">
                  {item.links.map((item, index) => {
                    return (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className="text-[#FFFFFF] font-TTInterphases text-[14px] font-medium"
                        >
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-[100px] flex justify-between pt-[30px]">
        <div className="flex items-center">
          <Image src={Tahsin} alt="tahsin olus logo" className="w-[120px]" />
          <span className="w-[2px] h-[46px] bg-[#FFFFFF] rounded-[4px]"></span>
          <span className="text-[#FFFFFF] font-TTInterphases font-medium pl-[10px] text-[15px]">
            ©2024 Tahsin healthcare group. Tous droits réservés.
          </span>
        </div>
        <div>
          <ul className="flex items-center gap-12">
            {socialMediaLogos.map((item, index) => {
              return (
                <li key={index}>
                  <Link href={item.href}>
                    <Image
                      src={item.src}
                      alt="logo"
                      className={`w-[${item.width}px]`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer