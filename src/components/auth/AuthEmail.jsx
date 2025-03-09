"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import secureLocalStorage from "react-secure-storage";
import Loading from "../Loading";
import toast from "react-hot-toast";

const AuthEmail = (Component) => {
  const AuthWrapper = (props) => {
    const router = useRouter();
    const [auth, setAuth] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const errorShownRef = useRef(false);

    const checkAuth = async () => {
      if (secureLocalStorage.getItem("token")) {
        setAuth(true);
      } else {
        if (!errorShownRef.current) {
          errorShownRef.current = true;
          router.push(`/login`);
          toast.error("You need to login");
        }
      }
      setAuthLoading(false);
    };

    useEffect(() => {
      checkAuth();
    }, []);

    if (authLoading) return <Loading />;
    if (auth) return <Component {...props} />;
    return null;
  };

  AuthWrapper.displayName = `AuthEmail(${
    Component.displayName || Component.name || "Component"
  })`;

  return AuthWrapper;
};

export default AuthEmail;