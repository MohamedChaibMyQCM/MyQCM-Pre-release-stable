import localFont from "next/font/local";

const TTInterphases = localFont({
  src: [
    {
      path: "../../public/Fonts/TT Interphases Pro/TT Interphases Pro Trial ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/Fonts/TT Interphases Pro/TT Interphases Pro Trial Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/Fonts/TT Interphases Pro/TT Interphases Pro Trial Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/Fonts/TT Interphases Pro/TT Interphases Pro Trial Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/Fonts/TT Interphases Pro/TT Interphases Pro Trial DemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/Fonts/TT Interphases Pro/TT Interphases Pro Trial Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-TT-Interphases",
});

const Genty = localFont({
  src: [
    {
      path: "../../public/Fonts/Genty/genty-sans-regular.otf",
      weight: "",
      style: "normal",
    },
  ],
  variable: "--font-Genty",
});

const Madani = localFont({
  src: [
    {
      path: "../../public/Fonts/Madani/Madani Arabic ExtraLight 400.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/Fonts/Madani/Madani Arabic Light 400.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/Fonts/Madani/Madani Arabic Regular 400.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/Fonts/Madani/Madani Arabic Medium 400.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/Fonts/Madani/Madani Arabic SemiBold 400.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/Fonts/Madani/Madani Arabic Bold 400.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/Fonts/Madani/Madani Arabic ExtraBold 400.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-Madani",
});

export { TTInterphases, Genty, Madani };