"use client";

import Image from "next/image";
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
    <div className="bg-card box rounded-[16px] my-8 overflow-hidden border border-border shadow-[0px_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0px_2px_8px_rgba(0,0,0,0.3)]">
      <div className="relative h-[140px] max-md:h-[110px]">
        <Image
          src="/settings/background_profile.avif"
          alt="arrière-plan du profil"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-card via-card/70 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 px-6 pb-4 w-full z-10">
          <div className="flex justify-between items-end">
            <div className="flex items-center">
              <Image
                src={userData?.avatar || "/default_avatar.png"}
                width={70}
                height={70}
                alt="photo de profil"
                className="w-[60px] h-[60px] md:w-[70px] md:h-[70px] border-2 border-card bg-muted"
                style={{ objectFit: "cover" }}
              />
              <div className="ml-4">
                <div className="text-card-foreground text-[15px] font-[500] line-clamp-1">
                  {isEditing ? name : userData?.name || "Non renseigné"}
                </div>
                <div className="text-muted-foreground text-[14px]">
                  Plan {subscriptionData?.plan?.name || "Gratuit"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 border border-[#F8589F] px-3 py-[3px] rounded-[16px] bg-card hover:bg-pink-50 dark:hover:bg-pink-950/30 transition duration-150 disabled:opacity-50"
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
                    className="flex items-center gap-1 border border-border px-3 py-[3px] rounded-[16px] bg-card hover:bg-accent transition duration-150"
                    disabled={updateNameMutation.isLoading}
                  >
                    <span className="text-[13px] text-muted-foreground">Annuler</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-1 border border-[#F8589F] px-3 py-[3px] rounded-[16px] bg-card hover:bg-pink-50 dark:hover:bg-pink-950/30 transition duration-150"
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
          <h3 className="text-card-foreground font-[500] mb-2 text-[17px]">
            Informations personnelles
          </h3>
          <p className="text-muted-foreground text-[13px]">
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
                className="w-full px-[20px] py-[6px] rounded-[16px] outline-none border border-border bg-card text-[13px] text-card-foreground focus:border-[#F8589F] focus:ring-1 focus:ring-[#F8589F]"
                disabled={updateNameMutation.isLoading}
              />
            ) : (
              <div className="text-[13px] text-card-foreground mt-1 py-[7px]">
                {userData?.name || (
                  <span className="text-muted-foreground">Non renseigné</span>
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
                className="w-full px-[20px] py-[6px] rounded-[16px] border border-border text-[13px] text-muted-foreground bg-muted cursor-not-allowed"
              />
            ) : (
              <div className="text-[13px] text-card-foreground mt-1 py-[7px]">
                {userData?.email || (
                  <span className="text-muted-foreground">Non renseigné</span>
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
