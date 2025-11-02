"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";

const SoundToggle = ({ onToggle, onTest, className = "" }) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Load saved mute state
    const savedMuteState = localStorage.getItem("quizSoundsMuted");
    setIsMuted(savedMuteState === "true");
  }, []);

  const handleToggle = () => {
    const newMutedState = onToggle();
    setIsMuted(newMutedState);
  };

  const handleTest = (e) => {
    e.stopPropagation();
    if (onTest) {
      onTest();
    }
  };

  return (
    <div className="fixed bottom-[30px] left-[90px] flex gap-2 z-[60] max-md:bottom-[20px] max-md:left-[70px]">
      {/* Sound toggle button */}
      <motion.button
        onClick={handleToggle}
        className={`w-[44px] h-[44px] bg-white border-2 border-[#E9ECEF] rounded-full flex items-center justify-center hover:bg-[#F8F9FA] hover:border-[#F8589F] transition-all duration-200 shadow-lg group max-md:w-[40px] max-md:h-[40px] ${className}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={isMuted ? "Activer les sons" : "Désactiver les sons"}
      >
        {isMuted ? (
          <HiVolumeOff className="text-[#F8589F] text-[20px] group-hover:scale-110 transition-transform max-md:text-[18px]" />
        ) : (
          <HiVolumeUp className="text-[#F8589F] text-[20px] group-hover:scale-110 transition-transform max-md:text-[18px]" />
        )}
      </motion.button>

      {/* Test sound button */}
      {!isMuted && onTest && (
        <motion.button
          onClick={handleTest}
          className="w-[44px] h-[44px] bg-white border-2 border-[#E9ECEF] rounded-full flex items-center justify-center hover:bg-[#F8F9FA] hover:border-[#47B881] transition-all duration-200 shadow-lg group max-md:w-[40px] max-md:h-[40px]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Tester le son"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
        >
          <span className="text-[#47B881] text-[16px] font-bold group-hover:scale-110 transition-transform max-md:text-[14px]">
            🔔
          </span>
        </motion.button>
      )}
    </div>
  );
};

export default SoundToggle;
