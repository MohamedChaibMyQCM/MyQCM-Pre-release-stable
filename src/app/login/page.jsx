"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.svg";
import Link from "next/link";
import email from "../../../public/Icons/email.svg";
import lock from "../../../public/Icons/lock.svg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "react-query";
import BaseUrl from "@/components/BaseUrl";
import secureLocalStorage from "react-secure-storage";
import toast from "react-hot-toast";
import GoogleAuthButton from "../comp/google-auth.button";

const Page = () => {
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const { mutate: login } = useMutation({
    mutationFn: (data) => BaseUrl.post("/user/signin", data),
    onSuccess: ({ data }) => {
      secureLocalStorage.setItem("token", data.token);
      router.push(`/dashboard`);
    },
    onError: (error) => {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message || "SignIn failed";

      toast.error(message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    let data = { email: Email, password };
    login(data);
  };

  return (
    <div className="bg-[#FFF9F9] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6">
      <Image src={logo} alt="logo" />
      <div className="flex items-center justify-between bg-[#F7F3F6] w-[567.09px] p-[5px] rounded-[10px] max-md:w-[90%]">
        <Link
          href={`/login`}
          className="py-[8px] bg-[#FEFEFE] box text-[#232627] font-semibold text-[14px] font-Inter flex items-center justify-center basis-1/2 rounded-[10px]"
        >
          Se connecter
        </Link>
        <Link
          href={`/signup`}
          className="py-[8px] text-[#6C7275] font-semibold font-Inter text-[14px] basis-1/2 flex items-center justify-center"
        >
          Créer un compte
        </Link>
      </div>
      <div className="w-[567.09px] flex items-center justify-center bg-transparent max-md:w-[90%]">
        <GoogleAuthButton />
      </div>
      <span className="relative w-[567.09px] my-2 flex items-center justify-center text-[#6C727580] font-Inter text-[13px] after:bg-[#6C727580] after:absolute after:w-[250px] after:max-md:w-[120px] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[250px] before:max-md:w-[120px] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%] max-md:w-[90%]">
        OR
      </span>
      <form
        className="w-[567.09px] flex flex-col items-center gap-4 max-md:w-[90%]"
        onSubmit={handleSubmit}
      >
        <div className="bg-[#FFE7F2] w-full flex items-center gap-4 px-[16px] py-[14px] rounded-[10px]">
          <Image src={email} alt="Email icon" />
          <input
            type="email"
            placeholder="Email"
            className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="bg-[#FFE7F2] w-full flex items-center gap-4 px-[16px] py-[14px] rounded-[10px]">
          <Image src={lock} alt="Lock icon" />
          <input
            type="password"
            placeholder="Mot de passe"
            className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Link
          href={`/login/reset`}
          className="text-[#F8589F] font-Inter self-start text-[14px] font-medium mb-2"
        >
          Mot de passe oublié ?
        </Link>
        <button
          type="submit"
          className="bg-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[10px] font-Inter font-medium"
        >
          Se connecter avec MyQcm Aljazayr
        </button>
      </form>
    </div>
  );
};

export default Page;
