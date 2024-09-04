"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import user from "../../../../public/Icons/user.svg";
import email from "../../../../public/Icons/email.svg";
import lock from "../../../../public/Icons/lock.svg";
import { GoogleLoginButton } from "react-social-login-buttons";
import { LoginSocialGoogle } from "reactjs-social-login";
import logo from "../../../../public/logoMyqcm.svg";
import { useState } from "react";
import { useMutation } from "react-query";
import { useRouter } from "next/navigation";
import BaseUrl from "@/components/BaseUrl";
import handleError from "@/components/handleError";
import secureLocalStorage from "react-secure-storage";

const Page = () => {
  const [user_name, setUserName] = useState("");
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const locale = useLocale();
  const router = useRouter();

  const { mutate: checkEmail } = useMutation({
    mutationFn: (data) => BaseUrl.post("/user/confirm-email", data),
    onSuccess: () => {
      console.log("Email Sent Successfully");
    },
    onError: (error) => {
      handleError(error);
    },
  });

  const { mutate: signup } = useMutation({
    mutationFn: (data) => BaseUrl.post("/user/signup", data),
    onSuccess: ({ data }) => {
      secureLocalStorage.setItem("token", data.token);
      checkEmail({ email: Email });
      window.location.href = `/${locale}/signup/verification`;
    },
    onError: (error) => {
      handleError(error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    let data = { full_name: user_name, email: Email, password };
    signup(data);
  };

  return (
    <div className="bg-[#FFF9F9] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6">
      <Image src={logo} alt="logo" />
      <div className="flex items-center justify-between bg-[#F7F3F6] w-[567.09px] p-[5px] rounded-[10px]">
        <Link
          href={`/${locale}/login`}
          className="py-[8px] text-[#6C7275] font-semibold font-Inter text-[14px] basis-1/2 flex items-center justify-center"
        >
          Sign in
        </Link>
        <Link
          href={`/${locale}/signup`}
          className="py-[8px] bg-[#FEFEFE] box text-[#232627] font-semibold text-[14px] font-Inter flex items-center justify-center basis-1/2 rounded-[10px]"
        >
          Create account
        </Link>
      </div>
      <div className="w-[567.09px] flex items-center justify-center bg-transparent">
        <LoginSocialGoogle
          className="w-[100%] flex items-center justify-center font-Inter font-semibold text-[15px] social"
          client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
          onResolve={({ provider, data }) => {
            console.log(provider, data);
          }}
          onReject={(err) => {
            console.log(err);
          }}
        >
          <GoogleLoginButton />
          <span>Continue With Google</span>
        </LoginSocialGoogle>
      </div>
      <span className="relative w-[567.09px] my-2 flex items-center justify-center text-[#6C727580] font-Inter text-[13px] after:bg-[#6C727580] after:absolute after:w-[250px] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[250px] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%]">
        OR
      </span>
      <form
        className="w-[567.09px] flex flex-col items-center gap-4"
        onSubmit={handleSubmit}
      >
        <div className="bg-[#FFE7F2] flex items-center gap-4 w-full px-[16px] py-[14px] rounded-[10px]">
          <Image src={user} alt="user icon" />
          <input
            type="text"
            placeholder="Full name"
            className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
            value={user_name}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="bg-[#FFE7F2] w-full flex items-center gap-4 px-[16px] py-[14px] rounded-[10px]">
          <Image src={email} alt="email icon" />
          <input
            type="email"
            placeholder="Email"
            className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="bg-[#FFE7F2] w-full flex items-center gap-4 px-[16px] py-[14px] rounded-[10px]">
          <Image src={lock} alt="lock icon" />
          <input
            type="password"
            placeholder="Password"
            className="text-[#6C727580] text-[14px] font-Inter bg-transparent outline-none w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[10px] font-Inter font-medium"
        >
          Sign Up with MyQcm Aljazayr
        </button>
      </form>
      <span className="text-[#6C7275] font-Inter text-[13px]">
        By creating an account, you agree to our
        <span className="text-[#F8589F] font-semibold">
          {" "}
          Terms of Service{" "}
        </span>{" "}
        and
        <span className="text-[#F8589F] font-semibold">
          {" "}
          Privacy & Cookie Statement
        </span>
        .
      </span>
    </div>
  );
};

export default Page;
