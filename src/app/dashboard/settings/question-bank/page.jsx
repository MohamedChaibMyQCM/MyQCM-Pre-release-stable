"use client";

import Path_Settings from "@/components/dashboard/settings/Path_Settings";
import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const Page = () => {
  const queryClient = useQueryClient();
  const [selectedMode, setSelectedMode] = useState(null);
  const router = useRouter()

  const {
    data: availableModes,
    isLoading: isLoadingModes,
    error: modesError,
  } = useQuery({
    queryKey: ["learningModes"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/mode", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data.data;
    },
  }); 

  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return response.data.data;
    },
    onError: (error) => {
      toast.error("Échec du chargement des paramètres de profil.");
    },
  });

  useEffect(() => {
    if (!isLoadingProfile && !isLoadingModes) {
      if (userProfile?.mode?.id) {
        setSelectedMode(userProfile.mode.id);
      }
      else if (availableModes?.length > 0) {
        setSelectedMode(availableModes[0].id);
      }
    }
  }, [userProfile, isLoadingProfile, availableModes, isLoadingModes]);

  const { mutate: updateProfile, isLoading: isUpdatingProfile } = useMutation({
    mutationFn: async (modeId) => {
      if (!modeId) throw new Error("Aucun mode sélectionné");
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.patch(
        "/user/profile",
        { mode: modeId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Mode d'apprentissage mis à jour !");
      router.push("/dashboard/question-bank")
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      toast.error("Échec de la mise à jour du mode. Veuillez réessayer.");
      console.error("Erreur de mise à jour du profil :", error);
    },
  });

  const handleStartSession = () => {
    if (selectedMode) {
      updateProfile(selectedMode);
    } else {
      toast.error("Veuillez d'abord sélectionner un mode d'apprentissage.");
    }
  };

  const isLoading = isLoadingModes || isLoadingProfile;

  return (
    <div className="px-6">
      <Path_Settings
        modes={availableModes}
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
        isLoading={isLoading}
      />

      {isLoading && (
        <div className="text-center mt-4">Chargement des paramètres...</div>
      )}
      {profileError && (
        <div className="text-center mt-4 text-red-500">
          Erreur lors du chargement du profil.
        </div>
      )}
      {modesError && (
        <div className="text-center mt-4 text-red-500">
          Erreur lors du chargement des modes.
        </div>
      )}

      {!isLoading && !profileError && !modesError && (
        <div className="mt-8 flex justify-end items-center gap-6">
          <button
            onClick={() => window.history.back()}
            className="text-[#F8589F] text-[13px] font-[500] hover:underline"
            disabled={isUpdatingProfile}
          >
            Retour
          </button>
          <button
            className="bg-[#F8589F] text-[#FFFFFF] px-5 py-2 rounded-[16px] text-[13px] font-[500] flex items-center justify-center gap-2 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleStartSession}
            disabled={!selectedMode || isUpdatingProfile}
          >
            {isUpdatingProfile ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              "Démarrer ma session !"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;
