"use client";
import React, { useState } from "react";
import { X, Star, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import secureLocalStorage from "react-secure-storage";
import toast from "react-hot-toast";

const FeedbackPopup = ({ surveyType, onClose }) => {
  const [rating, setRating] = useState(0);
  const [binaryResponse, setBinaryResponse] = useState("");
  const [textResponse, setTextResponse] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const { mutate: submitSurvey, isLoading } = useMutation({
    mutationFn: async (surveyData) => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.post("/report", surveyData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Merci pour votre retour !");
      onClose();
    },
    onError: (error) => {
      toast.error("Erreur lors de l'envoi de votre retour.");
      console.error("Survey submission error:", error);
    },
  });

  const handleSubmit = () => {
    let surveyData = {};

    switch (surveyType) {
      case "IMG-CLARITY-10":
        if (rating === 0) {
          toast.error("Veuillez sélectionner une note.");
          return;
        }
        surveyData = {
          title: "Feedback sur la clarté des images",
          description: `Évaluation de la clarté des clichés radiologiques: ${rating}/5 (${
            [
              "Très flous",
              "Plutôt flous",
              "Acceptables",
              "Clairs",
              "Parfaitement nets",
            ][rating - 1]
          })`,
          category: "other",
          severity: "medium",
        };
        break;
      case "AI-LATENCY-30":
        if (!binaryResponse) {
          toast.error("Veuillez sélectionner une réponse.");
          return;
        }
        surveyData = {
          title: "Feedback sur la vitesse de correction",
          description: `La correction automatique est ${
            binaryResponse === "yes" ? "assez rapide" : "trop lente"
          } selon l'utilisateur`,
          category: "other",
          severity: "medium",
        };
        break;
      case "LEARN-USEFUL-FIN":
        if (rating === 0) {
          toast.error("Veuillez sélectionner une note.");
          return;
        }
        const comment = textResponse.trim()
          ? ` - Commentaire: ${textResponse.trim()}`
          : "";
        surveyData = {
          title: "Feedback sur l'utilité du feedback IA",
          description: `Utilité du feedback IA pour préparer l'examen: ${rating}/5 (${
            ["Pas du tout", "Peu", "Moyennement", "Beaucoup", "Énormément"][
              rating - 1
            ]
          })${comment}`,
          category: "other",
          severity: "medium",
        };
        break;
      case "UX-BUG-OPT":
        if (!textResponse.trim()) {
          toast.error("Veuillez décrire le problème.");
          return;
        }
        surveyData = {
          title: "Problème signalé par l'utilisateur",
          description: textResponse.trim(),
          category: "other",
          severity: "medium",
        };
        break;
      default:
        return;
    }

    submitSurvey(surveyData);
  };

  const getSurveyConfig = () => {
    switch (surveyType) {
      case "IMG-CLARITY-10":
        return {
          title: "Clarté des images",
          message: "Quelle est la clarté générale des clichés radiologiques ?",
          type: "rating",
          labels: [
            "Très flous",
            "Plutôt flous",
            "Acceptables",
            "Clairs",
            "Parfaitement nets",
          ],
        };
      case "AI-LATENCY-30":
        return {
          title: "Vitesse de correction",
          message:
            "La correction automatique apparaît-elle assez rapidement à votre goût ?",
          type: "binary",
        };
      case "LEARN-USEFUL-FIN":
        return {
          title: "Utilité du feedback IA",
          message:
            "Le feedback IA vous aide-t-il réellement à préparer l'examen pratique ?",
          type: "rating_with_text",
          labels: [
            "Pas du tout",
            "Peu",
            "Moyennement",
            "Beaucoup",
            "Énormément",
          ],
        };
      case "UX-BUG-OPT":
        return {
          title: "Signaler un problème",
          message: "Décrivez brièvement le problème rencontré",
          type: "text_only",
        };
      default:
        return null;
    }
  };

  const config = getSurveyConfig();
  if (!config) return null;

  const renderStarRating = () => (
    <div className="flex items-center gap-2 justify-center my-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none"
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(0)}
          onClick={() => setRating(star)}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hoveredStar || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  const renderBinaryChoice = () => (
    <div className="flex gap-4 justify-center my-4">
      <button
        type="button"
        className={`px-6 py-2 rounded-lg border transition-colors ${
          binaryResponse === "yes"
            ? "bg-green-500 text-white border-green-500"
            : "border-gray-300 hover:border-green-500"
        }`}
        onClick={() => setBinaryResponse("yes")}
      >
        Oui
      </button>
      <button
        type="button"
        className={`px-6 py-2 rounded-lg border transition-colors ${
          binaryResponse === "no"
            ? "bg-red-500 text-white border-red-500"
            : "border-gray-300 hover:border-red-500"
        }`}
        onClick={() => setBinaryResponse("no")}
      >
        Non
      </button>
    </div>
  );

  const renderTextInput = () => (
    <textarea
      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#F8589F] focus:border-transparent"
      rows={surveyType === "UX-BUG-OPT" ? 3 : 2}
      maxLength={surveyType === "UX-BUG-OPT" ? 250 : 80}
      placeholder={
        surveyType === "UX-BUG-OPT"
          ? "Décrivez le problème..."
          : "Commentaire (facultatif)..."
      }
      value={textResponse}
      onChange={(e) => setTextResponse(e.target.value)}
    />
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-[#F8589F] p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {config.title}
          </h3>
          <p className="text-gray-600 text-sm">{config.message}</p>
        </div>

        {config.type === "rating" && (
          <>
            {renderStarRating()}
            {config.labels && (
              <div className="text-xs text-gray-500 text-center mb-4">
                {rating > 0 && config.labels[rating - 1]}
              </div>
            )}
          </>
        )}

        {config.type === "binary" && renderBinaryChoice()}

        {config.type === "rating_with_text" && (
          <>
            {renderStarRating()}
            {config.labels && (
              <div className="text-xs text-gray-500 text-center mb-4">
                {rating > 0 && config.labels[rating - 1]}
              </div>
            )}
            <div className="mb-4">{renderTextInput()}</div>
          </>
        )}

        {config.type === "text_only" && (
          <div className="mb-4">{renderTextInput()}</div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-[#F8589F] text-[14px] rounded-[26px] text-white px-6 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPopup;
