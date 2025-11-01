"use client";

import Image from "next/image";
import { motion } from "framer-motion";
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
  isLoading,
}) => {
  const handlePasswordChange = (newValue) => {
    setPassword(newValue);

    if (!newValue) {
      validatePassword(newValue);
      return;
    }

    const hasRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(
      newValue
    );

    if (hasRequirements) {
      validatePassword("ValidPasswordWithRequirements123");
    } else {
      validatePassword(newValue);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center gap-1 self-start w-[567.09px] mx-auto mt-3 mb-4 max-md:w-full">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-[2px] group text-[#F8589F] hover:text-[#E02174] transition-colors"
          aria-label="Retour à l'étape précédente"
        >
          <CaretLeft size={13} />
          <span className="text-[14px] font-[500]">Retour</span>
        </button>
      </div>
      <form
        className="w-[567.09px] flex flex-col items-center gap-4 max-md:w-full"
        onSubmit={handleSubmitStep2}
        noValidate
      >
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="email-signup"
            className="text-[#191919] text-[15px] font-medium"
          >
            Email
          </label>
          <div className="bg-[#FFF] w-full flex items-center gap-4 px-[16px] py-[12px] rounded-[12px] border border-[#E4E4E4] focus-within:border-[#FD2E8A] transition-colors">
            <Image src={email} alt="" width={20} height={20} />
            <input
              type="email"
              id="email-signup"
              placeholder="Entrez votre email"
              className="text-[#666666] text-[14px] bg-transparent outline-none w-full"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
            />
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="password-signup"
            className="text-[#191919] text-[15px] font-medium"
          >
            Mot de passe
          </label>
          <div className="bg-[#FFF] w-full flex items-center gap-4 px-[16px] py-[12px] rounded-[12px] border border-[#E4E4E4] focus-within:border-[#FD2E8A] transition-colors">
            <Image src={pass} alt="" width={20} height={20} />
            <input
              type={showPassword ? "text" : "password"}
              id="password-signup"
              placeholder="Entrez votre mot de passe"
              className="text-[#666666] text-[14px] bg-transparent outline-none w-full"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              aria-required="true"
              aria-describedby={
                passwordError ? "password-error-msg" : undefined
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#B5BEC6] hover:text-[#FD2E8A] transition-colors"
              aria-label={
                showPassword
                  ? "Cacher le mot de passe"
                  : "Afficher le mot de passe"
              }
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
          <div className="bg-[#FFF] w-full flex items-center gap-4 px-[16px] py-[12px] rounded-[12px] border border-[#E4E4E4] focus-within:border-[#FD2E8A] transition-colors">
            <Image src={pass} alt="" width={20} height={20} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm_password"
              placeholder="Confirmez votre mot de passe"
              className="text-[#666666] text-[14px] bg-transparent outline-none w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-required="true"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-[#B5BEC6] hover:text-[#FD2E8A] transition-colors"
              aria-label={
                showConfirmPassword
                  ? "Cacher la confirmation"
                  : "Afficher la confirmation"
              }
            >
              {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {passwordError && (
          <p
            id="password-error-msg"
            className="text-red-500 text-[12px] self-start"
          >
            {passwordError}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[12px] font-medium mt-4 hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <span>Inscription en cours...</span>
            </>
          ) : (
            "S'inscrire"
          )}
        </button>
      </form>
    </div>
  );
};

export default SignUpStepTwo;