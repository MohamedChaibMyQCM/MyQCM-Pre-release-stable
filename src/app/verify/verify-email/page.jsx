"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";

const EmailVerificationPage = () => {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const isVerifying = useRef(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid verification link. Please check your email.");
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
          toast.success("Email verified successfully!");
          router.push("/signup/setProfile");
        } else {
          toast.error(response.data.message || "Email verification failed");
          router.push("/signup");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred during verification"
        );
        router.push("/signup");
      } finally {
        isVerifying.current = false;
      }
    };

    verifyEmail();
  }, [token, router]);

  return null;
};

export default EmailVerificationPage;
