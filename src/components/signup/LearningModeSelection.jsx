"use client";

import Image from "next/image";
import bestFor from "../../../public/auth/bestFor.svg";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { CheckCircle } from "phosphor-react";

const LearningModeStep = ({ formData, onSubmit, onReturn }) => {
  const [selectedMode, setSelectedMode] = useState(null);

  const modes = [
    {
      id: "intelligent",
      title: "Intelligent Mode",
      subtitle: "Powered by Synergy",
      description:
        "In Intelligent Mode, Synergy – our advanced learning engine – personalizes your experience. It's like having a dedicated tutor who understands your strengths, weaknesses, and learning style. Synergy adapts in real-time, focusing on what you need to master, making every study session incredibly effective. It's the fastest way to build confidence and achieve true understanding.",
    },
    {
      id: "guided",
      title: "Guided Mode",
      subtitle: "Your Focus, Our AI",
      description:
        "In Guided Mode, you're in control of the direction, while still benefiting from Synergy's intelligent question selection. Perfect for when you want to focus on specific areas, like preparing for an upcoming exam or reinforcing your knowledge of a particular module. We'll help you make every minute count.",
    },
    {
      id: "custom",
      title: "Custom Mode",
      subtitle: "Craft Your Challenge",
      description:
        "Custom Mode is your playground for focused practice. Perfect for simulating exam conditions, testing your knowledge on specific topics, or challenging yourself with exactly the questions you want.",
    },
  ];

  useEffect(() => {
    // Set the first mode as selected by default when component mounts
    if (modes.length > 0 && !selectedMode) {
      setSelectedMode(modes[0].id);
    }
  }, []);

  const handleSubmit = () => {
    if (!selectedMode) {
      return;
    }
    onSubmit({ ...formData, learning_mode: selectedMode });
  };

  return (
    <div className="w-[100%] px-[40px] max-md:px-[20px] mt-8">
      <h2 className="text-[19px] font-[500] text-[#191919] mb-2">
        Choose your desired learning mode
      </h2>
      <p className="text-[#666666] mb-12 text-[13px]">
        Learning modes help you study smarter by adapting your sessions to your
        individual goals, needs, and preferences. Whether you&apos;re preparing
        for exams, revising challenging modules, or practicing clinical
        scenarios, MyQCM provides three distinct learning modes, each uniquely
        designed for medical students.
      </p>
      <div className="mt-12 rounded-[16px] relative">
        <form className="w-full">
          <div className="flex gap-6">
            {modes.map((mode, index) => (
              <div
                key={mode.id}
                className={`flex p-4 rounded-[8px] w-full border relative overflow-hidden ${
                  selectedMode === mode.id
                    ? "bg-[#FFF5FA] border-[#F8589F]"
                    : "border-[#E4E4E4] bg-white"
                } `}
              >
                <div className="flex flex-col">
                  <div className="flex gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMode(mode.id)}
                      className={`w-5 h-5 rounded-full mt-1 border-2 border-[#FF6EAF] cursor-pointer transition-colors ${
                        selectedMode === mode.id
                          ? "bg-[#FD2E8A] border-[#FD2E8A]"
                          : "bg-transparent"
                      }`}
                    />
                    <Label
                      htmlFor={mode.id}
                      className="text-[#191919] font-[500] text-[15px]"
                    >
                      {mode.title} <br />
                      <span className="text-[#FD2E8A]">{mode.subtitle}</span>
                    </Label>
                  </div>
                  <ul className="ml-8 flex flex-col gap-3 mb-5 mt-2">
                    <li className="flex items-center gap-2 text-[#191919] text-[14px]">
                      <CheckCircle size={18} className="text-[#47B881]" />
                      AI-Personalized Learning
                    </li>
                    <li className="flex items-center gap-2 text-[#191919] text-[14px]">
                      <CheckCircle size={18} className="text-[#47B881]" />
                      AI-Personalized Learning
                    </li>
                    <li className="flex items-center gap-2 text-[#191919] text-[14px]">
                      <CheckCircle size={18} className="text-[#47B881]" />
                      AI-Personalized Learning
                    </li>
                  </ul>
                  <div className="ml-8">
                    <span className="text-[#FD2E8A] font-[500] text-[16px]">
                      Best For{" "}
                    </span>
                    <ul className="flex flex-col gap-4 mt-3">
                      <li className="flex items-center gap-[9px] text-[#191919] text-[14px]">
                        <Image
                          src={bestFor}
                          alt="bestFor"
                          className="w-[18px]"
                        />
                        Exam preparation
                      </li>
                      <li className="flex items-center gap-[9px] text-[#191919] text-[14px]">
                        <Image
                          src={bestFor}
                          alt="bestFor"
                          className="w-[18px]"
                        />
                        Exam preparation
                      </li>
                      <li className="flex items-center gap-[9px] text-[#191919] text-[14px]">
                        <Image
                          src={bestFor}
                          alt="bestFor"
                          className="w-[18px]"
                        />
                        Exam preparation
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>

      <div className="flex items-center justify-end gap-10 mt-12 relative z-0">
        <button
          onClick={onReturn}
          className="text-[#F8589F] rounded-[10px] py-[8px] px-[50px] text-[15px] font-medium"
        >
          Retour
        </button>
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-t from-[#FD2E8A] to-[#F8589F] rounded-[10px] text-[#FFFFFF] py-[8px] px-[50px] text-[15px] font-medium"
        >
          Terminer
        </button>
      </div>
    </div>
  );
};

export default LearningModeStep;
