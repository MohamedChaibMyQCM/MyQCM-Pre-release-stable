"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const Performance = () => {
  return (
    <div className="flex-1">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Performance
      </h3>
      <div className="bg-[#FFFFFF] rounded-[16px] px-6 py-4 box h-[390px]">
        <Card className="border-none shadow-none">
          <CardContent>
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 200 200" width="200" height="200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#f0f0f0"
                  strokeWidth="20"
                />

                {/* Red portion (32%) */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#ff5252"
                  strokeWidth="20"
                  strokeDasharray="502.4"
                  strokeDashoffset="341.6"
                  transform="rotate(-90 100 100)"
                />

                {/* Pink portion */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#F8589F"
                  strokeWidth="20"
                  strokeDasharray="502.4"
                  strokeDashoffset="151.6"
                  strokeLinecap="round"
                  transform="rotate(25 100 100)"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">120</span>
                <span className="text-gray-400 text-sm">
                  Questions attempted
                </span>
                <span className="text-green-500 text-sm mt-1">
                  +3.4% from last month
                </span>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                <span className="text-sm">Incorrect answers</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
                <span className="text-sm">Correct answers</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Performance;
