import { Poppins } from "next/font/google";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { Genty, Madani } from "@/utils/CustomFonts";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "MY QCM",
  description: "Elearn Plateform",
};

export default async function RootLayout({ children, params: { locale } }) {
  const messages = await getMessages();

  return (
    <ReactQueryProvider>
      <html lang={locale}>
        <body
          className={`${poppins.className} ${Genty.variable} ${Madani.variable}`}
          dir={locale == "ar" ? "rtl" : "ltr"}
        >
          <NextIntlClientProvider messages={messages}>
            <Toaster />
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    </ReactQueryProvider>
  );
}
