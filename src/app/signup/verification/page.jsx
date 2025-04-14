"use client";

import Image from "next/image";
import logo from "../../../../public/logoMyqcm.png"; 
import Link from "next/link";
import { CaretLeft, Spinner } from "phosphor-react";
import { useQuery } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl"; 

const VerificationPage = () => {
  const {
    data: userProfile,
    isLoading, 
    isError, 
    error, 
  } = useQuery({
    queryKey: ["userProfileVerification"], 
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) {
        console.error("Verification Page: No token found.");
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
        console.error("Error fetching user profile:", err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false, 
  });

  return (
    <div className="bg-[#FFF] w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-6 p-4">
      <Image src={logo} alt="MyQCM Logo" className="w-[140px] mb-6" />{" "}
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
          Vérification requise
        </h2>
        <div className="bg-[#FFF5FA] p-6 rounded-[16px] border border-[#FD2E8A33]">
          {isLoading ? (
            <div className="flex items-center justify-center text-[#191919] text-[15px]">
              <Spinner size={24} className="animate-spin mr-2 text-[#F8589F]" />
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
              <p className="text-[#191919] text-[15px]">
                Cher(e){" "}
                <span className="text-[#F8589F] font-[500]">
                  {userProfile.name || "Utilisateur"}
                </span>
                , veuillez vérifier votre boîte de réception (et le dossier
                spam) pour le lien d&apos;activation de votre compte MyQCM.
              </p>

              <p className="text-[#666666] text-[13px] mt-4">
                Si vous n&apos;avez pas reçu l&apos;email après quelques
                minutes, vérifiez l&apos;adresse email associée à votre compte
                ou contactez notre support.
              </p>
            </>
          ) : (
            <p className="text-gray-600 text-[15px]">
              Les informations utilisateur n&apos;ont pas pu être chargées.
              Veuillez contacter le support.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage; // Changed export name
