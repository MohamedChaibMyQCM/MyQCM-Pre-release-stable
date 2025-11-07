// components/dashboard/settings/ActivationSuccessPopup.jsx
// (Use the code provided in the previous answer where we created this component -
// it correctly handles its own state, props, and animations)
"use client";

import React, { useState } from "react";
import { CheckCircle, X, Info } from "phosphor-react";
import { motion, AnimatePresence } from "framer-motion";

const ActivationSuccessPopup = ({ isOpen, onClose, planDetails }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null; // Don't render if not open

  // Animation Variants
  const backdrop = {
    visible: { opacity: 1 },
    hidden: { opacity: 0, transition: { when: "afterChildren" } },
  };

  const modal = {
    hidden: { y: "-50px", opacity: 0, scale: 0.95 },
    visible: {
      y: "0",
      opacity: 1,
      scale: 1,
      transition: { delay: 0.1, duration: 0.3, ease: "easeOut" },
    },
    exit: {
      y: "30px",
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const detailVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      transition: { duration: 0.2, ease: "easeIn" },
    },
    visible: {
      opacity: 1,
      height: "auto",
      marginTop: "1rem",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  // --- Plan Details Handling (Adapt based on actual API response) ---
  const planName = planDetails?.name || "Plan Activé";
  const planDuration = planDetails?.duration || "Durée Indéfinie";
  const planExpiry = planDetails?.expiryDate || null;
  // --- End Plan Details Handling ---

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      variants={backdrop}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-card rounded-2xl p-6 pt-8 max-w-sm w-full mx-auto shadow-xl relative overflow-hidden border border-border"
        variants={modal}
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-card-foreground p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          aria-label="Fermer"
        >
          <X size={20} weight="bold" />
        </button>

        {/* Icon and Title */}
        <div className="flex flex-col items-center text-center mt-2">
          <CheckCircle
            size={56}
            weight="fill"
            className="text-green-500 mb-3"
          />
          <h3 className="text-xl font-semibold text-card-foreground mb-2">
            Activation Réussie !
          </h3>
          <p className="text-muted-foreground text-sm mb-5 max-w-xs">
            Votre code a été activé avec succès.
          </p>
        </div>

        {/* Separator */}
        <hr className="my-4 border-border" />

        {/* Details Section Toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm font-medium text-[#F8589F] hover:text-[#e04287] transition-colors py-1"
            aria-expanded={showDetails}
          >
            {showDetails ? "Masquer les détails" : "Voir les détails du plan"}
          </button>

          {/* Animated Details */}
          <AnimatePresence mode="wait">
            {showDetails && (
              <motion.div
                key="plan-details-content"
                variants={detailVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="text-left text-sm text-card-foreground space-y-2 overflow-hidden"
              >
                <div className="bg-muted border border-border p-3 rounded-lg mt-3">
                  <p>
                    <strong className="font-medium text-card-foreground">
                      Forfait :
                    </strong>{" "}
                    {planName}
                  </p>
                  <p>
                    <strong className="font-medium text-card-foreground">
                      Durée activée :
                    </strong>{" "}
                    {planDuration}
                  </p>
                  {planExpiry && (
                    <p>
                      <strong className="font-medium text-card-foreground">
                        Expire le :
                      </strong>{" "}
                      {new Date(planExpiry).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Final Close Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] text-white px-8 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F8589F]"
          >
            Super !
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ActivationSuccessPopup;
