"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaFileUpload,
  FaBug,
  FaExclamationTriangle,
  FaArrowRight,
  FaListAlt,
  FaSpinner,
} from "react-icons/fa";
import { BsShieldCheck, BsLightbulb } from "react-icons/bs";
import Dash_Header from "@/components/dashboard/Dash_Header";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";
import Link from "next/link";
import Image from "next/image";

const ReportPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "MCQ_ERROR",
    severity: "MEDIUM",
  });
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  const reportCategories = [
    "SIGNUP_ERROR",
    "VERIFICATION_ERROR",
    "SET_PROFILE_ERROR",
    "DATA_ERROR",
    "MCQ_ERROR",
    "INCORRECT_ANSWER",
    "INAPPROPRIATE_CONTENT",
    "DUPLICATE_CONTENT",
    "WRONG_DIFFICULTY",
    "OTHER",
  ];

  const reportSeverities = ["LOW", "MEDIUM", "HIGH"];

  const reportTips = [
    "Soyez précis dans votre description pour nous aider à résoudre le problème rapidement.",
    "Une capture d'écran peut aider considérablement à comprendre le problème.",
    "Indiquez les étapes pour reproduire le problème si possible.",
  ];

  useEffect(() => {
    // Just set loading to false since we're not fetching reports on this page anymore
    setIsLoadingReports(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);

      // Create preview URL for the image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category.toLowerCase()); // Convert to lowercase
      data.append("severity", formData.severity.toLowerCase()); // Convert to lowercase

      if (screenshot) {
        data.append("screenshot", screenshot);
      }

      const response = await BaseUrl.post("/report", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        // Show success message in UI
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "MCQ_ERROR",
          severity: "MEDIUM",
        });
        setScreenshot(null);
        setPreviewUrl(null);

        // Show improved toast message with more details
        toast.success(
          "Votre rapport a été soumis avec succès!"
        );
      }
    } catch (error) {
      console.error("Error submitting report:", error);

      // More descriptive error message including API response if available
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        const errorMessages = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(", ")
          : error.response.data.message;
        toast.error(`Erreur: ${errorMessages}`);
      } else {
        toast.error(
          "Une erreur est survenue lors de la soumission de votre rapport."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingReports) {
    return <Loading />;
  }

  return (
    <div className="bg-[#F7F8FA] pb-10 min-h-screen">
      <Dash_Header />
      <div className="container mx-auto px-5 mt-4 max-md:mt-0 max-xl:mt-8">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              Signaler un problème
            </h1>
            <p className="text-gray-600">
              Aidez-nous à améliorer votre expérience en signalant les problèmes
              rencontrés
            </p>
          </div>
          <Link
            href="/dashboard/report/myReport"
            className="flex items-center gap-2 bg-white text-[#F8589F] px-5 py-3 rounded-lg border border-[#F8589F] hover:bg-[#F8589F] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg mt-4 md:mt-0"
          >
            <FaListAlt /> Voir mes rapports <FaArrowRight className="text-sm" />
          </Link>
        </div>

        {/* Main Report Form - Now takes full width */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#F8589F] to-[#FF6CAD] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-1 flex items-center">
                  <FaBug className="mr-2" /> Nouveau rapport
                </h2>
                <p className="text-sm opacity-90">
                  Tous les champs marqués d&apos;un astérisque (*) sont
                  obligatoires
                </p>
              </div>
              <div className="hidden md:block">
                <BsShieldCheck className="text-4xl opacity-80" />
              </div>
            </div>
          </div>

          <div className="p-8">
        
            <div className="bg-[#FFF5F9] rounded-lg p-5 mb-8 border-l-4 border-[#F8589F]">
              <h3 className="font-medium text-gray-800 flex items-center mb-3">
                <BsLightbulb className="mr-2 text-[#F8589F]" /> Conseils pour un
                rapport efficace
              </h3>
              <ul className="space-y-2">
                {reportTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#F8589F] text-white text-xs mr-2 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-600 text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 max-w-5xl mx-auto"
            >
              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="title"
                >
                  Titre*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#F8589F] focus:border-transparent transition duration-200"
                  required
                  placeholder="Brève description du problème"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="category"
                  >
                    Catégorie*
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="appearance-none block w-full bg-white border border-gray-300 rounded-md py-3 px-4 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F8589F] focus:border-transparent transition duration-200"
                      required
                    >
                      {reportCategories.map((category) => (
                        <option key={category} value={category}>
                          {category.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="severity"
                  >
                    Sévérité*
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {reportSeverities.map((severity) => (
                      <label
                        key={severity}
                        className={`flex items-center cursor-pointer p-3 rounded-md border transition-colors duration-200 ${
                          formData.severity === severity
                            ? "bg-[#FFF5F9] border-[#F8589F] shadow-sm"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="severity"
                          value={severity}
                          checked={formData.severity === severity}
                          onChange={handleChange}
                          className="form-radio h-5 w-5 text-[#F8589F] focus:ring-[#F8589F]"
                        />
                        <span
                          className={`ml-2 font-medium ${
                            severity === "LOW"
                              ? "text-yellow-500"
                              : severity === "MEDIUM"
                              ? "text-orange-500"
                              : "text-red-500"
                          }`}
                        >
                          {severity === "LOW"
                            ? "FAIBLE"
                            : severity === "MEDIUM"
                            ? "MOYEN"
                            : "ÉLEVÉ"}
                        </span>
                        <FaExclamationTriangle
                          className={`ml-1 ${
                            severity === "LOW"
                              ? "text-yellow-500"
                              : severity === "MEDIUM"
                              ? "text-orange-500"
                              : "text-red-500"
                          }`}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="description"
                >
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#F8589F] focus:border-transparent transition duration-200"
                  rows="5"
                  required
                  placeholder="Veuillez fournir des informations détaillées sur le problème"
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="screenshot"
                >
                  Capture d&apos;écran
                </label>
                <div className="mt-2">
                  <label
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                      previewUrl ? "border-[#F8589F]" : "border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {previewUrl ? (
                        <div className="flex flex-col items-center">
                          <Image
                            src={previewUrl}
                            alt="Aperçu"
                            width={150}
                            height={96}
                            className="h-24 object-contain mb-2 w-auto"
                            unoptimized
                          />
                          <p className="text-sm text-gray-500">
                            Image sélectionnée
                          </p>
                        </div>
                      ) : (
                        <>
                          <FaFileUpload className="w-10 h-10 mb-3 text-[#F8589F]" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold text-[#F8589F]">
                              Cliquez pour importer
                            </span>{" "}
                            ou glissez-déposez
                          </p>
                          <p className="text-xs text-gray-500">
                            SVG, PNG, JPG ou GIF (Max. 10MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      id="screenshot"
                      name="screenshot"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshot(null);
                      setPreviewUrl(null);
                    }}
                    className="mt-2 text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    Supprimer l&apos;image
                  </button>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="relative overflow-hidden bg-gradient-to-r from-[#F8589F] to-[#FF6CAD] hover:from-[#FF6CAD] hover:to-[#F8589F] text-white font-bold py-4 px-6 rounded-lg w-full transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F8589F] disabled:opacity-70 group"
                  disabled={loading}
                >
                  <div className="relative z-10 flex items-center justify-center">
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-3 h-5 w-5" />
                        Soumission en cours...
                      </>
                    ) : (
                      <>Soumettre le rapport</>
                    )}
                  </div>
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
