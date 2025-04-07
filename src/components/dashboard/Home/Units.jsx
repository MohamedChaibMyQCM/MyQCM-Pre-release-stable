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

const Units = () => {
  const [currentUnit, setCurrentUnit] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  const {
    data: units,
    isLoading: isUnitsLoading,
    error: unitsError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      try {
        const token = secureLocalStorage.getItem("token");
        const response = await BaseUrl.get("/unit/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data?.data?.data || [];
      } catch (err) {
        toast.error(
          "Échec de la récupération des unités. Veuillez réessayer plus tard."
        );
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const unitsData = [
    {
      id: "08d2c45d-288c-468b-a12c-687420f4e4f8",
      title: "Unité 01 : Cardio-respiratoire et Psychologie Médicale",
      description:
        "Explorez la relation entre les systèmes cardiovasculaire et respiratoire ainsi que les aspects psychologiques des soins médicaux. Cette unité comprend cinq modules : sémiologie, physiopathologie, radiologie, biochimie et psychologie médicale, offrant une compréhension complète de leur impact sur la santé et le traitement des patients.",
      startColor: "#F43A5D",
      endColor: "#F8589F",
      image: unit1,
      imageWidth: 220,
      position: { right: "2px", bottom: "-40px" },
    },
    {
      id: "22b66563-bd6d-404d-a4a2-f2061b0b751d",
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
      id: "bc602e71-b043-47d2-b2e5-b8f59252b12a",
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
      id: "84d4c4c5-1f58-494d-a426-7a2d1a7b0e0f",
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
      id: "9b8c9609-2253-4862-9df3-c43892dd5c7b",
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
      id: "9b8c9609-2253-4862-9df3-c43892dd5c7b",
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
      id: "9b8c9609-2253-4862-9df3-c43892dd5c7b",
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
      id: "9b8c9609-2253-4862-9df3-c43892dd5c7b",
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
      id: "9b8c9609-2253-4862-9df3-c43892dd5c7b",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUnit((prev) => (prev === unitsData.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentUnitData = unitsData[currentUnit];
  const gradientStyle = {
    background: `linear-gradient(to right, ${currentUnitData.startColor}, ${currentUnitData.endColor})`,
  };

  return (
    <div
      className="relative w-full h-[180px] p-6 py-4 rounded-[20px] overflow-hidden transition-all duration-500 max-md:px-4"
      style={gradientStyle}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentUnit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="max-md:text-center max-w-[90%] max-md:max-w-full"
        >
          <h2 className="text-[#FFFFFF] text-[18px] font-[500] mt-1">
            {currentUnitData.title}
          </h2>
          <p className="text-[13px] text-[#FFFFFF] mt-3 mb-8 font-[400] w-[80%]">
            {currentUnitData.description.slice(0, 200)}...
          </p>
          <div className="flex items-center gap-5 max-md:flex-col">
            <button className="flex items-center gap-2 text-[#FFFFFF] bg-[#191919] rounded-[20px] px-5 py-[6px] text-[13px] font-[500]">
              Commencer l'unité <Image src={play} alt="play" />
            </button>
            <div className="relative">
              <button
                className="text-[13px] text-[#FFFFFF] font-[500] leading-5 tracking-[0.14px] underline"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                Simulation rapide d'examen
              </button>
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#333] text-white text-xs rounded-md whitespace-nowrap shadow-lg z-10">
                  <div className="relative">
                    <span>
                      Fonctionnalité à venir dans une prochaine mise à jour
                    </span>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#333]"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center">
        <ul className="flex gap-2 items-center">
          {unitsData.map((_, index) => (
            <li
              key={index}
              className={`h-2 rounded-full bg-white cursor-pointer transition-all duration-300 ${
                currentUnit === index ? "w-6 opacity-100" : "w-2 opacity-50"
              }`}
              onClick={() => setCurrentUnit(index)}
            />
          ))}
        </ul>
      </div>

      <Image
        src={currentUnitData.image}
        alt={`Unit ${currentUnit + 1} icon`}
        className="absolute max-md:hidden transition-all duration-300"
        width={currentUnitData.imageWidth}
        height={currentUnitData.imageWidth}
        style={{
          width: `${currentUnitData.imageWidth}px`,
          right: currentUnitData.position.right,
          bottom: currentUnitData.position.bottom,
          position: "absolute",
        }}
      />
    </div>
  );
};

export default Units;
