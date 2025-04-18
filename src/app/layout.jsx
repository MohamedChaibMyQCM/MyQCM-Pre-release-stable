import React from "react";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast"; 
import { NextStepProvider, NextStep } from "nextstepjs";
import { MotionConfig } from "framer-motion";
import ReactQueryProvider from "@/components/ReactQueryProvider"; 
import { dashboardHeaderTour } from "@/lib/tours"; 
import { CustomOnboardingCard } from "@/components/onboarding/CustomOnboardingCard"; 

import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "MY QCM",
  description:
    "Enhance your learning experience with adaptive MCQ'S designed to tailor each session to your individual needs, and intelligent tutoring systems that provide personalized feedback and guidance to help you understand complex concepts more effectively.",
};

export default function RootLayout({ children }) {

  return (
    <html lang="fr">
      <body className={`${poppins.className}`}>
        <ReactQueryProvider>
          <MotionConfig>
            <NextStepProvider>
              <Toaster />
              <NextStep
                steps={dashboardHeaderTour}
                cardComponent={CustomOnboardingCard}
              >
                {children}
              </NextStep>
            </NextStepProvider>
          </MotionConfig>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
