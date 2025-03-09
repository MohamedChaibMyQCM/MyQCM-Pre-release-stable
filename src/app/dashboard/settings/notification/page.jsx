"use client";

import Image from "next/image";
import notification from "../../../../../public/settings/notification.svg";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Page = () => {
  const [isSwitchOn, setIsSwitchOn] = useState(true);

  const [isOptionOneChecked, setIsOptionOneChecked] = useState(false);
  const [isOptionTwoChecked, setIsOptionTwoChecked] = useState(false);
  const [isOptionThreeChecked, setIsOptionThreeChecked] = useState(false);

  const toggleRadio = (setter, currentValue) => {
    setter(!currentValue);
  };

  return (
    <div className="mx-5 bg-[#FFFFFF] py-5 px-6 mt-12 rounded-[16px] box">
      <h3 className="text-[#191919] font-[500] mb-1">Email notifications</h3>
      <p className="text-[#666666] text-[13.6px]">
        Email notifications are enabled now, but you can disable them anytime.
      </p>
      <form className="mt-6">
        <div className="flex items-center space-x-2">
          <Switch
            checked={isSwitchOn}
            onCheckedChange={(checked) => setIsSwitchOn(checked)}
            className={`switch ${isSwitchOn ? "!bg-[#FF6EAF]" : "!bg-[grey]"}`}
          />
          <Label htmlFor="email-notifications">On</Label>
        </div>
        <div className="flex space-x-4 mt-12">
          <button
            type="button"
            onClick={() =>
              toggleRadio(setIsOptionOneChecked, isOptionOneChecked)
            }
            className={`w-5 h-5 rounded-full border-2 border-[#FF6EAF] cursor-pointer transition-colors ${
              isOptionOneChecked
                ? "bg-[#FF6EAF] border-[#FF6EAF]"
                : "bg-transparent"
            }`}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="option-one" className="text-[#191919] font-[500]">
              News and updates
            </Label>
            <span className="text-[13.6px] text-[#B5BEC6]">
              Receive email notifications whenever there are updates and news.
            </span>
          </div>
        </div>
        <div className="flex space-x-4 mt-12">
          <button
            type="button"
            onClick={() =>
              toggleRadio(setIsOptionTwoChecked, isOptionTwoChecked)
            }
            className={`w-5 h-5 rounded-full border-2 border-[#FF6EAF] cursor-pointer transition-colors ${
              isOptionTwoChecked
                ? "bg-[#FF6EAF] border-[#FF6EAF]"
                : "bg-transparent"
            }`}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="option-two" className="text-[#191919] font-[500]">
              Learning reminders
            </Label>
            <span className="text-[13.6px] text-[#B5BEC6]">
              Receive email reminders to stay on track with your learning.
            </span>
          </div>
        </div>
        <div className="flex space-x-4 mt-12">
          <button
            type="button"
            onClick={() =>
              toggleRadio(setIsOptionThreeChecked, isOptionThreeChecked)
            }
            className={`w-5 h-5 rounded-full border-2 border-[#FF6EAF] cursor-pointer transition-colors ${
              isOptionThreeChecked
                ? "bg-[#FF6EAF] border-[#FF6EAF]"
                : "bg-transparent"
            }`}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="option-three" className="text-[#191919] font-[500]">
              Subscription
            </Label>
            <span className="text-[13.6px] text-[#B5BEC6]">
              Receive email updates about your subscription, including important
              news and billing.
            </span>
          </div>
        </div>
        <div className="flex justify-end mt-12">
          <button
            type="submit"
            className="bg-[#F8589F] text-[#FFFFFF] px-5 py-2 rounded-[16px] text-[13px] font-[500]"
          >
            Save Changes
          </button>
        </div>
      </form>
      <Image src={notification} alt="password" className="mx-auto mt-16" />
    </div>
  );
};

export default Page;