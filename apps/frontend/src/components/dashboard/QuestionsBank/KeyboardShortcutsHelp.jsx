"use client";
import React from "react";
import Image from "next/image";
import exit from "../../../../public/Icons/exit.svg";
import { motion, AnimatePresence } from "framer-motion";

const KeyboardShortcutsHelp = ({ isOpen, onClose, questionType }) => {
  const shortcuts = [
    {
      keys: ["A", "B", "C", "D", "E"],
      description: "Sélectionner l'option correspondante",
      enabled: questionType === "qcm" || questionType === "qcs",
    },
    {
      keys: ["Enter"],
      description: "Vérifier / Voir explication / Confirmer",
      enabled: true,
    },
    {
      keys: ["S"],
      description: "Passer la question",
      enabled: true,
    },
    {
      keys: ["Escape"],
      description: "Annuler / Fermer popup",
      enabled: true,
    },
    {
      keys: ["?"],
      description: "Afficher/Masquer cette aide",
      enabled: true,
    },
  ];

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -50,
      transition: {
        duration: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed z-[70] h-screen w-screen left-0 top-0 flex items-center justify-center bg-[#00000060] backdrop-blur-sm p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-[24px] p-[32px] max-w-[500px] w-full shadow-2xl border border-[#E9ECEF] max-md:p-[24px]"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F1F3F4]">
              <div className="flex items-center gap-3">
                <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-[#F8589F] to-[#E74C8C] flex items-center justify-center shadow-lg">
                  <span className="text-white text-[18px] font-bold">⌨</span>
                </div>
                <h2 className="text-[18px] font-bold text-[#2C3E50]">
                  Raccourcis clavier
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-[36px] h-[36px] flex items-center justify-center rounded-[12px] hover:bg-[#F8F9FA] transition-colors"
              >
                <Image
                  src={exit}
                  alt="fermer"
                  width={20}
                  height={20}
                  className="opacity-60"
                />
              </button>
            </div>

            {/* Shortcuts list */}
            <motion.div className="flex flex-col gap-3">
              {shortcuts
                .filter((shortcut) => shortcut.enabled)
                .map((shortcut, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-[16px] rounded-[16px] bg-[#F8F9FA] hover:bg-[#F0F1F3] transition-all duration-200 border border-[#E9ECEF]"
                    variants={itemVariants}
                  >
                    <span className="text-[14px] text-[#2C3E50] font-medium flex-1">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-2">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <kbd className="min-w-[32px] h-[32px] px-[8px] flex items-center justify-center bg-white border-2 border-[#E9ECEF] rounded-[8px] text-[12px] font-bold text-[#F8589F] shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-[#ADB5BD] text-[11px] font-medium">
                              ou
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </motion.div>
                ))}
            </motion.div>

            {/* Footer tip */}
            <motion.div
              className="mt-6 pt-4 border-t border-[#F1F3F4]"
              variants={itemVariants}
            >
              <p className="text-[11px] text-[#6C757D] text-center leading-relaxed">
                💡 Astuce : Utilisez ces raccourcis pour naviguer plus
                rapidement dans votre session d&apos;entraînement
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsHelp;
