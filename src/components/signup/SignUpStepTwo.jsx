"use client";

// Original Imports from user's code block
import Image from "next/image";
import email from "../../../public/auth/email.svg"; // Ensure path is correct
import pass from "../../../public/auth/password.svg"; // Ensure path is correct
import { CaretLeft, Eye, EyeSlash } from "phosphor-react";

// Original component signature - ADD isLoading prop
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
  validatePassword, // Accept the validation function
  handleSubmitStep2, // The final submit handler from parent
  setStep, // This prop now receives the changeStep function from the parent
  isLoading, // <<< Accept isLoading prop >>>
}) => {
  // Original Return JSX Structure
  return (
    // NOTE: Original code returned a fragment <>...</>. Wrap in a div if Framer Motion needs a single child node.
    // Using a div here for clarity, but a Fragment is fine if Framer Motion handles it correctly.
    <div className="w-full flex flex-col items-center">
      {" "}
      {/* Add wrapper div */}
      <div className="flex items-center gap-1 pl-4 self-start w-[567.09px] mx-auto mt-3 mb-4 max-md:w-full max-md:pl-1">
        {" "}
        {/* Adjust width/padding for responsiveness */}
        <button
          type="button"
          onClick={() => setStep(1)} // Call the function passed via props
          className="flex items-center gap-1 group text-[#F8589F] hover:text-[#E02174] transition-colors p-1" // Add hover styles
          aria-label="Retour à l'étape précédente"
        >
          <CaretLeft size={16} />
          <span className="text-[14px] font-[500]">Retour</span>
        </button>
      </div>
      <form
        className="w-[567.09px] flex flex-col items-center gap-4 max-md:w-[90%]"
        onSubmit={handleSubmitStep2} // Use the final submit handler passed from parent
        noValidate
      >
        {/* Email Input */}
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="email-signup" // Ensure ID is unique if multiple forms present
            className="text-[#191919] text-[15px] font-medium"
          >
            Email
          </label>
          <div className="bg-[#FFF] w-full flex items-center gap-4 px-[16px] py-[12px] rounded-[12px] border border-[#E4E4E4] focus-within:border-[#FD2E8A] transition-colors">
            <Image src={email} alt="" width={20} height={20} />{" "}
            {/* Alt text optional */}
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

        {/* Password Input */}
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="password-signup" // Ensure ID is unique
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
              onChange={(e) => {
                const newValue = e.target.value;
                setPassword(newValue);
                // Call validation function passed from parent
                if (validatePassword) {
                  validatePassword(newValue);
                }
              }}
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

        {/* Confirm Password Input */}
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

        {/* Password Error Message */}
        {passwordError && (
          <p
            id="password-error-msg"
            className="text-red-500 text-[12px] self-start"
          >
            {passwordError}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading} // <<< Use isLoading prop >>>
          className="bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[12px] font-medium mt-4 hover:opacity-95 transition-opacity duration-150 disabled:opacity-60" // Add disabled style
        >
          {/* <<< Show loading text based on isLoading prop >>> */}
          {isLoading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>
    </div>
  );
};

export default SignUpStepTwo;
