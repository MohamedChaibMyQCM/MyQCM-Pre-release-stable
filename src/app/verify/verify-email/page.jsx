"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

function EmailVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const isVerifying = useRef(false);

  useEffect(() => {
    if (!token) {
      toast.error("Lien de vérification invalide");
      router.push("/signup");
      return;
    }

    const verifyEmail = async () => {
      if (isVerifying.current) return;
      isVerifying.current = true;

      try {
        const response = await BaseUrl.post("/auth/user/email/verify", {
          token,
        });

        if (response.data.status === 201) {
          toast.success("Email vérifié avec succès !");
          router.push("/signup/setProfile");
        } else {
          toast.error(
            response.data.message || "Échec de la vérification d'email"
          );
          router.push("/signup");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Une erreur est survenue lors de la vérification"
        );
        router.push("/signup");
      } finally {
        isVerifying.current = false;
      }
    };

    verifyEmail();
  }, [token, router]);

  return null;
}

export default function EmailVerificationPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EmailVerificationContent />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
