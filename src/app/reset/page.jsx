"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.png";
import arrow from "../../../public/Icons/arrow-left.svg";
import email from "../../../public/auth/email.svg";
import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CaretLeft } from "phosphor-react";

const Page = () => {
  const [Email, setEmail] = useState("");
  const router = useRouter();

  const { mutate: resetPassword } = useMutation({
    mutationFn: (data) =>
      BaseUrl.post("/auth/user/forgot-password/request", data),
    onSuccess: ({}) => {
      router.push(`/reset/verification`);
    },
    onError: (error) => {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message || "Échec de la réinitialisation";
      toast.error(message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    resetPassword({ email: Email });
  };

  return (
    <div className="bg-[#FFF] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6">
      <Image src={logo} alt="logo" className="w-[140px] mb-6" />
      <div className="flex items-center gap-1 self-start w-[567.09px] mx-auto max-md:pl-3">
        <Link href={`/login`} className="flex items-center gap-1">
          <CaretLeft size={16} className="text-[#F8589F]" />
          <span className="text-[15px] font-[500] text-[#F8589F]">Retour</span>
        </Link>
      </div>
      <div className=" w-[567.09px] mx-auto max-md:w-[90%]">
        <h2 className="text-[#191919] font-[500] text-[20px]">
          Mot de passe oublié ?
        </h2>
        <p className="text-[#666666] text-[13px] mt-2">
          Pour réinitialiser votre mot de passe, vous devez fournir l'e-mail
          associé à votre compte. Nous vous enverrons un code de vérification à
          cette adresse.
        </p>
      </div>
      <form className="w-[567.09px] flex flex-col items-center gap-4 max-md:w-[90%]">
        <div className="w-full flex flex-col gap-2 mb-4">
          <label
            htmlFor="email"
            className="text-[#191919] text-[15px] font-medium"
          >
            E-mail
          </label>
          <div className="bg-[#FFF] w-full flex items-center gap-4 px-[16px] py-[12px] rounded-[12px] border border-[#E4E4E4]">
            <Image src={email} alt="Icône email" />
            <input
              type="email"
              id="email"
              placeholder="Entrez votre e-mail"
              className="text-[#666666] text-[14px] bg-transparent outline-none w-full"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[12px] font-medium"
          onClick={handleSubmit}
        >
          Réinitialiser le mot de passe
        </button>
      </form>
    </div>
  );
};

export default Page;
