"use client";

import Image from "next/image";
import logo from "../../../public/logoMyqcm.png";
import doctors from "../../../public/ShapeDocters.svg";
import beta from "../../../public/auth/beta.svg";
import Link from "next/link";
import { useState } from "react";
import SignUpStepOne from "@/components/signup/SignUpStepOne";
import SignUpStepTwo from "@/components/signup/SignUpStepTwo";
import { useMutation } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import secureLocalStorage from "react-secure-storage";
import { motion, AnimatePresence } from "framer-motion";

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
  const [direction, setDirection] = useState(0);
  const router = useRouter();

  const { mutate: signup, isLoading } = useMutation({
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

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!password && !confirmPassword) {
      setPasswordError("");
      return;
    }
    if (!passwordRegex.test(password)) {
      setPasswordError("8+ caractères, majuscule, minuscule, chiffre");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmitStep = (e) => {
    e.preventDefault();
    if (isLoading) return;

    validatePassword(password);

    if (!password || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      if (!passwordError) {
        setPasswordError("Format invalide.");
      }
      toast.error("Veuillez entrer un mot de passe valide.");
      return;
    }
    if (
      passwordError &&
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
    ) {
      setPasswordError("");
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (!user_name || !selectedAvatar) {
      toast.error(
        "Veuillez compléter les informations Nom et Avatar (Étape 1)"
      );
      changeStep(1);
      return;
    }

    let data = {
      name: user_name,
      email: Email,
      password,
      avatar: selectedAvatar || "https://example.com/default-avatar.jpg",
    };
    signup(data);
  };

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

  return (
    <section className="h-[100vh] w-[100vw] overflow-hidden flex bg-[#FB63A6] p-[26px] px-[40px] max-md:px-[20px] max-xl:flex-col max-xl:items-center overflow-y-auto scrollbar-hide">
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

        <div className="w-[567.09px] overflow-hidden relative flex-1 flex flex-col max-md:w-[90%]">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            {step === 1 ? (
              <motion.div
                key={1}
                custom={direction}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full"
              >
                <SignUpStepOne
                  setStep={changeStep}
                  setUserName={setUserName}
                  user_name={user_name}
                  selectedAvatar={selectedAvatar}
                  setSelectedAvatar={setSelectedAvatar}
                />
              </motion.div>
            ) : (
              <motion.div
                key={2}
                custom={direction}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full"
              >
                <SignUpStepTwo
                  setStep={changeStep}
                  isLoading={isLoading}
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
      </div>
    </section>
  );
};

export default Page;
