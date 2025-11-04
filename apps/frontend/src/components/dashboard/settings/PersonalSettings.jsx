"use client";

import Image from "next/image";
import edit from "../../../../public/settings/edit.svg";
import backgroundProfile from "../../../../public/settings/background_profile.avif";
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
      if (!token) return null;
      try {
        const response = await BaseUrl.get("/user/subscription/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data.data || null;
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userData?.name || "");

  const updateNameMutation = useMutation({
    mutationFn: async (newName) => {
      const token = secureLocalStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");
      const response = await BaseUrl.patch(
        "/user",
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      toast.success("Nom mis à jour avec succès !");
      onNameUpdate(data?.name || name);
      if (data?.name) setName(data.name);
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Échec de la mise à jour du nom. Veuillez réessayer.",
        { id: "name-error" }
      );
      setName(userData?.name || "");
    },
  });

  const handleEditClick = () => {
    setName(userData?.name || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(userData?.name || "");
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Le nom ne peut pas être vide", { id: "empty-name" });
      return;
    }
    if (trimmedName === userData?.name) {
      setIsEditing(false);
      return;
    }
    updateNameMutation.mutate(trimmedName);
  };

  return (
    <div className="relative bg-[#FFFFFF] box rounded-[16px] my-8 overflow-hidden">
      <Image
        src={backgroundProfile}
        alt="arrière-plan du profil"
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        className="object-cover"
      />
      <div className="relative h-[140px] max-md:h-[110px] mt-2">
        <div className="absolute bottom-0 left-0 px-6 pb- w-full z-10 bg-gradient-to-t from-white via-white/80 to-transparent">
          <div className="flex justify-between items-end">
            <div className="flex items-center">
              <Image
                src={userData?.avatar || "/default_avatar.png"}
                width={70}
                height={70}
                alt="photo de profil"
                className="w-[60px] h-[60px] md:w-[70px] md:h-[70px] border-2 border-white bg-gray-200"
                style={{ objectFit: "cover" }}
              />
              <div className="ml-4">
                <div className="text-[#191919] text-[15px] font-[500] line-clamp-1">
                  {isEditing ? name : userData?.name || "Non renseigné"}
                </div>
                <div className="text-[#B5BEC6] text-[14px]">
                  Plan {subscriptionData?.plan?.name || "Gratuit"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 border border-[#F8589F] px-3 py-[3px] rounded-[16px] bg-white hover:bg-pink-50 transition duration-150 disabled:opacity-50"
                    disabled={
                      updateNameMutation.isLoading ||
                      !name.trim() ||
                      name === userData?.name
                    }
                  >
                    <span className="text-[13px] text-[#F8589F]">
                      {updateNameMutation.isLoading
                        ? "Enreg..."
                        : "Enregistrer"}
                    </span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1 border border-gray-300 px-3 py-[3px] rounded-[16px] bg-white hover:bg-gray-100 transition duration-150"
                    disabled={updateNameMutation.isLoading}
                  >
                    <span className="text-[13px] text-gray-600">Annuler</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-1 border border-[#F8589F] px-3 py-[3px] rounded-[16px] bg-white hover:bg-pink-50 transition duration-150"
                >
                  <span className="text-[13px] text-[#F8589F]">Modifier</span>
                  <Image src={edit} alt="" className="w-[11px]" />
                </button>
              )}
            </div>
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
            <label
              htmlFor="fullNameInput"
              className="block text-[#F8589F] text-[14px] font-[500] mb-2"
            >
              Nom complet
            </label>
            {isEditing ? (
              <input
                id="fullNameInput"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-[20px] py-[6px] rounded-[16px] outline-none border border-gray-300 text-[13px] text-[#191919] focus:border-[#F8589F] focus:ring-1 focus:ring-[#F8589F]"
                disabled={updateNameMutation.isLoading}
              />
            ) : (
              <div className="text-[13px] text-[#191919] mt-1 py-[7px]">
                {userData?.name || (
                  <span className="text-gray-400">Non renseigné</span>
                )}
              </div>
            )}
          </div>

          <div className="flex-1">
            <label
              htmlFor="emailInput"
              className="block text-[#F8589F] text-[14px] font-[500] mb-2"
            >
              Email
            </label>
            {/* Conditionally render input or div for Email based on isEditing */}
            {isEditing ? (
              <input
                id="emailInput"
                type="email"
                value={userData?.email || ""}
                disabled // Always disabled when in input mode
                readOnly // Always readOnly
                className="w-full px-[20px] py-[6px] rounded-[16px] border border-gray-300 text-[13px] text-gray-500 bg-gray-100 cursor-not-allowed"
              />
            ) : (
              <div className="text-[13px] text-[#191919] mt-1 py-[7px]">
                {userData?.email || (
                  <span className="text-gray-400">Non renseigné</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
