"use client";

import Image from "next/image";
import email from "../../../public/auth/email.svg";
import pass from "../../../public/auth/password.svg";
import { CaretLeft, Eye, EyeSlash } from "phosphor-react";

const SignUpStepTwo = ({
  Email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordError,
  validatePassword,
  handleSubmitStep2,
  setStep,
}) => {
  return (
    <>
      <div className="flex items-center gap-1 pl-4 self-start w-[567.09px] mx-auto mt-3 mb-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-1"
        >
          <CaretLeft size={16} className="text-[#F8589F]" />
          <span className="text-[14px] font-[500] text-[#F8589F]">Retour</span>
        </button>
      </div>
      <form
        className="w-[567.09px] flex flex-col items-center gap-4 max-md:w-[90%]"
        onSubmit={handleSubmitStep2}
      >
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-[#191919] text-[15px] font-medium"
          >
            Email
          </label>
          <div className="bg-[#FFF] w-full flex items-center gap-4 px-[16px] py-[12px] rounded-[12px] border border-[#E4E4E4]">
            <Image src={email} alt="Icône email" />
            <input
              type="email"
              id="email"
              placeholder="Entrez votre email"
              className="text-[#666666] text-[14px] bg-transparent outline-none w-full"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            <Image src={pass} alt="Icône mot de passe" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Entrez votre mot de passe"
              className="text-[#666666] text-[14px] bg-transparent outline-none w-full"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              required
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
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="confirm_password"
            className="text-[#191919] text-[15px] font-medium"
          >
            Confirmer le mot de passe
          </label>
          <div className="bg-[#FFF] w-full flex items-center gap-4 px-[16px] py-[12px] rounded-[12px] border border-[#E4E4E4]">
            <Image src={pass} alt="Icône mot de passe" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm_password"
              placeholder="Confirmez votre mot de passe"
              className="text-[#666666] text-[14px] bg-transparent outline-none w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-[#B5BEC6] hover:text-[#FD2E8A] transition-colors"
            >
              {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        {passwordError && (
          <p className="text-red-500 text-[12px] self-start">{passwordError}</p>
        )}
        <button
          type="submit"
          className="bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[12px] font-medium mt-4"
        >
          S&apos;inscrire
        </button>
      </form>
    </>
  );
};

export default SignUpStepTwo;
