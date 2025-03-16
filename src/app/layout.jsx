import { Poppins } from "next/font/google";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "MY QCM",
  description:
    "Enhance your learning experience with adaptive MCQ’S designed to tailor each session to your individual needs, and intelligent tutoring systems that provide personalized feedback and guidance to help you understand complex concepts more effectively.",
};

export default async function RootLayout({ children }) {
  return (
    <ReactQueryProvider>
      <html lang="fr">
        <body className={`${poppins.className}`}>
          <Toaster />
          {children}
        </body>
      </html>
    </ReactQueryProvider>
  );
}
