import { Inter, Poppins } from "next/font/google";
import { TTInterphases, Genty, Madani } from "@/utils/CustomFonts";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
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
    <html lang={locale}>
      <body
        className={`${TTInterphases.variable} ${Genty.variable} ${Madani.variable} ${inter.variable} ${poppins.variable}`}
        dir={locale == "ar" ? "rtl" : "ltr"}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}