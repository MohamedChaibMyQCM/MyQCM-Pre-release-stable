"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation } from "react-query";
import BaseUrl from "@/components/BaseUrl";
import secureLocalStorage from "react-secure-storage";
import toast from "react-hot-toast";
import user from "../../../public/Icons/user.svg";
import email from "../../../public/auth/email.svg";
import pass from "../../../public/auth/password.svg";
import logo from "../../../public/logoMyqcm.svg";
import doctors from "../../../public/ShapeDocters.svg";
import GoogleAuthButton from "../comp/google-auth.button";

const Page = () => {
  const [user_name, setUserName] = useState("");
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { mutate: signup } = useMutation({
    mutationFn: (data) => BaseUrl.post("/user/signup", data),
    onSuccess: ({ data }) => {
      secureLocalStorage.setItem("token", data.token);
      window.location.href = `/signup/verification`;
    },
    onError: (error) => {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message || "SignUp failed";
        
      toast.error(message);
    },
  });

  const validatePassword = (password) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setPasswordError(
        "Password must be +8 characters with uppercase, lowercase, number, and special character"
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
    let data = { full_name: user_name, email: Email, password };
    console.log(data);
    signup(data);
  };

  return (
    <section className="h-[100vh] w-[100vw] overflow-hidden flex bg-[#FB63A6] p-[26px] px-[40px] max-md:px-[20px]">
      <div className="flex flex-col gap-4 self-end max-md:hidden">
        <h1 className="text-[#FFFFFF] text-[30px] font-semibold w-[300px] leading-[36px]">
          Commencez votre parcours médical
        </h1>
        <p className="w-[280px] mb-[14px] text-[#FFFFFFD6] font-light text-[14px]">
          Inscrivez-vous aujourd&apos;hui pour un apprentissage personnalisé
          dans votre domaine passion !
        </p>
        <Image src={doctors} alt="doctors" className="w-[620px] ml-[-40px]" />
      </div>
      <div className="bg-[#FFF9F9] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6">
        <Image src={logo} alt="logo" />
        <div className="flex items-center justify-between bg-[#F7F3F6] w-[567.09px] p-[5px] rounded-[10px] max-md:w-[90%]">
          <Link
            href={`/login`}
            className="py-[8px] text-[#666666] font-semibold text-[14px] basis-1/2 flex items-center justify-center"
          >
            Se connecter
          </Link>
          <Link
            href={`/signup`}
            className="py-[8px] bg-[#FFFFFF] box text-[#191919] font-semibold text-[14px] flex items-center justify-center basis-1/2 rounded-[10px]"
          >
            Créer un compte
          </Link>
        </div>
        <div className="w-[567.09px] flex items-center justify-center bg-transparent max-md:w-[90%]">
          <GoogleAuthButton />
        </div>
        <span className="relative w-[567.09px] my-2 flex items-center justify-center text-[#6C727580] text-[13px] after:bg-[#6C727580] after:absolute after:w-[250px] after:max-md:w-[120px] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[250px] before:max-md:w-[120px] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%] max-md:w-[90%]">
          OU
        </span>
        <form
          className="w-[567.09px] flex flex-col items-center gap-4  max-md:w-[90%]"
          onSubmit={handleSubmit}
        >
          <div className="bg-[#FFE7F2] flex items-center gap-4 w-full px-[16px] py-[14px] rounded-[10px]">
            <Image src={user} alt="user icon" />
            <input
              type="text"
              placeholder="Nom complet"
              className="text-[#6C727580] text-[14px] bg-transparent outline-none w-full"
              value={user_name}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="bg-[#FFE7F2] w-full flex items-center gap-4 px-[16px] py-[14px] rounded-[10px]">
            <Image src={email} alt="email icon" />
            <input
              type="email"
              placeholder="Email"
              className="text-[#6C727580] text-[14px] bg-transparent outline-none w-full"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="bg-[#FFE7F2] w-full flex flex-col gap-2 px-[16px] py-[14px] rounded-[10px]">
            <div className="flex items-center gap-4">
              <Image src={password} alt="lock icon" />
              <input
                type="password"
                placeholder="Mot de passe"
                className="text-[#6C727580] text-[14px] bg-transparent outline-none w-full"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
              />
            </div>
          </div>
          {passwordError && (
            <p className="text-red-500 text-[12px]">{passwordError}</p>
          )}
          <button
            type="submit"
            className="bg-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[10px] font-medium"
          >
            Connexion avec MyQcm Aljazayr
          </button>
        </form>
        <span className="text-[#6C7275] text-[13px] w-[567.09px] text-center  max-md:w-[90%]">
          En créant un compte, vous acceptez nos
          <a href="" className="text-[#F8589F] font-semibold">
            {" "}
            Conditions d&apos;utilisation
          </a>{" "}
          et Déclaration de
          <a href="" className="text-[#F8589F] font-semibold">
            {" "}
            confidentialité{" "}
          </a>
          et de{" "}
          <a href="" className="text-[#F8589F] font-semibold">
            cookies
          </a>
          .
        </span>
      </div>
    </section>
  );
};

export default Page;
