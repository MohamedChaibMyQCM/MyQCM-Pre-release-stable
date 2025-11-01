"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import toast from "react-hot-toast";
import { Eye, EyeSlash } from "phosphor-react";
import { motion } from "framer-motion";

import GoogleAuthButton from "../comp/google-auth.button";
import BaseUrl from "@/components/BaseUrl";
import { checkAuthAndRedirect } from "@/utils/auth";
import AuthContainer from "@/components/auth/AuthContainer";

import emailIcon from "../../../public/auth/email.svg";
import passIcon from "../../../public/auth/password.svg";

type LoginPayload = {
  email: string;
  password: string;
};

const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const redirected = await checkAuthAndRedirect(router);
      if (!redirected) {
        setIsCheckingAuth(false);
      }
    };

    void checkAuth();
  }, [router]);

  const { mutate: login, isPending } = useMutation({
    mutationFn: (data: LoginPayload) =>
      BaseUrl.post("/auth/user/signin", data, {
        headers: {
          "Content-Type": "application/json",
        },
      }),
    onSuccess: async ({ data }) => {
      secureLocalStorage.setItem("token", data.token);

      try {
        const userResponse = await BaseUrl.get("/user/me", {
          headers: { Authorization: `Bearer ${data.token}` },
        });

        const userData = userResponse.data.data;

        if (!userData.email_verified) {
          router.push("/signup/verification");
          return;
        }

        try {
          const profileResponse = await BaseUrl.get("/user/profile", {
            headers: { Authorization: `Bearer ${data.token}` },
          });

          const profileData = profileResponse.data.data;

          if (
            !profileData ||
            !profileData.university?.id ||
            !profileData.study_field ||
            !profileData.year_of_study ||
            !profileData.unit?.id ||
            !profileData.mode?.id
          ) {
            router.push("/signup/set-profile");
            return;
          }
        } catch (profileError: any) {
          console.error("Error fetching profile:", profileError);
          if (profileError.response?.status === 404) {
            router.push("/signup/set-profile");
            return;
          }
          router.push("/signup/set-profile");
          return;
        }

        if (!userData.completed_introduction) {
          router.push("/onboarding");
          return;
        }

        router.push("/dashboard");
      } catch (error) {
        console.error("Error checking user profile:", error);
        router.push("/dashboard");
      }
    },
    onError: (error: any) => {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message || "Échec de la connexion";
      toast.error(message);
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: LoginPayload = { email, password };
    login(payload);
  };

  if (isCheckingAuth) {
    return (
      <div className="bg-[#FFFFFF] w-full h-full rounded-[16px] flex items-center justify-center">
        <div className="text-[#F8589F]">
          Vérification de l&apos;authentification...
        </div>
      </div>
    );
  }

  return (
    <AuthContainer>
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-[#B5BEC6] hover:text-[#FD2E8A] transition-colors"
            >
              {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <Link
          href="/reset"
          className="text-[#FD2E8A] self-start text-[14px] font-medium mb-2"
        >
          Mot de passe oublié ?
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="mb-10 bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[12px] font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isPending ? (
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
              <span>Connexion en cours...</span>
            </>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>
    </AuthContainer>
  );
};

export default Page;
