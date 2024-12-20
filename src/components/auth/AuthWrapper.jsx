"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import { useState, useEffect, useRef } from "react";
import Loading from "../Loading";
import BaseUrl from "../BaseUrl";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

const AuthWrapper = ({ children }) => {
  const locale = useLocale();
  const router = useRouter();
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const toastShownRef = useRef(false);

  const { mutate: checkEmail } = useMutation({
    mutationFn: (data) => BaseUrl.post("/user/confirm-email", data),
    onError: (error) => {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : error?.response?.data?.message || "SignIn failed";

      toast.error(message);
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!secureLocalStorage.getItem("token")) {
        if (!toastShownRef.current) {
          router.push(`/${locale}/login`);
          toast.error("You need to login");
          toastShownRef.current = true;
        }
        setLoading(false);
        return;
      }
      try {
        const response = await BaseUrl.get("/user");
        setLoading(false);
        setAuth(true);
      } catch (error) {
        setLoading(false);

        if (error.response) {
          if (!toastShownRef.current) {
            switch (error.response.data.message) {
              case "Email not verified":
                checkEmail();
                router.push(`/${locale}/signup/verification`);
                toast.error("Verify your email");
                toastShownRef.current = true;
                break;
              case "User profile not found":
                router.push(`/${locale}/signup/setProfile`);
                toast.error("Set up your profile");
                toastShownRef.current = true;
                break;
              default:
                toast.error("Authentication failed");
                toastShownRef.current = true;
            }
          }
        }
      }
    };
    checkAuth();
  }, [locale, router]);

  if (loading) return <Loading />;
  if (auth) return <>{children}</>;
  return null;
};

export default AuthWrapper;
