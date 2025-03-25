"use client";

import { useState } from "react";
import Image from "next/image";
import logo from "../../../../public/logoMyqcm.svg";
import BaseUrl from "@/components/BaseUrl";
import { useMutation, useQuery } from "react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { CaretLeft } from "phosphor-react";

const EmailVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill("")); // OTP input fields
  const router = useRouter();

  const { mutate: verifyCode } = useMutation({
    mutationFn: (data) => BaseUrl.post("/user/verify-email", data),
    onSuccess: () => {
      router.push(`/signup/setProfile`);
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

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    const data = { code };
    verifyCode(data);
  };

  return (
    <div className="bg-[#FFF] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6">
      <Image src={logo} alt="logo" className="w-[140px] mb-6" />
      <div className="flex items-center gap-1 self-start w-[567.09px] mx-auto">
        <Link href={`/signup`} className="flex items-center gap-1">
          <CaretLeft size={16} className="text-[#F8589F]" />
          <span className="text-[15px] font-[500] text-[#F8589F]">Retour</span>
        </Link>
      </div>
      <div className="w-[567.09px] mx-auto">
        <h2 className="text-[#191919] font-[500] text-[20px]">
          Vérification de l&apos;email
        </h2>
        <p className="text-[#666666] text-[13px] mt-2">
          Cher Docteur {name}, Veuillez vérifier votre boîte de réception
          (et le dossier spam) et entrer le code pour activer votre compte
          MyQCM.
        </p>
      </div>
      <form
        className="w-[567.09px] flex flex-col items-center gap-4"
        onSubmit={handleSubmit}
      >
        <div className="w-full flex items-center justify-center gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e.target, index)}
              onFocus={(e) => e.target.select()}
              className="w-20 h-20 text-center text-[20px] text-[#191919] bg-[#FFF5FA] border border-[#FD2E8A] rounded-[10px] focus:outline-none focus:border-[#F8589F]"
            />
          ))}
        </div>
        <button
          type="submit"
          className="bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[12px] font-medium mt-4"
        >
          Vérifier
        </button>
      </form>
    </div>
  );
};

export default EmailVerification;
