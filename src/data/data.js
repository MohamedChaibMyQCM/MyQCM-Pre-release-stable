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
import category from "../../public/Icons/categories.svg";
import wHeart from "../../public/Icons/wHeart.svg";
import blida from "../../public/Icons/Blida.svg";
import coursePerModule from "../../public/Icons/coursePerModule.svg";

import blood from "../../public/Quiz/blood.svg";
import clock from "../../public/Quiz/clock.svg";
import headleft from "../../public/Quiz/headleft.svg";
import headright from "../../public/Quiz/headright.svg";
import heartQuiz from "../../public/Quiz/heart.svg";

export const aside_links = [
  {
    name: "Home",
    icon: homePic,
    hoverIcon: homeWhite,
    href: "",
  },
  {
    name: "My Courses",
    icon: course,
    hoverIcon: wcourse,
    href: "MyCourses",
  },
  {
    name: "Videos library",
    icon: video,
    hoverIcon: wvideo,
    href: "VideoLibrary",
  },
  {
    name: "Questions Bank",
    icon: playlist,
    hoverIcon: wvideo,
    href: "QuestionsBank",
  },
  {
    name: "AI QCM Solver",
    icon: solver,
    hoverIcon: wsolver,
    href: "AiQcmSolver",
  },
  {
    name: "My Progress",
    icon: progres,
    hoverIcon: homeWhite,
    href: "MyProgress",
  },
  {
    name: "MyQCM Community",
    icon: community,
    hoverIcon: homeWhite,
    href: "MyQcmCommunity",
  },
  {
    name: "Settings",
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
      },
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
      },
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

export const categories = [
  { name: "Semilogy", questions: 350, img: category },
  { name: "Pathophysiology", questions: 350, img: category },
  { name: "Biochemistry", questions: 350, img: category },
  { name: "Radiology", questions: 350, img: category },
  { name: "Medical Psychology", questions: 350, img: category },
  { name: "Patho-Anatomy", questions: 350, img: category },
  { name: "Pharmacology", questions: 350, img: category },
  { name: "Parasitology", questions: 350, img: category },
  { name: "Immunology", questions: 350, img: category },
  { name: "Microbiology", questions: 350, img: category },
];

export const exams = [
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
  {
    exam: "Examen UI1 2023-2024",
    university: blida,
    module: wHeart,
    question: 60,
  },
];

export const courses = [
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Main Complementary Investigations",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Weight Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Clinical Reasoning",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Semiotics of Hydration Disorders",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
  },
  {
    img: coursePerModule,
    name: "Intro-Medical Semiotics",
    question: 19,
    accuracy: 63,
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
    className: "absolute top-[50%]  translate-y-[-50%] right-0 w-[60px]",
  },
  {
    img: headright,
    alt: "headRight",
    className: "absolute top-[50%] translate-y-[-50%] left-0 w-[60px]",
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
  type: "QROC",
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
