"use client";

import React from "react";

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-200 ease-in-out">
      <div className="bg-white p-6 rounded-[16px] shadow-xl max-w-sm w-full mx-4 transform transition-all duration-200 ease-in-out scale-100 opacity-100">
        <h2 className="text-lg font-semibold mb-4 text-[#191919]">
          Confirmation de Déconnexion
        </h2>
        <p className="mb-6 text-[#324054]">
          Êtes-vous sûr de vouloir vous déconnecter ?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[15px] rounded-[24px] border border-gray-300 text-[#324054] hover:bg-gray-100 transition-colors duration-150"
            aria-label="Annuler la déconnexion"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-[15px] rounded-[24px] bg-[#F64C4C] text-white hover:bg-red-600 transition-colors duration-150"
            aria-label="Confirmer la déconnexion"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;