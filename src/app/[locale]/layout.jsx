import { TTInterphases, Genty, Madani } from "@/utils/CustomFonts";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import './globals.css'

export const metadata = {
  title: "MY QCM",
  description: "Elearn Plateform",
};

export default async function RootLayout({ children, params: { locale } }) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${TTInterphases.variable} ${Genty.variable} ${Madani.variable}`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
