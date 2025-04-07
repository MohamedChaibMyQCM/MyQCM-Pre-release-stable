"use client";

import Image from "next/image";
import background_profile from "../../../../public/settings/background_profile.avif";
import edit from "../../../../public/settings/edit.svg";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";

const ProfileSettings = ({ userData, onNameUpdate }) => {
  const { data: subscriptionData } = useQuery({
    queryKey: ["currentSubscription"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/user/subscription/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data || null;
    },
    staleTime: 1000 * 60 * 5,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userData?.name || "");

  const updateNameMutation = useMutation({
    mutationFn: async (newName) => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.patch(
        "/user",
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Nom mis à jour avec succès !");
      onNameUpdate(data.name);
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Échec de la mise à jour du nom. Veuillez réessayer.",
        { id: "name-error" }
      );
      setName(userData?.name || "");
    },
  });

  const handleEditClick = () => {
    setIsEditing(true);
    setName(userData?.name || "");
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Le nom ne peut pas être vide", { id: "empty-name" });
      return;
    }
    updateNameMutation.mutate(name);
  };

  return (
    <div className="relative bg-[#FFFFFF] box rounded-[16px] my-8 overflow-hidden">
      <Image
        src={background_profile}
        alt="arrière-plan du profil"
        className="absolute w-full top-[0px] max-md:top-[0px]"
      />

      <div className="relative h-[180px] max-md:h-[120px]">
        <div className="absolute bottom-0 left-0 px-6 pb-4 w-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image
                src={userData?.avatar}
                width={70}
                height={70}
                alt="photo de profil"
                className="w-[70px] max-md:w-[60px]"
              />
              <div className="ml-4">
                <div className="text-[#191919] text-[15px] font-[500]">
                  {userData?.name || "Non renseigné"}
                </div>
                <div className="text-[#B5BEC6] text-[14px]">
                  {subscriptionData?.plan?.name || "Gratuit"} Plan
                </div>
              </div>
            </div>

            <button
              onClick={isEditing ? handleSave : handleEditClick}
              className="flex items-center gap-1 border border-[#F8589F] px-3 py-[3px] rounded-[16px] bg-white"
              disabled={isEditing && updateNameMutation.isLoading}
            >
              <span className="text-[13px] text-[#F8589F]">
                {isEditing
                  ? updateNameMutation.isLoading
                    ? "Enregistrement..."
                    : "Enregistrer"
                  : "Modifier"}
              </span>
              {!isEditing && (
                <Image src={edit} alt="modifier" className="w-[11px]" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-[#191919] font-[500] mb-2 text-[17px]">
            Informations personnelles
          </h3>
          <p className="text-[#666666] text-[13px]">
            Gérez vos informations personnelles et mettez à jour vos coordonnées
            pour maintenir votre profil à jour.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="text-[#F8589F] text-[14px] font-[500] mb-2">
              Nom complet
            </div>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-[20px] py-[6px] rounded-[16px] outline-none border border-gray-300 text-[13px] text-[#191919]"
              />
            ) : (
              <div className="text-[13px] text-[#191919]">
                {userData?.name || "Non renseigné"}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="text-[#F8589F] text-[14px] font-[500] mb-2">
              Email
            </div>
            {isEditing ? (
              <input
                type="email"
                value={userData?.email || ""}
                disabled
                className="w-full px-[20px] py-[6px] rounded-[16px] border border-gray-300 text-[13px] text-[#191919] bg-gray-100 cursor-not-allowed"
              />
            ) : (
              <div className="text-[13px] text-[#191919]">
                {userData?.email || "Non renseigné"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
