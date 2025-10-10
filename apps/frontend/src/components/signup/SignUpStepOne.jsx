"use client";

import { useState } from "react";
import Image from "next/image";
import GoogleAuthButton from "@/app/comp/google-auth.button";
import user from "../../../public/auth/user.svg";

const availableAvatars = [
  "https://res.cloudinary.com/dgxaezwuv/image/upload/v1743743159/avatar1_og7rir.avif",
  "https://res.cloudinary.com/dgxaezwuv/image/upload/v1743743159/avatar2_uxgwcx.avif",
  "https://res.cloudinary.com/dgxaezwuv/image/upload/v1743743159/avatar3_mowefs.avif",
  "https://res.cloudinary.com/dgxaezwuv/image/upload/v1743743159/avatar4_jzlekp.avif",
  "https://res.cloudinary.com/dgxaezwuv/image/upload/v1743743160/avatar5_v7im21.avif",
  "https://res.cloudinary.com/dgxaezwuv/image/upload/v1743743160/avatar6_humb1r.avif",
  "https://res.cloudinary.com/dgxaezwuv/image/upload/v1743743160/avatar7_lasaaw.avif",
];

const SignUpStepOne = ({
  setStep,
  setUserName,
  user_name,
  selectedAvatar,
  setSelectedAvatar,
}) => {
  const handleAvatarSelect = (avatarSrc) => {
    setSelectedAvatar(avatarSrc);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const avatarSizeClass = "w-[70px] h-[70px]";

  const maskStyle = {
    maskImage: "linear-gradient(to bottom, transparent 0%, black 50%)",
    WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 50%)",
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {" "}
      {/* <div className="w-[567.09px] flex items-center justify-center bg-transparent max-md:w-full">
        <GoogleAuthButton />
      </div> */}
      <span className="relative w-[567.09px] my-2 flex items-center justify-center text-[#6C727580] text-[13px] after:bg-[#6C727580] after:absolute after:w-[260px] after:left-0 after:h-[1px] after:top-[50%] after:translate-y-[-50%] before:bg-[#6C727580] before:absolute before:w-[260px] before:right-0 before:h-[1px] before:top-[50%] before:translate-y-[-50%] max-md:w-full max-md:after:w-[42%] max-md:before:w-[42%]">
        OU
      </span>
      <form
        className="w-[567.09px] flex flex-col items-center gap-4 max-md:gap-3 max-md:w-full"
        onSubmit={handleSubmit}
      >
        <div className="w-full flex flex-col gap-2 pb-[12px]">
          <label className="text-[#191919] text-[15px] font-medium mb-1 max-md:mb-0">
            Avatar
          </label>
          <div className="w-full pl-[2px] flex flex-wrap justify-center gap-[7px] max-md:overflow-x-auto scrollbar-hide max-md:flex-nowrap max-md:justify-start max-md:[-webkit-overflow-scrolling:touch] max-md:scrollbar-hide max-md:py-1">
            {availableAvatars.map((avatarSrc, index) => {
              const isSelected = selectedAvatar === avatarSrc;
              return (
                <div
                  key={index}
                  onClick={() => handleAvatarSelect(avatarSrc)}
                  className={`group relative cursor-pointer p-[2px] rounded-[18px] transition-all duration-200 ease-in-out hover:scale-105 flex-shrink-0
                    ${isSelected ? "bg-[#FD2E81]" : "bg-transparent"}`}
                >
                  <div
                    className={`relative bg-white rounded-[16px] overflow-hidden ${avatarSizeClass}`}
                  >
                    <Image
                      src={avatarSrc}
                      alt={`Avatar ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 10vw, 68px"
                      className="object-cover"
                      priority={index < 3}
                    />
                    {isSelected && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-[60%] pointer-events-none"
                        style={maskStyle}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-[#FD2E8A]/20 to-[#FD2E8A]/90 backdrop-blur-[4px] rounded-b-[16px]"></div>
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-[calc(100%-12px)]">
                          <span className="block text-white text-[8px] font-bold tracking-wide uppercase text-center">
                            Sélectionné
                          </span>
                        </div>
                      </div>
                    )}
                    {!isSelected && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-[60%] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"
                        style={maskStyle}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-[#FD2E8A]/10 to-[#FD2E8A]/70 backdrop-blur-[4px] rounded-b-[16px]"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="full_name"
            className="text-[#191919] text-[15px] font-medium"
          >
            Nom complet
          </label>
          <div className="bg-[#FFF] w-full flex items-center gap-4 px-[16px] py-[12px] rounded-[12px] border border-[#E4E4E4]">
            <Image src={user} alt="Icône utilisateur" width={20} height={20} />
            <input
              type="text"
              id="full_name"
              placeholder="Entrez votre nom complet"
              className="text-[#666666] text-[14px] bg-transparent outline-none w-full"
              value={user_name}
              onChange={(e) => setUserName(e.target.value)}
              required
              aria-required="true"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] text-[#FEFEFE] text-[15px] w-full py-[12px] rounded-[12px] font-medium mt-4 hover:opacity-95 transition-opacity duration-150 disabled:opacity-60"
          disabled={!user_name || !selectedAvatar}
        >
          Continuer
        </button>
      </form>
    </div>
  );
};

export default SignUpStepOne;
