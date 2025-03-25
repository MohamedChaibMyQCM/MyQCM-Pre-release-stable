"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Learning_calendar = () => {
  return (
    <div className="flex-1">
      <h3 className="font-[500] text-[17px] mb-4 text-[#191919]">
        Learning calendar
      </h3>
      <div className="bg-[#FFFFFF] rounded-[16px] py-6 box h-[300px]">
        <Card className="border-none shadow-none">
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
                <span>Interaction</span>
              </div>

              <div className="ml-auto flex items-center gap-4">
                <button className="p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide-chevron-left"
                  >
                    <path d="m15 18-6-6 6-6"></path>
                  </svg>
                </button>
                <span className="font-medium">29 January 2025</span>
                <button className="p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide-chevron-right"
                  >
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-16 text-right text-gray-500 text-sm pr-4">
                  2 PM
                </div>
                <div className="w-full border-t border-dashed border-gray-200"></div>
              </div>

              <div className="flex items-center relative">
                <div className="w-16 text-right text-gray-500 text-sm pr-4">
                  4 PM
                </div>
                <div className="w-full border-t border-dashed border-gray-200"></div>
                <div className="absolute left-16 right-0 top-0 flex space-x-1">
                  {Array(14)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full bg-pink-500"
                      ></div>
                    ))}
                </div>
                <div className="absolute top-0 right-8 text-pink-500 font-medium">
                  14
                </div>
              </div>

              <div className="flex items-center relative">
                <div className="w-16 text-right text-gray-500 text-sm pr-4">
                  6 PM
                </div>
                <div className="w-full border-t border-dashed border-gray-200"></div>
                <div className="absolute left-16 right-0 top-0 flex space-x-1">
                  {Array(18)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full bg-pink-500"
                      ></div>
                    ))}
                </div>
                <div className="absolute top-0 right-8 text-pink-500 font-medium">
                  18
                </div>
              </div>

              <div className="flex items-center relative">
                <div className="w-16 text-right text-gray-500 text-sm pr-4">
                  8 PM
                </div>
                <div className="w-full border-t border-dashed border-gray-200"></div>
                <div className="absolute left-16 right-56 top-0 flex space-x-1">
                  {Array(10)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full bg-pink-500"
                      ></div>
                    ))}
                </div>
                <div className="absolute top-0 right-8 text-pink-500 font-medium">
                  10
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-16 text-right text-gray-500 text-sm pr-4">
                  10 PM
                </div>
                <div className="w-full border-t border-dashed border-gray-200"></div>
              </div>

              <div className="flex items-center">
                <div className="w-16 text-right text-gray-500 text-sm pr-4">
                  12 AM
                </div>
                <div className="w-full border-t border-dashed border-gray-200"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Learning_calendar;
