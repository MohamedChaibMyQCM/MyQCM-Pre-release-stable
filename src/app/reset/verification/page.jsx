"use client";

import Image from "next/image";
import logo from "../../../../public/logoMyqcm.png";
import Link from "next/link";
import { CaretLeft } from "phosphor-react";

const Page = () => {
  const name = "Docteur"; 

  return (
    <div className="bg-[#FFF] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6">
      <Image src={logo} alt="logo" className="w-[140px] mb-6" />

      <div className="flex items-center gap-1 self-start w-[567.09px] mx-auto max-md:pl-3">
        <Link href={`/login`} className="flex items-center gap-1">
          <CaretLeft size={16} className="text-[#F8589F]" />
          <span className="text-[15px] font-[500] text-[#F8589F]">Retour</span>
        </Link>
      </div>

      <div className="w-[567.09px] mx-auto max-md:w-[90%] text-center">
        <h2 className="text-[#191919] font-[500] text-[20px] mb-4">
          Vérification requise
        </h2>

        <div className="bg-[#FFF5FA] p-6 rounded-[16px] border border-[#FD2E8A33]">
          <p className="text-[#191919] text-[15px]">
            Cher(e) {name}, veuillez vérifier votre boîte de réception (et le
            dossier spam) pour le lien d'activation de votre compte MyQCM.
          </p>

          <p className="text-[#666666] text-[13px] mt-4">
            Si vous n'avez pas reçu l'email, vérifiez votre adresse ou contactez
            notre support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
