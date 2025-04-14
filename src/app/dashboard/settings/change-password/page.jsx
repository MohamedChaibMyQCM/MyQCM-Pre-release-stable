"use client";

import Image from "next/image";
import password from "../../../../../public/settings/password.svg";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";
import secureLocalStorage from "react-secure-storage";
import { useRouter } from "next/navigation";

const PasswordChangeForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });
  const router = useRouter();

  const passwordMutation = useMutation({
    mutationFn: (data) => {
      const token = secureLocalStorage.getItem("token");
      return BaseUrl.put(
        "/user/change-password",
        {
          old_password: data.old_password,
          new_password: data.new_password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: (response) => {
      toast.success("Mot de passe modifié avec succès !");
      secureLocalStorage.removeItem("token");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Échec de la modification du mot de passe. Veuillez réessayer."
      );
    },
  });

  const onSubmit = (data) => {
    if (data.new_password !== data.confirm_password) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    passwordMutation.mutate(data);
  };

  return (
    <div className="mx-5 bg-[#FFFFFF] py-5 px-6 mt-10 rounded-[16px] box max-md:mt-4">
      <h3 className="text-[#191919] font-[500] mb-1">Nouveau mot de passe</h3>
      <p className="text-[#666666] text-[13.6px]">
        Mettez à jour votre mot de passe pour sécuriser votre compte. Choisissez
        un mot de passe fort et unique pour protéger vos informations et
        maintenir votre confidentialité.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
        <div className="flex flex-col mb-6 max-md:w-full">
          <span className="text-[#F8589F] text-[14px] mb-1">
            Mot de passe actuel
          </span>
          <input
            type="password"
            className="border border-[#E4E7EB] w-[48%] rounded-[16px] py-[6px] px-4 outline-none max-md:w-full"
            {...register("old_password", {
              required: "Le mot de passe actuel est requis",
              minLength: {
                value: 8,
                message: "Le mot de passe doit contenir au moins 8 caractères",
              },
            })}
          />
          {errors.old_password && (
            <span className="text-red-500 text-xs mt-1">
              {errors.old_password.message}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between max-md:flex-col max-md:gap-6">
          <div className="flex flex-col w-[48%] max-md:w-full">
            <span className="text-[#F8589F] text-[14px] mb-1">
              Nouveau mot de passe
            </span>
            <input
              type="password"
              className="border border-[#E4E7EB] w-[100%] rounded-[16px] py-[6px] px-4 outline-none max-md:w-full"
              {...register("new_password", {
                required: "Un nouveau mot de passe est requis",
                minLength: {
                  value: 8,
                  message:
                    "Le mot de passe doit contenir au moins 8 caractères",
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial",
                },
              })}
            />
            {errors.new_password && (
              <span className="text-red-500 text-xs mt-1">
                {errors.new_password.message}
              </span>
            )}
          </div>
          <div className="flex flex-col w-[48%] max-md:w-full">
            <span className="text-[#F8589F] text-[14px] mb-1">
              Confirmer le nouveau mot de passe
            </span>
            <input
              type="password"
              className="border border-[#E4E7EB] w-[100%] rounded-[16px] py-[6px] px-4 outline-none max-md:w-full"
              {...register("confirm_password", {
                required: "Veuillez confirmer votre nouveau mot de passe",
                validate: (value) =>
                  value === watch("new_password") ||
                  "Les mots de passe ne correspondent pas",
              })}
            />
            {errors.confirm_password && (
              <span className="text-red-500 text-xs mt-1">
                {errors.confirm_password.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-10 max-md:flex-col max-md:gap-6 max-md:mt-6">
          <span className="text-[#B5BEC6] text-[13px]">
            Vous devrez vous reconnecter avec votre nouveau mot de passe après
            avoir enregistré les modifications.
          </span>
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="bg-[#F8589F] text-[#FFFFFF] px-5 py-2 rounded-[16px] text-[13px] font-[500] max-md:self-end disabled:opacity-70"
          >
            {passwordMutation.isPending
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
      <Image
        src={password}
        alt="mot de passe"
        className="mx-auto mt-8 max-md:mt-10"
      />
    </div>
  );
};

export default PasswordChangeForm;
