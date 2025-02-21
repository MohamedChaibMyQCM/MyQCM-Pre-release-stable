"use client";

import Image from "next/image";
import logo from "../../../../../public/logoMyqcm.svg";
import lock from "../../../../../public/Icons/lock.svg";
import { useState } from "react";
import { useMutation } from "react-query";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Page = () => {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [code, setCode] = useState("");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordError) {
      toast.error("Please correct the password errors");
      return;
    }
    const data = { code, password };
    changePassword(data);
  };

  return (
    <div className="bg-[#FFF9F9] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6">
      <Image src={logo} alt="logo" />
      <div className="flex items-center gap-4 self-start w-[567.09px] mx-auto">
        <span className="font-Inter text-[20px] font-semibold text-[#141718]">
          Reset your password
        </span>
      </div>
      <form
        className="w-[567.09px] flex flex-col items-center gap-4"
        onSubmit={handleSubmit}
      >
        <div className="bg-[#FFE7F2] w-full flex items-center gap-4 px-[16px] py-[14px] rounded-[10px]">
          <Image src={lock} alt="Lock icon" />
          <input
            type="text"
            placeholder="The Token"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
          />
        </div>
        <div className="bg-[#FFE7F2] w-full flex flex-col gap-2 px-[16px] py-[14px] rounded-[10px]">
          <div className="flex items-center gap-4">
            <Image src={lock} alt="Lock icon" />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
            />
          </div>
        </div>
        {passwordError && (
          <p className="text-red-500 text-[12px]">{passwordError}</p>
        )}
        <button
          type="submit"
          className="bg-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[10px] font-Inter font-medium"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default Page;