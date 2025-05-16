import React from "react";
import Script from "next/script"; 
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { MotionConfig } from "framer-motion";
import ReactQueryProvider from "@/components/ReactQueryProvider";
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
  const clarityProjectId = "r69pxfi7m6"; 

  return (
    <html lang="fr">
      <body className={`${poppins.variable} font-Poppins`}>
        <ReactQueryProvider>
          <MotionConfig>
            <Toaster />
            {children}
          </MotionConfig>
        </ReactQueryProvider>

        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityProjectId}");
          `}
        </Script>
      </body>
    </html>
  );
}
