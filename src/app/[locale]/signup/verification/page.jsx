"use client";

import { useState } from "react";
import Image from "next/image";
import logo from "../../../../../public/Icons/logo Myqcm 1.svg";
import Verification from "../../../../../public/Icons/verification.svg";
import BaseUrl from "@/components/BaseUrl";
import { useMutation, useQuery } from "react-query";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import VerifyAuth from "@/components/auth/AuthEmail";

const EmailVerification = () => {
  const [code, setCode] = useState("");
  const locale = useLocale();
  const router = useRouter();

  const { mutate: verifyCode } = useMutation({
    mutationFn: (data) => BaseUrl.post("/user/verify-email", data),
    onSuccess: () => {
      router.push(`/${locale}/signup/setProfile`);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Verification failed");
    },
  });

  const { data: name } = useQuery({
    queryFn: async () => {
      const response = await BaseUrl.get("/user/fullname");
      return response.data.data;
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { code };
    verifyCode(data)
  };

  return (
    <div className="bg-[#FFF9F9] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-center mr-[60px]">
        <Image src={logo} alt="logo" />
        <Image
          src={Verification}
          alt="verification"
          className="ml-[20px] mb-[12px]"
        />
      </div>
      <h3 className="text-[#141718] font-semibold text-[19px]">
        Vérification de l&apos;email
      </h3>
      <p className="text-center text-[#B6ACB399] text-[14px] w-[420px] leading-[26px]">
        Cher Docteur {name}, <br /> Veuillez vérifier votre boîte de réception
        (et le dossier spam) et entrer le code pour activer votre compte MyQCM.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-1 items-center mt-[16px]"
      >
        <input
          type="text"
          className="bg-[#B6ACB399] text-[14px] w-[420px] outline-none font-medium placeholder:text-[#FFFFFF] px-[20px] py-[8px] text-[#FFFFFF] rounded-[12px]"
          placeholder="Enter the code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          minLength={6}
          maxLength={6}
        />
        <button
          type="submit"
          className="bg-[#F8589F] w-24 text-[12px] text-white font-medium text-[16px] py-[6px] px-[14px] rounded-[8px] mt-4"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default VerifyAuth(EmailVerification);