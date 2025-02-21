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
  description: "Elearn Plateform",
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
