"use client";

import Image from "next/image";
import notification from "../../../../../public/settings/notification.svg";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Page = () => {
  // State for the Switch component
  const [isSwitchOn, setIsSwitchOn] = useState(true);

  // State for each independent RadioGroupItem
  const [isOptionOneChecked, setIsOptionOneChecked] = useState(false);
  const [isOptionTwoChecked, setIsOptionTwoChecked] = useState(false);

  // Toggle function for RadioGroupItem
  const toggleRadio = (setter, currentValue) => {
    setter(!currentValue);
  };

  return (
    <div className="mx-5 bg-[#FFFFFF] py-5 px-6 mt-12 rounded-[16px]">
      <h3 className="text-[#191919] font-[500] mb-1">Email notifications</h3>
      <p className="text-[#666666] text-[13.6px]">
        Email notifications are enabled now, but you can disable them anytime.
      </p>
      <div className="mt-6">
        {/* Switch Component */}
        <div className="flex items-center space-x-2">
          <Switch
            checked={isSwitchOn}
            onCheckedChange={(checked) => setIsSwitchOn(checked)}
            className={`switch ${isSwitchOn ? "!bg-[#FF6EAF]" : "!bg-[grey]"}`}
          />
          <Label htmlFor="email-notifications">On</Label>
        </div>

        {/* Independent RadioGroup for Option One */}
        <div className="flex items-center space-x-2 mt-4">
          <RadioGroup
            value={isOptionOneChecked ? "option-one" : ""}
            onValueChange={() =>
              toggleRadio(setIsOptionOneChecked, isOptionOneChecked)
            }
          >
            <RadioGroupItem
              value="option-one"
              id="option-one"
              className={`radio ${isOptionOneChecked ? "!bg-[#FF6EAF]" : ""}`}
            />
          </RadioGroup>
          <Label htmlFor="option-one">Option One</Label>
        </div>

        {/* Independent RadioGroup for Option Two */}
        <div className="flex items-center space-x-2 mt-4">
          <RadioGroup
            value={isOptionTwoChecked ? "option-two" : ""}
            onValueChange={() =>
              toggleRadio(setIsOptionTwoChecked, isOptionTwoChecked)
            }
          >
            <RadioGroupItem
              value="option-two"
              id="option-two"
              className={`radio ${isOptionTwoChecked ? "!bg-[#FF6EAF]" : ""}`}
            />
          </RadioGroup>
          <Label htmlFor="option-two">Option Two</Label>
        </div>
      </div>
      <Image src={notification} alt="password" className="mx-auto mt-8" />
    </div>
  );
};

export default Page;
