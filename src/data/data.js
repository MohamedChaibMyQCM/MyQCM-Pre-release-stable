import homePic from "../../public/Aside/home.svg";
import homeWhite from "../../public/Aside/wHome.svg";
import settings from "../../public/Aside/Setting.svg";
import wsettings from "../../public/Aside/wSetting.svg";
import community from "../../public/Aside/community.svg";
import course from "../../public/Aside/mycourse-normal.svg";
import wcourse from "../../public/Aside/wmycourse-normal.svg";
import video from "../../public/Aside/Video play.svg";
import wvideo from "../../public/Aside/wVideo play.svg";
import progres from "../../public/Aside/Rectangle.svg";
import solver from "../../public/Aside/solver.svg";
import wsolver from "../../public/Aside/wsolver.svg";
import playlist from "../../public/Aside/playlist.svg";
import logo1 from "../../public/logos/OpenAi.svg";
import logo4 from "../../public/logos/dr lekhal logo 1.svg";
import logo5 from "../../public/logos/Educteck.svg";
import logo6 from "../../public/logos/BlidaFac.svg";
import facebook from "../../public/social Media/FacebookLogo.svg";
import instagram from "../../public/social Media/InstagramLogo.svg";
import linkedin from "../../public/social Media/LinkedinLogo.svg";
import tiktok from "../../public/social Media/TikTok.svg";
import twitter from "../../public/social Media/Twitter.svg";
import wHeart from "../../public/Icons/wHeart.svg";
import blida from "../../public/Icons/Blida.svg";
import blood from "../../public/Quiz/blood.svg";
import clock from "../../public/Quiz/clock.svg";
import headleft from "../../public/Quiz/headleft.svg";
import headright from "../../public/Quiz/headright.svg";
import heartQuiz from "../../public/Quiz/heart.svg";

export const aside_links = [
  {
    name: "Accueil",
    icon: homePic,
    hoverIcon: homeWhite,
    href: "",
  },
  {
    name: "Mes Cours",
    icon: course,
    hoverIcon: wcourse,
    href: "MyCourses",
  },
  {
    name: "Bibliothèque de Vidéos",
    icon: video,
    hoverIcon: wvideo,
    href: "VideoLibrary",
  },
  {
    name: "Banque de Questions",
    icon: playlist,
    hoverIcon: wvideo,
    href: "QuestionsBank",
  },
  {
    name: "Qmed Bot",
    icon: solver,
    hoverIcon: wsolver,
    href: "AiQcmSolver",
  },
  {
    name: "Ma Progression",
    icon: progres,
    hoverIcon: homeWhite,
    href: "MyProgress",
  },
  {
    name: "Communauté MyQCM",
    icon: community,
    hoverIcon: homeWhite,
    href: "MyQcmCommunity",
  },
  {
    name: "Paramètres",
    icon: settings,
    hoverIcon: wsettings,
    href: "settings",
  },
];

export const logos = [
  {
    src: logo1,
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

export const fouterLinks = [
  {
    title: "Pages",
    links: [
      {
        name: "Accueil",
        href: "",
      },
      {
        name: "Tarification",
        href: "",
      },
      {
        name: "Fonctionnalités",
        href: "",
      },
      {
        name: "Auteurs",
        href: "",
      },
      {
        name: "À propos de nous",
        href: "",
      },
      {
        name: "Devenez freelance MyQCM",
        href: "",
      },
    ],
  },
  {
    title: "Entreprise",
    links: [
      {
        name: "Conditions générales",
        href: "",
      },
      {
        name: "Politique de confidentialité",
        href: "",
      },
      {
        name: "Cookies",
        href: "",
      },
    ],
  },
  {
    title: "Communauté",
    links: [
      {
        name: "Centre d'aide",
        href: "",
      },
      {
        name: "FAQ",
        href: "",
      },
    ],
  },
];

export const socialMediaLogos = [
  {
    src: facebook,
    href: "",
    width: 30,
  },
  {
    src: instagram,
    href: "https://www.instagram.com/myqcm.aljazayr",
    width: 30,
  },
  {
    src: linkedin,
    href: "",
    width: 30,
  },
  {
    src: tiktok,
    href: "",
    width: 20,
  },
  {
    src: twitter,
    href: "",
    width: 20,
  },
];

export const exams = [
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
  {
    exam: "Examen UI1 ",
    university: blida,
    module: wHeart,
    question: 0,
  },
];

export const QuizImage = [
  {
    img: blood,
    alt: "blood",
    className: "absolute bottom-0 right-0 w-[100px]",
  },
  {
    img: headleft,
    alt: "headLeft",
    className: "absolute top-[50%]  translate-y-[-50%] right-0 w-[60px] z-[-1]",
  },
  {
    img: headright,
    alt: "headRight",
    className: "absolute top-[50%] translate-y-[-50%] left-0 w-[60px] z-[-1]",
  },
  {
    img: clock,
    alt: "clock",
    className: "absolute bottom-0 left-[50%] translate-x-[-50%] w-[60px]",
  },
  {
    img: heartQuiz,
    alt: "heart",
    className: "absolute bottom-0 left-0 w-[60px]",
  },
];

export const QuizData = {
  type: "QCM",
  Quiz: [
    {
      difficulty: "Easy",
      time: 6,
      text: "Given an enzymatic reaction with Michaelis-Menten kinetics, studied using a double-reciprocal plot. Curve 1 represents the variation of 1/V (s/mol) as a function of 1/S (L/µmol) in an environment without inhibitors. Curves 2, 3, and 4 are the results of experiments conducted under the same conditions but with inhibitors 2, 3, and 4 at a concentration of 8×10^(-5) mol/L in each case. Identify the true statements:",
      options: [
        { option: "A) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "B) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "C) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "D) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "E) Bisoprolol, Carvedilol, Metoprolol" },
      ],
      explanation:
        "In heart failure, outside the acute phase, a decrease in cardiac output increases the secretion of catecholamines, which can cause cardiac arrhythmias (such as VT, VF). This is why beta-blockers are used to prevent this effect.",
      analysis:
        "Your answer demonstrates a solid understanding of beta-blockers in heart failure management. You correctly identified appropriate medications, and your response is both accurate and detailed, reflecting a good grasp of the underlying pharmacology.",
    },
    {
      difficulty: "Meduim",
      time: 11,
      text: "Name 3 beta-blockers used in heart failure.",
      options: [
        { option: "A) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "B) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "C) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "D) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "E) Bisoprolol, Carvedilol, Metoprolol" },
      ],
      explanation:
        "In heart failure, outside the acute phase, a decrease in cardiac output increases the secretion of catecholamines, which can cause cardiac arrhythmias (such as VT, VF). This is why beta-blockers are used to prevent this effect.",
      analysis:
        "Your answer demonstrates a solid understanding of beta-blockers in heart failure management. You correctly identified appropriate medications, and your response is both accurate and detailed, reflecting a good grasp of the underlying pharmacology.",
    },
    {
      difficulty: "Easy",
      time: 30,
      text: "Given an enzymatic reaction with Michaelis-Menten kinetics, studied using a double-reciprocal plot. Curve 1 represents the variation of 1/V (s/mol) as a function of 1/S (L/µmol) in an environment without inhibitors. Curves 2, 3, and 4 are the results of experiments conducted under the same conditions but with inhibitors 2, 3, and 4 at a concentration of 8×10^(-5) mol/L in each case. Identify the true statements:",
      options: [
        { option: "A) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "B) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "C) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "D) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "E) Bisoprolol, Carvedilol, Metoprolol" },
      ],
      explanation:
        "In heart failure, outside the acute phase, a decrease in cardiac output increases the secretion of catecholamines, which can cause cardiac arrhythmias (such as VT, VF). This is why beta-blockers are used to prevent this effect.",
      analysis:
        "Your answer demonstrates a solid understanding of beta-blockers in heart failure management. You correctly identified appropriate medications, and your response is both accurate and detailed, reflecting a good grasp of the underlying pharmacology.",
    },
    {
      difficulty: "Meduim",
      time: 28,
      text: "Name 3 beta-blockers used in heart failure.",
      options: [
        { option: "A) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "B) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "C) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "D) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "E) Bisoprolol, Carvedilol, Metoprolol" },
      ],
      explanation:
        "In heart failure, outside the acute phase, a decrease in cardiac output increases the secretion of catecholamines, which can cause cardiac arrhythmias (such as VT, VF). This is why beta-blockers are used to prevent this effect.",
      analysis:
        "Your answer demonstrates a solid understanding of beta-blockers in heart failure management. You correctly identified appropriate medications, and your response is both accurate and detailed, reflecting a good grasp of the underlying pharmacology.",
    },
    {
      difficulty: "Easy",
      time: 22,
      text: "Given an enzymatic reaction with Michaelis-Menten kinetics, studied using a double-reciprocal plot. Curve 1 represents the variation of 1/V (s/mol) as a function of 1/S (L/µmol) in an environment without inhibitors. Curves 2, 3, and 4 are the results of experiments conducted under the same conditions but with inhibitors 2, 3, and 4 at a concentration of 8×10^(-5) mol/L in each case. Identify the true statements:",
      options: [
        { option: "A) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "B) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "C) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "D) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "E) Bisoprolol, Carvedilol, Metoprolol" },
      ],
      explanation:
        "In heart failure, outside the acute phase, a decrease in cardiac output increases the secretion of catecholamines, which can cause cardiac arrhythmias (such as VT, VF). This is why beta-blockers are used to prevent this effect.",
      analysis:
        "Your answer demonstrates a solid understanding of beta-blockers in heart failure management. You correctly identified appropriate medications, and your response is both accurate and detailed, reflecting a good grasp of the underlying pharmacology.",
    },
    {
      difficulty: "Meduim",
      time: 19,
      text: "Name 3 beta-blockers used in heart failure.",
      options: [
        { option: "A) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "B) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "C) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "D) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "E) Bisoprolol, Carvedilol, Metoprolol" },
      ],
      explanation:
        "In heart failure, outside the acute phase, a decrease in cardiac output increases the secretion of catecholamines, which can cause cardiac arrhythmias (such as VT, VF). This is why beta-blockers are used to prevent this effect.",
      analysis:
        "Your answer demonstrates a solid understanding of beta-blockers in heart failure management. You correctly identified appropriate medications, and your response is both accurate and detailed, reflecting a good grasp of the underlying pharmacology.",
    },
    {
      difficulty: "Easy",
      time: 47,
      text: "Given an enzymatic reaction with Michaelis-Menten kinetics, studied using a double-reciprocal plot. Curve 1 represents the variation of 1/V (s/mol) as a function of 1/S (L/µmol) in an environment without inhibitors. Curves 2, 3, and 4 are the results of experiments conducted under the same conditions but with inhibitors 2, 3, and 4 at a concentration of 8×10^(-5) mol/L in each case. Identify the true statements:",
      options: [
        { option: "A) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "B) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "C) Bisoprolol, Carvedilol, Metoprolol" },
        {
          option:
            "D) Curve 4 corresponds to conditions where the enzyme's affinity for the substrate is the highest.",
        },
        { option: "E) Bisoprolol, Carvedilol, Metoprolol" },
      ],
      explanation:
        "In heart failure, outside the acute phase, a decrease in cardiac output increases the secretion of catecholamines, which can cause cardiac arrhythmias (such as VT, VF). This is why beta-blockers are used to prevent this effect.",
      analysis:
        "Your answer demonstrates a solid understanding of beta-blockers in heart failure management. You correctly identified appropriate medications, and your response is both accurate and detailed, reflecting a good grasp of the underlying pharmacology.",
    },
  ],
};
