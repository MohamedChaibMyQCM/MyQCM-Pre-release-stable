"use client";

import Image from "next/image";
import logo from "../../../../public/logoMyqcm.png";
import Link from "next/link";
import { CaretLeft, Spinner } from "phosphor-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const VerificationPage = () => {
  const router = useRouter();
  const [otpCode, setOtpCode] = useState("");
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);

  const {
    data: userProfile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userProfileVerification"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found.");
      }
      try {
        const response = await BaseUrl.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data?.data || null;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (otpCode) => {
      const token = secureLocalStorage.getItem("token");

      const cleanOtpCode = String(otpCode).trim();

      if (
        !cleanOtpCode ||
        cleanOtpCode.length !== 6 ||
        !/^\d{6}$/.test(cleanOtpCode)
      ) {
        throw new Error("Le code doit contenir exactement 6 chiffres");
      }

      const otpNumber = parseInt(cleanOtpCode, 10);

      if (isNaN(otpNumber) || otpNumber < 100000 || otpNumber > 999999) {
        throw new Error("Format de code invalide");
      }

      const response = await BaseUrl.post(
        "/auth/user/email/verify",
        { otp_code: otpNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      setIsVerificationComplete(true);
      toast.success("Email vérifié avec succès!");
      router.push("/signup/set-profile");
    },
    onError: (error) => {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message ||
          error.message ||
          "Code de vérification invalide";
      toast.error(message);

      setOtpCode("");
    },
  });

  const resendCodeMutation = useMutation({
    mutationFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.post(
        "/auth/user/email/resend",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Code de vérification renvoyé!");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Erreur lors du renvoi du code";
      toast.error(message);
    },
  });

  const handleSubmitOtp = (e) => {
    e.preventDefault();

    const cleanCode = String(otpCode).trim();

    if (!cleanCode) {
      toast.error("Veuillez entrer le code de vérification");
      return;
    }

    if (cleanCode.length !== 6) {
      toast.error("Le code doit contenir 6 chiffres");
      return;
    }

    if (!/^\d{6}$/.test(cleanCode)) {
      toast.error("Le code ne doit contenir que des chiffres");
      return;
    }

    verifyEmailMutation.mutate(cleanCode);
  };

  const handleResendCode = () => {
    resendCodeMutation.mutate();
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, "").slice(0, 6);
    setOtpCode(value);
  };

  if (isVerificationComplete) {
    return (
      <div className="bg-[#FFF] w-full min-h-full rounded-[16px] flex flex-col items-center justify-center gap-6 p-4">
        <Image src={logo} alt="MyQCM Logo" className="w-[140px] mb-6" />
        <div className="w-[567.09px] mx-auto max-md:w-[90%] text-center">
          <h2 className="text-[#191919] font-[500] text-[20px] mb-4">
            Vérification réussie !
          </h2>
          <div className="bg-[#F0F9F5] p-6 rounded-[16px] border border-[#47B88133]">
            <p className="text-[#191919] text-[15px]">
              Votre email a été vérifié avec succès. Vous allez être redirigé
              vers la configuration de votre compte.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF] w-full min-h-full rounded-[16px] flex flex-col items-center justify-center gap-6 p-4 overflow-y-auto">
      <Image src={logo} alt="MyQCM Logo" className="w-[140px] mb-6" />

      <div className="flex items-center gap-1 self-start w-[567.09px] mx-auto max-md:w-[90%] max-md:pl-3">
        <Link href={`/login`} className="flex items-center gap-1 group">
          <CaretLeft
            size={16}
            className="text-[#F8589F] group-hover:text-[#E02174] transition-colors"
          />
          <span className="text-[15px] font-[500] text-[#F8589F] group-hover:text-[#E02174] transition-colors">
            Retour
          </span>
        </Link>
      </div>

      <div className="w-[567.09px] mx-auto max-md:w-[90%] text-center">
        <h2 className="text-[#191919] font-[500] text-[20px] mb-4">
          Vérification de votre email
        </h2>

        <div className="bg-[#FFF5FA] p-6 rounded-[16px] border border-[#FD2E8A33] mb-6">
          {isLoading ? (
            <div className="flex items-center justify-center text-[#191919] text-[15px]">
              <Spinner size={24} className="animate-spin mr-2 text-[#F8589F]" />
              Chargement...
            </div>
          ) : isError ? (
            <p className="text-red-600 text-[15px]">
              Impossible de charger vos informations. Veuillez{" "}
              <Link href="/login" className="underline hover:text-red-800">
                réessayer de vous connecter
              </Link>{" "}
              ou contacter le support.
            </p>
          ) : userProfile ? (
            <>
              <p className="text-[#191919] text-[15px] mb-4">
                Cher(e){" "}
                <span className="text-[#F8589F] font-[500]">
                  {userProfile.name || "Utilisateur"}
                </span>
                , nous avons envoyé un code de vérification à 6 chiffres à votre
                adresse email.
              </p>
              <p className="text-[#666666] text-[13px]">
                Veuillez entrer le code pour vérifier votre compte.
              </p>
            </>
          ) : (
            <p className="text-gray-600 text-[15px]">
              Les informations utilisateur n&apos;ont pas pu être chargées.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmitOtp} className="space-y-4">
          <div>
            <label
              htmlFor="otp"
              className="block text-[#191919] text-[15px] font-[500] mb-2"
            >
              Code de vérification
            </label>
            <input
              id="otp"
              type="text"
              value={otpCode}
              onChange={handleOtpChange}
              placeholder="Entrez le code à 6 chiffres"
              className="w-full px-4 py-3 text-center text-[18px] font-[500] tracking-[0.2em] rounded-[12px] border border-gray-300 focus:outline-none focus:border-[#F8589F] focus:ring-1 focus:ring-[#F8589F] bg-white"
              maxLength={6}
              disabled={verifyEmailMutation.isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={verifyEmailMutation.isLoading || otpCode.length !== 6}
            className="w-full bg-[#F8589F] text-white py-3 px-4 rounded-[12px] font-[500] text-[15px] hover:bg-[#E02174] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {verifyEmailMutation.isLoading ? (
              <>
                <Spinner size={20} className="animate-spin mr-2" />
                Vérification...
              </>
            ) : (
              "Vérifier mon email"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#666666] text-[13px] mb-2">
            Vous n&apos;avez pas reçu le code ?
          </p>
          <button
            onClick={handleResendCode}
            disabled={resendCodeMutation.isLoading}
            className="text-[#F8589F] text-[14px] font-[500] hover:text-[#E02174] transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendCodeMutation.isLoading
              ? "Envoi en cours..."
              : "Renvoyer le code"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
