"use client";

import Image from "next/image";
import logo from "../../../../../public/logoMyqcm.svg";
import lock from "../../../../../public/auth/password.svg";
import { useState } from "react";
import { useMutation } from "react-query";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CaretLeft } from "phosphor-react";

const Page = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  const { mutate: changePassword } = useMutation({
    mutationFn: (data) => BaseUrl.post("/user/forgot-password/reset", data),
    onSuccess: () => {
      router.push(`/login`);
      toast.success("Successfully reset password");
    },
    onError: (error) => {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message || "Change Password failed";
      toast.error(message);
    },
  });

  const validatePassword = (password) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setPasswordError(
        "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character"
      );
    } else {
      setPasswordError("");
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return; // Allow only numbers
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
    if (passwordError) {
      toast.error("Please correct the password errors");
      return;
    }
    const code = otp.join("");
    const data = { code, password };
    changePassword(data);
  };

  return (
    <div className="bg-[#FFF9F9] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6">
      <Image src={logo} alt="logo" className="w-[140px] mb-6" />
      <div className="flex items-center gap-1 self-start w-[567.09px] mx-auto">
        <Link href={`/login`} className="flex items-center gap-1">
          <CaretLeft size={16} className="text-[#F8589F]" />
          <span className="text-[15px] font-[500] text-[#F8589F]">Retour</span>
        </Link>
      </div>
      <div className=" w-[567.09px] mx-auto">
        <h2 className="text-[#191919] font-[500] text-[20px]">
          Code verification
        </h2>
        <p className="text-[#666666] text-[13px] mt-2">
          Please enter the code we sent to your email to verify your account
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
          className="bg-gradient-to-t from-[#FD2E8A] to-[#F8589F]  text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[12px] font-Inter font-medium mt-4"
        >
          Verify Account
        </button>
      </form>
    </div>
  );
};

export default Page;
