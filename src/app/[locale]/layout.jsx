import { Inter, Poppins } from "next/font/google";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { TTInterphases, Genty, Madani } from "@/utils/CustomFonts";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    <ReactQueryProvider>
      <html lang={locale}>
        <body
          className={`${TTInterphases.variable} ${Genty.variable} ${Madani.variable} ${inter.variable} ${poppins.variable}`}
          dir={locale == "ar" ? "rtl" : "ltr"}
        >
          <NextIntlClientProvider messages={messages}>
            {children}
            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              transition={Bounce}
            />
          </NextIntlClientProvider>
        </body>
      </html>
    </ReactQueryProvider>
  );
}
