// Example file path: app/coming-soon/page.js
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock } from "phosphor-react"; // Or keep your original SVG

const ComingSoonPage = () => {
  // Simplified animation for the main container
  const cardVariants = {
    hidden: { opacity: 0, y: 20 }, // Start slightly down and faded out
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }, // Smooth ease-out animation
    },
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-[#F7F8FA]">
      {" "}
      {/* Softer gradient */}
      <motion.div
        className="relative max-w-md w-full bg-white rounded-2xl p-8 md:p-10 shadow-xl overflow-hidden max-md:w-[97%]" // Adjusted size, padding, shadow
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Optional: Subtle corner shape */}
        {/* <div className="absolute -top-1 -right-1 w-16 h-16 bg-pink-100 rounded-bl-full opacity-50"></div> */}

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Icon */}
          <div className="inline-block bg-[#FD2E8A]/10 text-[#F8589F] p-4 rounded-full mb-6">
            {/* Using Phosphor React Icon */}
            <Clock size={48} weight="light" />
            {/* Or your original SVG: */}
            {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg> */}
          </div>

          {/* Text */}
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3">
            {" "}
            {/* Adjusted font weight */}
            Bientôt Disponible !
          </h1>
          <p className="text-gray-600 text-base md:text-lg mb-8">
            Nous préparons quelque chose de nouveau pour vous. Restez à
            l&apos;écoute !
          </p>

          {/* Simple Progress/Loading Indicator */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#FD2E8A] to-[#F8589F] rounded-full animate-pulse"></div>{" "}
            {/* Simple pulse animation */}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ComingSoonPage;
