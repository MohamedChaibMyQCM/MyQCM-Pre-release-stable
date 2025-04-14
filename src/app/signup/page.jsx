"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.png";
import doctors from "../../../public/ShapeDocters.svg";
import beta from "../../../public/auth/beta.svg";
import Link from "next/link";
import { useState } from "react";
import SignUpStepOne from "@/components/signup/SignUpStepOne"; // Adjust path if needed
import SignUpStepTwo from "@/components/signup/SignUpStepTwo"; // Adjust path if needed
import { useMutation } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl"; // Adjust path if needed
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import secureLocalStorage from "react-secure-storage";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion

const Page = () => {
  const [step, setStep] = useState(1);
  const [user_name, setUserName] = useState("");
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [direction, setDirection] = useState(0); // State for animation direction
  const router = useRouter();

  // --- Original Mutation Hook ---
  const { mutate: signup, isLoading } = useMutation({
    // Keep isLoading
    mutationFn: (data) => BaseUrl.post("/auth/user/signup", data),
    onSuccess: ({ data }) => {
      console.log(data);
      secureLocalStorage.setItem("token", data.token);
      toast.success("Compte créé avec succès !");
      router.push("/signup/verification");
    },
    onError: (error) => {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message || "Échec de l'inscription";
      toast.error(message);
    },
  });

  // --- Original Validation Function ---
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!password && !confirmPassword) {
      // Prevent initial error if fields are empty
      setPasswordError("");
      return;
    }
    if (!passwordRegex.test(password)) {
      setPasswordError("8+ caractères, majuscule, minuscule, chiffre");
    } else {
      setPasswordError("");
    }
  };

  // --- Original Submit Handler ---
  const handleSubmitStep = (e) => {
    e.preventDefault();
    if (isLoading) return;

    validatePassword(password); // Explicitly validate before check

    // Re-check the password format after validation is explicitly called
    if (
      !password ||
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)
    ) {
      if (!passwordError) {
        // Set error if validation didn't already catch it
        setPasswordError("Format invalide.");
      }
      toast.error("Veuillez entrer un mot de passe valide.");
      return;
    }
    // Clear the error state if format is okay now but maybe comparison failed.
    // Do this ONLY if format check passes
    if (
      passwordError &&
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)
    ) {
      setPasswordError("");
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    // Check step 1 data presence
    if (!user_name || !selectedAvatar) {
      toast.error(
        "Veuillez compléter les informations Nom et Avatar (Étape 1)"
      );
      changeStep(1); // Use changeStep to go back
      return;
    }

    let data = {
      name: user_name,
      email: Email,
      password,
      avatar: selectedAvatar || "https://example.com/default-avatar.jpg", // Use original default/fallback
    };
    signup(data);
  };

  // --- Animation Logic ---
  const stepVariants = {
    hidden: (direction) => ({
      opacity: 0,
      x: direction > 0 ? "100%" : "-100%",
    }),
    visible: {
      opacity: 1,
      x: "0%",
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction < 0 ? "100%" : "-100%",
      transition: { duration: 0.4, ease: "easeInOut" },
    }),
  };

  const changeStep = (newStep) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };
  // --- End Animation Logic ---

  return (
    // --- Original Outer Structure ---
    <section className="h-[100vh] w-[100vw] overflow-hidden flex bg-[#FB63A6] p-[26px] px-[40px] max-md:px-[20px] max-xl:flex-col max-xl:items-center overflow-y-auto scrollbar-hide">
      {/* Left decorative part */}
      <div className="flex flex-col gap-4 self-end max-xl:mx-auto shrink-0">
        <Image
          src={beta}
          alt="version bêta"
          className="w-[150px] ml-[74px] max-xl:mx-auto"
        />
        <h1 className="text-[#FFFFFF] text-[30px] font-semibold text-center w-[300px] leading-[36px] max-xl:w-[600px] max-md:w-[340px]">
          Commencez votre parcours médical
        </h1>
        <p className="w-[280px] mb-[14px] text-center text-[#FFFFFFD6] font-light text-[14px] max-xl:w-[560px] max-md:w-[340px]">
          Inscrivez-vous aujourd&apos;hui pour un apprentissage personnalisé
          dans votre domaine passion !
        </p>
        <Image
          src={doctors}
          alt="médecins"
          className="w-[454px] ml-[-40px] max-xl:hidden"
        />
      </div>

      <div className="bg-[#FFF] w-full h-full pt-10 rounded-[16px] flex flex-col items-center justify-center gap-6 max-xl:py-8 flex-1 min-w-0">
        <Image src={logo} alt="logo" className="w-[140px] mb-4" />
        {/* Tabs */}
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

        <div className="w-[567.09px] max-md:w-[90%] overflow-hidden relative flex-1 flex flex-col">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            {step === 1 ? (
              <motion.div
                key={1} // Step key
                custom={direction}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full" // Keep content flow
              >
                <SignUpStepOne
                  // <<< Pass changeStep function AS setStep prop >>>
                  setStep={changeStep}
                  // Original props
                  setUserName={setUserName}
                  user_name={user_name}
                  selectedAvatar={selectedAvatar}
                  setSelectedAvatar={setSelectedAvatar}
                />
              </motion.div>
            ) : (
              <motion.div
                key={2} // Step key
                custom={direction}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full" // Keep content flow
              >
                <SignUpStepTwo
                  // <<< Pass changeStep function AS setStep prop >>>
                  setStep={changeStep}
                  // Pass loading state
                  isLoading={isLoading}
                  // Original props
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
                  handleSubmitStep2={handleSubmitStep}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* <<< End Animation Wrapper >>> */}
      </div>
    </section>
  );
};

export default Page;
