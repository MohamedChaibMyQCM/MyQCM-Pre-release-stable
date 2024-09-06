"use client"

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Spinner } from "@chakra-ui/react";
import secureLocalStorage from "react-secure-storage";
import { useState } from "react";

const AuthWrapper = ({ children }) => {
    const locale = useLocale()
    const router = useRouter()
    const token = secureLocalStorage.getItem('token')
    const [] = useState()

    if(!token) {
        router.push(`${locale}/login`)
    }
    else {
        if(data.email_verification == "false") {
            router.push(`${locale}/signup/verification`)
        }
        else if (data.profile == null) {
            router.push(`${locale}/signup/setProfile`);
        }
    }

  return <div>AuthWrapper</div>;
};

export default AuthWrapper;
