"use client";

import Image from "next/image";
import logo from "../../../../../public/logoMyqcm.svg";
import lock from "../../../../../public/auth/password.svg";
import { useState } from "react";
import { useMutation } from "react-query";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CaretLeft, Eye, EyeSlash } from "phosphor-react";
import Link from "next/link";

const Page = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [code, setCode] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
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

  const validateConfirmPassword = (confirmPassword) => {
    if (confirmPassword !== newPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordError || confirmPasswordError) {
      toast.error("Please correct the password errors");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const data = { code, password: newPassword };
    changePassword(data);
  };

  return (
    <div className="bg-[#FFF] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6">
      <Image src={logo} alt="logo" className="w-[140px] mb-6" />
      <div className="flex items-center gap-1 self-start w-[567.09px] mx-auto">
        <Link href={`/login`} className="flex items-center gap-1">
          <CaretLeft size={16} className="text-[#F8589F]" />
          <span className="text-[15px] font-[500] text-[#F8589F]">Retour</span>
        </Link>
      </div>
      <div className=" w-[567.09px] mx-auto">
        <h2 className="text-[#191919] font-[500] text-[20px]">
          Reset Password
        </h2>
        <p className="text-[#666666] text-[13px] mt-2">
          Choose a strong password to keep your account secure. Make sure
          it&apos;s unique, hard to guess, and something you can remember
        </p>
      </div>
      <form
        className="w-[567.09px] flex flex-col items-center gap-6"
        onSubmit={handleSubmit}
      >
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="newPassword"
            className="text-[#191919] text-[15px] font-medium"
          >
            New Password
          </label>
          <div className="bg-[#FFF] w-full flex items-center gap-4 px-[16px] py-[14px] rounded-[12px] border border-[#E4E4E4]">
            <Image src={lock} alt="password icon" />
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="text-[#666666] hover:text-[#FD2E8A] transition-colors"
            >
              {showNewPassword ? (
                <EyeSlash size={20} className="text-[#B5BEC6]" />
              ) : (
                <Eye size={20} className="text-[#B5BEC6]" />
              )}{" "}
            </button>
          </div>
          {passwordError && (
            <p className="text-red-500 text-[12px]">{passwordError}</p>
          )}
        </div>
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="confirmPassword"
            className="text-[#191919] text-[15px] font-medium"
          >
            Confirm New Password
          </label>
          <div className="bg-[#FFF] w-full flex items-center gap-4 px-[16px] py-[14px] rounded-[12px] border border-[#E4E4E4]">
            <Image src={lock} alt="password icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                validateConfirmPassword(e.target.value);
              }}
              className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-[#666666] hover:text-[#FD2E8A] transition-colors"
            >
              {showConfirmPassword ? (
                <EyeSlash size={20} className="text-[#B5BEC6]" />
              ) : (
                <Eye size={20} className="text-[#B5BEC6]" />
              )}{" "}
            </button>
          </div>
          {confirmPasswordError && (
            <p className="text-red-500 text-[12px]">{confirmPasswordError}</p>
          )}
        </div>
        <button
          type="submit"
          className="bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[12px] font-medium mt-4"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default Page;