"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useWhatsNew } from "../../hooks/useWhatsNew";
import { X, ChevronLeft, ChevronRight, Sparkles, CheckCircle } from "lucide-react";

const FeatureSlide = ({ feature, onTryIt, onMarkSeen }) => {
  const getMediaElement = () => {
    if (feature.media_type === "none" || !feature.media_url) {
      return (
        <div className="w-full h-64 bg-gradient-to-br from-[#F8589F]/20 to-[#FF3D88]/20 rounded-2xl flex items-center justify-center">
          <Sparkles className="w-20 h-20 text-[#F8589F]" />
        </div>
      );
    }

    if (feature.media_type === "image") {
      return (
        <img
          src={feature.media_url}
          alt={feature.title}
          className="w-full h-64 object-cover rounded-2xl"
        />
      );
    }

    if (feature.media_type === "video") {
      return (
        <video
          src={feature.media_url}
          poster={feature.thumbnail_url}
          className="w-full h-64 object-cover rounded-2xl"
          controls
          autoPlay
          muted
          loop
        />
      );
    }

    return null;
  };

  const getTypeBadge = () => {
    const badges = {
      major: { bg: "bg-gradient-to-r from-purple-500 to-pink-500", text: "Majeure", icon: "🚀" },
      minor: { bg: "bg-gradient-to-r from-blue-500 to-cyan-500", text: "Mineure", icon: "✨" },
      update: { bg: "bg-gradient-to-r from-green-500 to-emerald-500", text: "Mise à jour", icon: "🔄" },
      bugfix: { bg: "bg-gradient-to-r from-orange-500 to-yellow-500", text: "Correction", icon: "🐛" },
    };

    const badge = badges[feature.type] || badges.minor;

    return (
      <div className={`${badge.bg} text-white px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2`}>
        <span>{badge.icon}</span>
        <span>{badge.text}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Type badge */}
      <div className="mb-4">
        {getTypeBadge()}
      </div>

      {/* Media */}
      <div className="mb-6">
        {getMediaElement()}
      </div>

      {/* Version */}
      <div className="text-sm text-gray-500 mb-2">
        Version {feature.version} • {new Date(feature.release_date).toLocaleDateString("fr-FR")}
      </div>

      {/* Title */}
      <h3 className="text-3xl font-bold text-gray-800 mb-4">
        {feature.title}
      </h3>

      {/* Description */}
      <div
        className="text-gray-600 leading-relaxed mb-6 flex-grow overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: feature.description }}
      />

      {/* CTA */}
      {feature.cta_text && feature.cta_link && (
        <button
          onClick={() => onTryIt(feature)}
          className="w-full py-4 bg-gradient-to-r from-[#F8589F] to-[#FF3D88] text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>{feature.cta_text}</span>
          <span className="text-xl">→</span>
        </button>
      )}
    </div>
  );
};

export default function WhatsNewModal({ isOpen, onClose }) {
  const { newFeatures, markAsSeen, markAsTried, dismissFeature } = useWhatsNew();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || newFeatures.length === 0) return null;

  const currentFeature = newFeatures[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === newFeatures.length - 1;

  const handleNext = () => {
    if (!isLast) {
      markAsSeen(currentFeature.id);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirst) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTryIt = (feature) => {
    markAsTried(feature.id);
    if (feature.cta_link) {
      window.location.href = feature.cta_link;
    }
    if (isLast) {
      onClose();
    } else {
      handleNext();
    }
  };

  const handleSkipAll = () => {
    newFeatures.forEach((feature) => dismissFeature(feature.id));
    onClose();
  };

  const handleClose = () => {
    markAsSeen(currentFeature.id);
    if (isLast || newFeatures.length === 1) {
      onClose();
    } else {
      handleNext();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="glassmorphism-card rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-hidden relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              {/* Progress dots */}
              {newFeatures.length > 1 && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  {newFeatures.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "w-8 bg-gradient-to-r from-[#F8589F] to-[#FF3D88]"
                          : index < currentIndex
                          ? "w-2 bg-green-500"
                          : "w-2 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Feature content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FeatureSlide
                      feature={currentFeature}
                      onTryIt={handleTryIt}
                      onMarkSeen={() => markAsSeen(currentFeature.id)}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                {/* Previous button */}
                <button
                  onClick={handlePrevious}
                  disabled={isFirst}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isFirst
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Counter */}
                <div className="text-sm text-gray-600">
                  {currentIndex + 1} / {newFeatures.length}
                </div>

                {/* Skip all button */}
                {!isLast && (
                  <button
                    onClick={handleSkipAll}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Tout ignorer
                  </button>
                )}

                {/* Next button */}
                <button
                  onClick={isLast ? handleClose : handleNext}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isLast
                      ? "bg-gradient-to-r from-[#F8589F] to-[#FF3D88] text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {isLast ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <ChevronRight className="w-6 h-6" />
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
