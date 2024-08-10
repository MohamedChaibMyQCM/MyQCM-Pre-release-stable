import homePic from "../../public/Aside/home.svg";
import settings from "../../public/Aside/Setting.svg";
import logo1 from "../../public/logos/OpenAi.svg";
import logo2 from "../../public/logos/ANPT.svg";
import logo3 from "../../public/logos/Ouikaya.svg";
import logo4 from "../../public/logos/dr lekhal logo 1.svg";
import logo5 from "../../public/logos/Educteck.svg";
import logo6 from "../../public/logos/BlidaFac.svg";
import module1 from "../../public/Icons/module (1).svg";
import module2 from "../../public/Icons/module (2).svg";
import module3 from "../../public/Icons/module (3).svg";
import module4 from "../../public/Icons/module (4).svg";
import heart from "../../public/heart.svg";
import facebook from "../../public/social Media/FacebookLogo.svg";
import instagram from "../../public/social Media/InstagramLogo.svg";
import linkedin from "../../public/social Media/LinkedinLogo.svg";
import tiktok from "../../public/social Media/TikTok.svg";
import twitter from "../../public/social Media/Twitter.svg";

export const aside_links = [
  {
    name: "Home",
    icon: homePic,
    href: "",
  },
  {
    name: "My Courses",
    icon: settings,
    href: "MyCourses",
  },
  {
    name: "Videos library",
    icon: settings,
    href: "VideoLibrary",
  },
  {
    name: "QCM Playlist's",
    icon: settings,
    href: "QcmPlaylist",
  },
  {
    name: "AI QCM Solver",
    icon: settings,
    href: "AiQcmSolver",
  },
  {
    name: "My Progress",
    icon: settings,
    href: "MyProgress",
  },
  {
    name: "MyQCM Community",
    icon: settings,
    href: "MyQcmCommunity",
  },
  {
    name: "Settings",
    icon: settings,
    href: "settings",
  },
];

export const logos = [
  {
    src: logo1,
  },
  {
    src: logo2,
  },
  {
    src: logo3,
  },
  {
    src: logo4,
  },
  {
    src: logo5,
  },
  {
    src: logo6,
  },
];

export const cards = [
  {
    img: heart,
    unite: "Unite 01: Cardio-respiratory and Medical Psychology",
    description:
      "Explore the cardiovascular and respiratory systems' relationship and the psychological aspects of medical care. This unit includes five modules: semiology, physiopathology, radiology, biochemistry, and medical psychology, providing a comprehensive understanding of their impact on patient health and treatment.",
  },
];

export const modules = [
  {
    img: module4,
    module: "Module Semiology Unite Cardio",
    progress: 67,
    color: "#ECD14E",
  },
  {
    img: module3,
    module: "Module Pathophysiology Unite Cardio",
    progress: 90,
    color: "#B2A4E4",
  },
  {
    img: module2,
    module: "Module Biochemistry Unite Cardio",
    progress: 8,
    color: "#82B304AB",
  },
  {
    img: module1,
    module: "Module Radiology Unite Cardio",
    progress: 50,
    color: "#25D9D7",
  },
];

export const fouterLinks = [
  {
    title: "Pages",
    links: [
      {
        name: "Home",
        href: "",
      },
      {
        name: "Pricing",
        href: "",
      },
      {
        name: "Features",
        href: "",
      },
      {
        name: "Authors",
        href: "",
      },
      {
        name: "About Us",
        href: "",
      },
      {
        name: "Be a MyQCM freelencer",
        href: "",
      },
    ],
  },
  {
    title: "Company",
    links: [
      {
        name: "Terms Conditions",
        href: "",
      },
      {
        name: "Privacy Policy",
        href: "",
      },
      {
        name: "Cookies",
        href: "",
      }
    ],
  },
  {
    title: "Community",
    links: [
      {
        name: "Help Center",
        href: "",
      },
      {
        name: "FAQ",
        href: "",
      }
    ],
  },
];

export const socialMediaLogos = [
  {
    src: facebook,
    href: "",
  },
  {
    src: instagram,
    href: "",
  },
  {
    src: linkedin,
    href: "",
  },
  {
    src: tiktok,
    href: "",
  },
  {
    src: twitter,
    href: "",
  },
];