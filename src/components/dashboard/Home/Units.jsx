"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import unit1 from "../../../../public/Home/unit1.svg";
import unit2 from "../../../../public/Home/unit2.svg";
import unit3 from "../../../../public/Home/unit3.svg";
import unit4 from "../../../../public/Home/unit4.svg";
import unit5 from "../../../../public/Home/unit5.svg";
import unit6 from "../../../../public/Home/unit6.svg";
import unit7 from "../../../../public/Home/unit7.svg";
import unit8 from "../../../../public/Home/unit8.svg";
import unit9 from "../../../../public/Home/unit9.svg";
import play from "../../../../public/Home/play.svg";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Units = () => {
  const router = useRouter();
  const [currentUnit, setCurrentUnit] = useState(0);
  const [showQuickSimTooltip, setShowQuickSimTooltip] = useState(false);
  const [showLockedUnitTooltip, setShowLockedUnitTooltip] = useState(false);

  const { data: userPro, refetch: refetchUserPro } = useQuery({
    queryKey: ["u"],
    queryFn: async () => {
      try {
        const token = secureLocalStorage.getItem("token");
        const response = await BaseUrl.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data?.data || {};
      } catch (err) {
        toast.error("Failed to fetch user data. Please try again later.");
      }
    },
  });
  console.log(userPro);

  // Check if user is in fourth year
  const isUserFourthYear = userPro?.year_of_study === "Fourth Year";

  // Special pneumology unit for fourth-year students
  const pneumologyUnit = {
    id: "b7eeafcf-9922-4d58-8896-0c97e0efbe3f",
    title: "Module Pneumologie (Expérimental)",
    description:
      "Testez notre moteur QROC nouvelle génération, doté d'une vision IA pour l'analyse d'images radiologiques. Mettez vos compétences d'interprétation à l'épreuve et recevez un feedback instantané pour affiner votre regard clinique.",
    startColor: "#D17C81", // Updated background color as requested
    endColor: "#F8589F",
    image:
      "https://res.cloudinary.com/dgxaezwuv/image/upload/v1749854368/Untitled_design_4_nvw81f.png",
    imageWidth: 160,
    position: { right: "40px", bottom: "18px" },
  };

  // Regular units data
  const regularUnitsData = [
    {
      id: "08d2c45d-288c-468b-a12c-687420f4e4f8", // Unit 1 (Index 0)
      title: "Unité 01 : Cardio-respiratoire et Psychologie Médicale",
      description:
        "Découvrez l'interaction entre les systèmes cardiovasculaire et respiratoire, ainsi que l'importance des aspects psychologiques dans les soins. Cette unité propose cinq modules clés pour mieux comprendre leur rôle dans la santé et la prise en charge des patients.",
      startColor: "#F43A5D",
      endColor: "#F8589F",
      image: unit1,
      imageWidth: 220,
      position: { right: "2px", bottom: "-40px" },
    },
    {
      id: "22b66563-bd6d-404d-a4a2-f2061b0b751d", // Unit 2 (Index 1)
      title: "Unité 02 : Neurologie et Fonction Cognitive",
      description:
        "Plongez dans l'évaluation neurologique, les voies motrices et sensorielles, ainsi que les constatations dermatologiques de base. Reconnaissez les signes de lésions, les troubles du mouvement et les pathologies cutanées pour une compréhension clinique approfondie.",
      startColor: "#B1BBB9",
      endColor: "#F8589F",
      image: unit2,
      imageWidth: 160,
      position: { right: "40px", bottom: "-20px" },
    },
    {
      id: "bc602e71-b043-47d2-b2e5-b8f59252b12a", // Unit 3 (Index 2)
      title: "Unité 03 : Systèmes Endocrinien, Reproducteur et Urinaire",
      description:
        "Examinez la régulation hormonale, la physiologie reproductive et la fonction rénale. Étudiez les troubles endocriniens courants, les problèmes de fertilité et les pathologies urinaires pour maîtriser les principes fondamentaux du diagnostic et de la prise en charge.",
      startColor: "#D0795B",
      endColor: "#F8589F",
      image: unit3,
      imageWidth: 90,
      position: { right: "60px", bottom: "-5px" },
    },
    {
      id: "84d4c4c5-1f58-494d-a426-7a2d1a7b0e0f", // Unit 4 (Index 3)
      title: "Unité 04 : Systèmes Digestif et Hématopoïétique",
      description:
        "Étudiez l'anatomie et la fonction gastro-intestinale ainsi que la formation des cellules sanguines. Identifiez les troubles digestifs fréquents et les conditions hématologiques pour améliorer vos compétences diagnostiques et les résultats des patients.",
      startColor: "#8C5F5F",
      endColor: "#F8589F",
      image: unit4,
      imageWidth: 150,
      position: { right: "40px", bottom: "-15px" },
    },
    {
      id: "0c51d4ae-0731-4324-a806-3999570fc791",
      title: "Unité 05 : Anatomie et Cytopathologie",
      description:
        "Apprenez les processus pathologiques au niveau cellulaire et tissulaire, en vous concentrant sur les changements morphologiques. Maîtrisez l'identification des lésions et les bases de la pathologie pour une compréhension approfondie des mécanismes de la maladie.",
      startColor: "#5494C3",
      endColor: "#F8589F",
      image: unit5,
      imageWidth: 150,
      position: { right: "30px", bottom: "3px" },
    },
    {
      id: "aa781502-1890-4a7a-8962-8ebf4eadc6a6",
      title: "Unité 06 : Immunologie",
      description:
        "Découvrez les mécanismes de défense de l'organisme, y compris les interactions antigène-anticorps, l'hypersensibilité et les immunodéficiences. Obtenez une vision claire des réponses immunitaires en santé, en maladie et dans les thérapies ciblées.",
      startColor: "#FEBF05",
      endColor: "#F8589F",
      image: unit6,
      imageWidth: 150,
      position: { right: "40px", bottom: "25px" },
    },
    {
      id: "3ff0a4d0-f9cb-44de-b4bd-cfb21adabaf1",
      title: "Unité 07 : Microbiologie",
      description:
        "Explorez les pathogènes bactériens, viraux et fongiques. Comprenez la structure microbienne, la croissance et les diagnostics pour reconnaître les maladies infectieuses et orienter efficacement la prévention ou le traitement.",
      startColor: "#821911",
      endColor: "#F8589F",
      image: unit7,
      imageWidth: 140,
      position: { right: "50px", bottom: "10px" },
    },
    {
      id: "9bbcccba-2d9d-468a-8503-cc06fd6ca9e6",
      title: "Unité 08 : Parasitologie et Mycologie",
      description:
        "Étudiez les parasites, les helminthes et les champignons pathogènes. Comprenez les cycles de vie, les modes de transmission et les présentations cliniques pour affiner vos approches diagnostiques et thérapeutiques.",
      startColor: "#1D864C",
      endColor: "#F8589F",
      image: unit8,
      imageWidth: 110,
      position: { right: "50px", bottom: "20px" },
    },
    {
      id: "f709b397-cae3-4069-8d02-60e5e6d77973",
      title: "Unité 09 : Pharmacologie",
      description:
        "Examinez l'action des médicaments, la pharmacocinétique et les interactions. Développez vos compétences en prescription, surveillez les effets thérapeutiques et minimisez les réactions indésirables pour améliorer les soins aux patients.",
      startColor: "#8F56D6",
      endColor: "#F8589F",
      image: unit9,
      imageWidth: 160,
      position: { right: "40px", bottom: "10px" },
    },
  ];

  // Choose units data based on user's year
  const unitsData = isUserFourthYear ? [pneumologyUnit] : regularUnitsData;

  useEffect(() => {
    if (unitsData.length <= 1) return; // Don't auto-rotate if only one unit

    const interval = setInterval(() => {
      setCurrentUnit((prev) => (prev >= unitsData.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [unitsData.length]);

  const handleStartUnit = (unitId) => {
    // For pneumology unit, go directly to the specific path
    if (unitId === pneumologyUnit.id) {
      router.push(`/dashboard/question-bank/${unitId}`);
      return;
    }

    const unit = unitsData.find((u) => u.id === unitId);
    if (!unit) {
      console.error(`Unit with ID ${unitId} not found in unitsData.`);
      toast.error("Unité non trouvée.");
      return;
    }
    const unitIndex = unitsData.findIndex((u) => u.id === unitId);
    const unitNumber = unitIndex + 1;

    if (unitNumber === 4) {
      router.push(`/dashboard/question-bank?unitId=${unitId}`);
    } else if (unitNumber >= 5 && unitNumber <= 9) {
      router.push(`/dashboard/question-bank/${unitId}`);
    } else {
      console.warn(
        `Navigation logic not defined or unit (${unitNumber}) should have been locked.`
      );
    }
  };

  const currentUnitIndex = Math.min(currentUnit, unitsData.length - 1);
  const currentUnitData = unitsData[currentUnitIndex];
  // Skip lock for pneumology unit
  const isCurrentUnitLocked = !isUserFourthYear && currentUnitIndex < 3;

  if (!currentUnitData) {
    return null;
  }

  const gradientStyle = {
    background: `linear-gradient(to right, ${
      currentUnitData.startColor || "#CCCCCC"
    }, ${currentUnitData.endColor || "#AAAAAA"})`,
  };

  // Common Tailwind classes for tooltips
  const tooltipBaseClasses =
    "absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-zinc-800 text-white text-xs rounded-md shadow-lg z-20 w-max text-center";
  // Arrow is centered within the tooltip's own coordinate system
  const tooltipArrowClasses =
    "absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-zinc-800";

  return (
    <div
      id="tour-units-section"
      className="relative w-full min-h-[180px] p-6 py-4 rounded-[20px] overflow-hidden transition-all duration-500 ease-in-out max-md:px-4 flex flex-col max-md:pb-10"
      style={gradientStyle}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentUnit}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="relative z-[5] max-md:text-center max-w-[calc(100%-150px)] max-lg:max-w-[calc(100%-100px)] max-md:max-w-full"
        >
          <h2 className="text-[#FFFFFF] text-[18px] font-[500] mt-1">
            {currentUnitData.title}
          </h2>
          <p className="text-[13px] text-[#FFFFFF] mt-3 mb-6 font-[400] max-w-[90%] max-md:max-w-full">
            {currentUnitData.description}
          </p>
          <div className="flex items-center gap-5 max-md:justify-center max-md:flex-col max-md:gap-2 mb-4 max-md:mb-0">
            <div className="relative">
              <button
                className={`group flex items-center gap-2 text-[#FFFFFF] bg-[#191919] rounded-[20px] px-5 py-[6px] text-[13px] font-[500] transition-all duration-200 ease-in-out hover:scale-105 whitespace-nowrap
                  ${
                    isCurrentUnitLocked
                      ? "opacity-70 cursor-not-allowed hover:opacity-70"
                      : "hover:opacity-90 hover:px-6"
                  }`}
                onClick={() => {
                  if (!isCurrentUnitLocked) {
                    handleStartUnit(currentUnitData.id);
                  }
                }}
                onMouseEnter={() => {
                  if (isCurrentUnitLocked) setShowLockedUnitTooltip(true);
                }}
                onMouseLeave={() => {
                  if (isCurrentUnitLocked) setShowLockedUnitTooltip(false);
                }}
                aria-describedby={
                  isCurrentUnitLocked ? "tooltip-locked-unit" : undefined
                }
              >
                Commencer l&apos;unité{" "}
                <Image
                  src={play}
                  alt="Démarrer"
                  width={16}
                  height={16}
                  className={`transition-transform duration-200 ease-in-out ${
                    !isCurrentUnitLocked && "group-hover:translate-x-1"
                  }`}
                />
              </button>
              <AnimatePresence>
                {isCurrentUnitLocked && showLockedUnitTooltip && (
                  <motion.div
                    id="tooltip-locked-unit"
                    role="tooltip"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={`${tooltipBaseClasses} max-w-[270px]`}
                  >
                    <div className="relative">
                      {" "}
                      <span>
                        Ces trois premières unités seront disponibles
                        prochainement.
                      </span>
                      <div className={tooltipArrowClasses}></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Restored "Simulation rapide d'examen" for all users including fourth-year */}
            <div className="relative">
              <button
                className="text-[13px] text-[#FFFFFF] font-[500] leading-5 tracking-[0.14px] underline whitespace-nowrap"
                onMouseEnter={() => setShowQuickSimTooltip(true)}
                onMouseLeave={() => setShowQuickSimTooltip(false)}
                aria-describedby="tooltip-quick-sim"
              >
                Simulation rapide d&apos;examen
              </button>
              <AnimatePresence>
                {showQuickSimTooltip && (
                  <motion.div
                    id="tooltip-quick-sim"
                    role="tooltip"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={`${tooltipBaseClasses} max-w-[240px]`}
                  >
                    <div className="relative">
                      <span>Fonctionnalité à venir prochainement.</span>
                      <div className={tooltipArrowClasses}></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {unitsData.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center z-10">
          <ul className="flex gap-2 items-center">
            {unitsData.map((_, index) => (
              <li
                key={`dot-${index}`}
                className={`h-2 rounded-full bg-white cursor-pointer transition-all duration-300 ease-in-out ${
                  currentUnitIndex === index
                    ? "w-6 opacity-100"
                    : "w-2 opacity-50 hover:opacity-75"
                }`}
                onClick={() => setCurrentUnit(index)}
                aria-label={`Aller à l'unité ${index + 1}`}
              />
            ))}
          </ul>
        </div>
      )}

      <AnimatePresence>
        <motion.div
          key={currentUnit + "-image"}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="absolute max-md:hidden pointer-events-none"
          style={{
            width: `${currentUnitData.imageWidth || 150}px`,
            height: "auto",
            right: currentUnitData.position?.right || "20px",
            bottom: currentUnitData.position?.bottom || "10px",
            zIndex: 1,
          }}
        >
          {typeof currentUnitData.image === "string" ? (
            // For external images like the pneumology module
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUnitData.image}
              alt={`Icône ${currentUnitData.title}`}
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          ) : (
            // For imported SVG/images
            <Image
              src={currentUnitData.image}
              alt={`Icône ${currentUnitData.title}`}
              width={currentUnitData.imageWidth || 150}
              height={currentUnitData.imageWidth || 150}
              style={{ display: "block", width: "100%", height: "auto" }}
              priority={currentUnitIndex < 3}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Units;
