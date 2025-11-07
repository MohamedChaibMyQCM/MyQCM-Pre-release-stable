"use client";

import Image from "next/image";
import edit from "../../../../public/settings/edit.svg";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";

const UniversitySettings = ({ userData }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-card p-6 rounded-[16px] box border border-border shadow-[0px_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0px_2px_8px_rgba(0,0,0,0.3)]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="text-card-foreground font-[500] mb-1 text-[17px]">
            Informations académiques
          </h3>
          <p className="text-muted-foreground text-[13px]">
            Soumettez une demande pour mettre à jour vos informations
            universitaires
          </p>
        </div>
        {isEditing ? (
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-1 bg-[#F8589F] text-white px-3 py-[3px] rounded-[16px] h-fit"
          >
            <span className="text-[13px] h-[20px]">Fermer</span>
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 border border-[#F8589F] px-3 py-[3px] rounded-[16px] h-fit bg-card hover:bg-pink-50 dark:hover:bg-pink-950/30 transition duration-150"
          >
            <span className="text-[13px] text-[#F8589F] h-[16px]">
              Modifier
            </span>
            <Image src={edit} alt="modifier" className="w-[11px]" />
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-8 mt-8">
        <div className="flex flex-col md:flex-row gap-8">
          <li className="flex flex-col gap-2 w-[540px] max-md:w-full">
            <span className="text-[#F8589F] text-[14px] font-[500]">
              Université
            </span>
            {isEditing ? (
              <input
                type="text"
                value={userData?.university?.name || ""}
                disabled
                className="w-full px-[20px] py-[6px] mt-2 rounded-[16px] outline-none border border-border text-[13px] text-muted-foreground bg-muted cursor-not-allowed"
              />
            ) : (
              <span className="text-[13px] text-card-foreground">
                {userData?.university?.name || "Non renseigné"}
              </span>
            )}
          </li>
          <li className="flex flex-col gap-2 basis-[44.45%]">
            <span className="text-[#F8589F] text-[14px] font-[500]">
              Année d&apos;étude
            </span>
            {isEditing ? (
              <input
                type="text"
                value={userData?.year_of_study || ""}
                disabled
                className="w-full px-[20px] py-[6px] mt-2 rounded-[16px] outline-none border border-border text-[13px] text-muted-foreground bg-muted cursor-not-allowed"
              />
            ) : (
              <span className="text-[13px] text-card-foreground">
                {userData?.year_of_study || "Non renseigné"}
              </span>
            )}
          </li>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <li className="flex flex-col gap-2 basis-[45.45%]">
            <span className="text-[#F8589F] text-[14px] font-[500]">
              Unité actuelle
            </span>
            {isEditing ? (
              <input
                type="text"
                value={userData?.unit?.name || ""}
                disabled
                className="w-full px-[20px] py-[6px] mt-2 rounded-[16px] outline-none border border-border text-[13px] text-muted-foreground bg-muted cursor-not-allowed"
              />
            ) : (
              <span className="text-[13px] text-card-foreground">
                {userData?.unit?.name
                  ? userData.unit.name.length > 70
                    ? `${userData.unit.name.substring(0, 70)}...`
                    : userData.unit.name
                  : "Non renseigné"}
              </span>
            )}
          </li>
          <li className="flex flex-col gap-2 basis-[44.45%]">
            <span className="text-[#F8589F] text-[14px] font-[500]">
              Domaine d&apos;étude
            </span>
            {isEditing ? (
              <input
                type="text"
                value={userData?.study_field || ""}
                disabled
                className="w-full px-[20px] py-[6px] mt-2 rounded-[16px] outline-none border border-border text-[13px] text-muted-foreground bg-muted cursor-not-allowed"
              />
            ) : (
              <span className="text-[13px] text-card-foreground">
                {userData?.study_field || "Non renseigné"}
              </span>
            )}
          </li>
        </div>
      </ul>
      {isEditing && (
        <div className="mt-6 text-muted-foreground text-[13px]">
          Pour mettre à jour vos informations académiques, veuillez contacter le
          support.
        </div>
      )}
    </div>
  );
};

export default UniversitySettings;
