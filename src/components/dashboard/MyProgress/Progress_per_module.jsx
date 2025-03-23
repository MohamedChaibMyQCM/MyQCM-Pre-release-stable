"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const Progress_per_module = () => {
  return (
    <div className="flex-1">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Progress by Module
      </h3>
      <div className="bg-[#FFFFFF] rounded-[16px] py-4 box h-[390px]">
        <Card className="overflow-hidden border-none shadow-none">
          <CardContent>
            <div className="relative flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#F8589F"
                    strokeWidth="10"
                    strokeDasharray="282.6"
                    strokeDashoffset="141.3"
                    strokeLinecap="round"
                    transform="rotate(90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">50%</span>
                  <span className="text-yellow-500 text-sm">Fair</span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[14px] text-[#191919] font-[500]">
                    Cardio
                  </span>
                  <span className="text-[14px] text-[#191919] font-[500]">
                    90%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] h-2 rounded-full"
                    style={{ width: "90%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[14px] text-[#191919] font-[500]">
                    Chest Imaging
                  </span>
                  <span className="text-[14px] text-[#191919] font-[500]">
                    33%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] h-2 rounded-full"
                    style={{ width: "33%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[14px] text-[#191919] font-[500]">
                    Cardio
                  </span>
                  <span className="text-[14px] text-[#191919] font-[500]">
                    60%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] h-2 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[14px] text-[#191919] font-[500]">
                    Cardio
                  </span>
                  <span className="text-[14px] text-[#191919] font-[500]">
                    90%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] h-2 rounded-full"
                    style={{ width: "90%" }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress_per_module;