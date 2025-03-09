"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import secureLocalStorage from "react-secure-storage";
import Loading from "../Loading";
import BaseUrl from "../BaseUrl";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

const AuthProfile = (Component) => {
  const AuthenticatedComponent = (props) => {
    const router = useRouter();
    const [auth, setAuth] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
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

    const checkAuth = async () => {
      if (!secureLocalStorage.getItem("token")) {
        if (!toastShownRef.current) {
          router.push(`/login`);
          toast.error("You need to login");
          toastShownRef.current = true;
        }
        setAuthLoading(false);
      } else {
        try {
          const response = await BaseUrl.get("/user");
          setAuthLoading(false);
          setAuth(true);
        } catch (error) {
          setAuthLoading(false);

          if (!toastShownRef.current) {
            if (
              error.status == 400 &&
              error.response.data.message == "Email not verified"
            ) {
              checkEmail();
              router.push(`/signup/verification`);
              toast.error("Verify your email");
              toastShownRef.current = true;
            } else {
              setAuth(true);
            }
          }
        }
      }
    };

    useEffect(() => {
      checkAuth();
    }, []);

    if (authLoading) return <Loading />;
    if (auth) return <Component {...props} />;
    return null;
  };

  AuthenticatedComponent.displayName = `AuthProfile(${
    Component.displayName || Component.name || "Component"
  })`;

  return AuthenticatedComponent;
};

export default AuthProfile;
