"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.png";
import Link from "next/link";
import emailIcon from "../../../public/auth/email.svg";
import passIcon from "../../../public/auth/password.svg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import toast from "react-hot-toast";
import GoogleAuthButton from "../comp/google-auth.button";
import { Eye, EyeSlash } from "phosphor-react";
import BaseUrl from "@/components/BaseUrl";

const Page = () => {
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { mutate: login } = useMutation({
    mutationFn: (data) =>
      BaseUrl.post("/auth/user/signin", data, {
        headers: {
          "Content-Type": "application/json",
        },
      }),
    onSuccess: ({ data }) => {
      secureLocalStorage.setItem("token", data.token);
      router.push(`/dashboard`);
    },
    onError: (error) => {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message || "Échec de la connexion";
      toast.error(message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { email: Email, password };
    login(data);
  };

  return (
    <div className="bg-[#FFFFFF] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6 max-xl:py-6 overflow-y-auto scrollbar-hide">
      <Image src={logo} alt="logo" className="w-[140px] mb-4" />
      <div className="flex items-center justify-between bg-[#F7F3F6] w-[567.09px] p-[5px] rounded-[10px] max-md:w-[90%]">
        <Link
          href={`/login`}
          className="py-[8px] bg-[#FFFFFF] text-[#191919] font-semibold text-[14px] flex items-center justify-center basis-1/2 rounded-[10px]"
        >
          Se connecter
        </Link>
        <Link
          href={`/signup`}
          className="py-[8px] text-[#666666] font-semibold text-[14px] basis-1/2 flex items-center justify-center"
        >
          Créer un compte
        </Link>
      </div>
      {/* <div className="w-[567.09px] flex items-center justify-center bg-transparent max-md:w-[90%]">
        <GoogleAuthButton />
      </div> */}
      <span className="relative w-[567.09px] my-2 flex items-center justify-center text-[#6C727580] text-[13px] after:bg-[#6C727580] after:absolute after:w-[260px]  after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[260px]  before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%] max-md:w-[90%] after:max-md:w-[42%] before:max-md:w-[42%]">
        OU
      </span>
      <form
        className="w-[567.09px] flex flex-col items-center gap-4 max-md:w-[90%]"
        onSubmit={handleSubmit}
      >
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-[#191919] text-[15px] font-medium"
          >
            Email
          </label>
          <div className="bg-[#FFF] w-full flex items-center gap-4 px-[16px] py-[12px] rounded-[12px] border border-[#E4E4E4]">
            <Image src={emailIcon} alt="Icône email" />
            <input
              type="email"
              id="email"
              placeholder="Entrez votre email"
              className="text-[#666666] text-[14px] bg-transparent outline-none w-full"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-[#191919] text-[15px] font-medium"
          >
            Mot de passe
          </label>
          <div className="bg-[#FFF] w-full flex items-center gap-4 px-[16px] py-[12px] rounded-[12px] border border-[#E4E4E4]">
            <Image src={passIcon} alt="Icône mot de passe" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Entrez votre mot de passe"
              className="text-[#666666] text-[14px] bg-transparent outline-none w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#B5BEC6] hover:text-[#FD2E8A] transition-colors"
            >
              {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <Link
          href={`/reset`}
          className="text-[#FD2E8A] self-start text-[14px] font-medium mb-2"
        >
          Mot de passe oublié ?
        </Link>
        <button
          type="submit"
          className="bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[12px] font-medium"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
};

export default Page;
