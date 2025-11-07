"use client";

import Image from "next/image";
import notification from "../../../../../public/settings/notification.svg";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";

const Page = () => {
  const [isSwitchOn, setIsSwitchOn] = useState(true);
  const [isOptionOneChecked, setIsOptionOneChecked] = useState(false);
  const [isOptionTwoChecked, setIsOptionTwoChecked] = useState(false);
  const [isOptionThreeChecked, setIsOptionThreeChecked] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const { data: notificationData } = useQuery({
    queryKey: ["userNotificationToggle"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.get("/user/notification-settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    },
  });

  const updateNotificationSetting = useMutation({
    mutationFn: async (setting) => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.put(
        "/user/notification-settings/toggle",
        { setting },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Paramètres mis à jour avec succès !");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour des paramètres");
      console.error(error);
    },
  });

  useEffect(() => {
    if (notificationData) {
      setIsSwitchOn(notificationData.email_notifications);
      setIsOptionOneChecked(notificationData.news_and_updates);
      setIsOptionTwoChecked(notificationData.learning_reminders);
      setIsOptionThreeChecked(notificationData.subscription);
      setInitialData(notificationData);
    }
  }, [notificationData]);

  const hasChanges =
    initialData &&
    (isSwitchOn !== initialData.email_notifications ||
      isOptionOneChecked !== initialData.news_and_updates ||
      isOptionTwoChecked !== initialData.learning_reminders ||
      isOptionThreeChecked !== initialData.subscription);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;

    const updates = [];

    if (isSwitchOn !== initialData.email_notifications) {
      updates.push(
        updateNotificationSetting.mutateAsync("email_notifications")
      );
    }
    if (isOptionOneChecked !== initialData.news_and_updates) {
      updates.push(updateNotificationSetting.mutateAsync("news_and_updates"));
    }
    if (isOptionTwoChecked !== initialData.learning_reminders) {
      updates.push(updateNotificationSetting.mutateAsync("learning_reminders"));
    }
    if (isOptionThreeChecked !== initialData.subscription) {
      updates.push(updateNotificationSetting.mutateAsync("subscription"));
    }

    try {
      await Promise.all(updates);
      setInitialData({
        ...initialData,
        email_notifications: isSwitchOn,
        news_and_updates: isOptionOneChecked,
        learning_reminders: isOptionTwoChecked,
        subscription: isOptionThreeChecked,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres:", error);
    }
  };

  return (
    <div className="mx-5 bg-card py-5 px-6 mt-10 rounded-[16px] box border border-border shadow-[0px_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0px_2px_8px_rgba(0,0,0,0.3)] max-md:mt-6">
      <h3 className="text-card-foreground font-[500] mb-1">
        Notifications par email
      </h3>
      <p className="text-muted-foreground text-[13.6px]">
        Les notifications par email sont actuellement activées, mais vous pouvez
        les désactiver à tout moment.
      </p>
      <form onSubmit={handleSaveChanges} className="mt-6">
        <div className="flex items-center space-x-2">
          <Switch
            checked={isSwitchOn}
            onCheckedChange={(checked) => setIsSwitchOn(checked)}
            className={`switch ${isSwitchOn ? "!bg-[#FF6EAF]" : "!bg-[grey]"}`}
          />
          <Label htmlFor="email-notifications">Activé</Label>
        </div>
        <div className="flex space-x-4 mt-12">
          <button
            type="button"
            onClick={() => setIsOptionOneChecked(!isOptionOneChecked)}
            className={`w-5 h-5 rounded-full border-2 border-[#FF6EAF] cursor-pointer transition-colors ${
              isOptionOneChecked
                ? "bg-[#FF6EAF] border-[#FF6EAF]"
                : "bg-transparent"
            }`}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="option-one" className="text-card-foreground font-[500]">
              Actualités et mises à jour
            </Label>
            <span className="text-[13.6px] text-muted-foreground">
              Recevez des notifications par email pour les actualités et mises à
              jour.
            </span>
          </div>
        </div>
        <div className="flex space-x-4 mt-12">
          <button
            type="button"
            onClick={() => setIsOptionTwoChecked(!isOptionTwoChecked)}
            className={`w-5 h-5 rounded-full border-2 border-[#FF6EAF] cursor-pointer transition-colors ${
              isOptionTwoChecked
                ? "bg-[#FF6EAF] border-[#FF6EAF]"
                : "bg-transparent"
            }`}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="option-two" className="text-card-foreground font-[500]">
              Rappels d&apos;apprentissage
            </Label>
            <span className="text-[13.6px] text-muted-foreground">
              Recevez des rappels par email pour suivre votre progression.
            </span>
          </div>
        </div>
        <div className="flex space-x-4 mt-12">
          <button
            type="button"
            onClick={() => setIsOptionThreeChecked(!isOptionThreeChecked)}
            className={`w-5 h-5 rounded-full border-2 border-[#FF6EAF] cursor-pointer transition-colors ${
              isOptionThreeChecked
                ? "bg-[#FF6EAF] border-[#FF6EAF]"
                : "bg-transparent"
            }`}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="option-three" className="text-card-foreground font-[500]">
              Abonnement
            </Label>
            <span className="text-[13.6px] text-muted-foreground">
              Recevez des mises à jour sur votre abonnement, y compris les
              informations importantes et facturation.
            </span>
          </div>
        </div>
        <div className="flex justify-end mt-12">
          <button
            type="submit"
            className={`bg-[#F8589F] text-[#FFFFFF] px-5 py-2 rounded-[16px] text-[13px] font-[500] hover:bg-[#e04d8a] transition-colors ${
              !hasChanges ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!hasChanges || updateNotificationSetting.isPending}
          >
            {updateNotificationSetting.isPending
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
      <Image
        src={notification}
        alt="illustration notifications"
        className="mx-auto mt-16 max-md:w-[240px]"
      />
    </div>
  );
};

export default Page;
