"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.svg";
import doctors from "../../../public/ShapeDocters.svg";
import Link from "next/link";
import { useState } from "react";
import SignUpStepTwo from "@/components/signup/SignUpStepTwo";
import SignUpStepOne from "@/components/signup/SignUpStepOne";

const Page = () => {
  const [step, setStep] = useState(1);
  const [user_name, setUserName] = useState("");
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

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

  const handleSubmitStep2 = (e) => {
    e.preventDefault();
    if (passwordError) {
      toast.error("Please correct the password errors");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
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
      <div className="bg-[#FFF] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6">
        <Image src={logo} alt="logo" className="w-[140px] mb-4" />
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
        {step === 1 ? (
          <SignUpStepOne
            setStep={setStep}
            setUserName={setUserName}
            user_name={user_name}
          />
        ) : (
          <SignUpStepTwo
            Email={Email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            passwordError={passwordError}
            validatePassword={validatePassword}
            handleSubmitStep2={handleSubmitStep2}
          />
        )}
      </div>
    </section>
  );
};

export default Page;
