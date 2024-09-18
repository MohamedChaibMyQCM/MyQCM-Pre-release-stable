"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import secureLocalStorage from 'react-secure-storage';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import logo from '../../../../public/logoMyqcm.svg';

const GoogleRedirect = () => {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      console.log("token", token);
      // Store the token in localStorage or cookies
      secureLocalStorage.setItem("token", token);
      // Redirect to dashboard or another page
      router.push(`/${locale}/dashboard`);
    }
  }, [searchParams, router, locale]);

  return (
    <div className='h-screen w-screen flex items-center justify-center animate-pulse'>
      <Image src={logo} alt="logo" />
    </div>
  );
};

export default GoogleRedirect;