"use client";

import { CaretDown, X } from "phosphor-react";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TrainingDate from "../QuestionsBank/TrainingInputs/TrainingDate";

const SchedulePopup = ({ selectedDate, onClose }) => {
  const units = [
    { id: "1", name: "Unit 1" },
    { id: "2", name: "Unit 2" },
    { id: "3", name: "Unit 3" },
    { id: "4", name: "Unit 4" },
    { id: "5", name: "Unit 5" },
  ];

  const modules = [
    { id: "1", name: "Module 1" },
    { id: "2", name: "Module 2" },
    { id: "3", name: "Module 3" },
  ];

  const courses = [
    { id: "1", name: "Course 1" },
    { id: "2", name: "Course 2" },
    { id: "3", name: "Course 3" },
  ];

  const [selectedUnit, setSelectedUnit] = React.useState("");
  const [selectedModule, setSelectedModule] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState("");
  const [selectedTimeInput, setSelectedTimeInput] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [trainingDate, setTrainingDate] = React.useState(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[16px] p-6 w-[600px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#FD2E8A] font-[500] text-[17px]">
            Schedule season
          </h3>
          <X
            size={24}
            weight="bold"
            className="text-[#B5BEC6] font-[600] cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="mb-6">
          <span className="font-[600] text-[#191919] mb-3 block text-[15px]">
            Title
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            className="w-full rounded-[24px] placeholder:text-[#191919] bg-white border border-gray-300 text-[#191919] text-[14px] py-[10px] px-4 focus:outline-none"
          />
        </div>
        <div className="mb-6 sel">
          <span className="font-[600] text-[#191919] mb-3 block text-[15px]">
            Unit
          </span>
          <Select
            value={selectedUnit}
            onValueChange={(val) => setSelectedUnit(val)}
          >
            <SelectTrigger className="rounded-[24px] w-full bg-white border border-gray-300 text-[#191919] !py-3 block px-4 flex items-center justify-between">
              <SelectValue placeholder="Select a Unit" />
             
            </SelectTrigger>
            <SelectContent className="bg-white rounded-[20px] border border-[#E0E0E0]">
              <SelectGroup>
                {units.map((unit) => (
                  <SelectItem
                    key={unit.id}
                    value={unit.id}
                    className="text-[#191919] hover:bg-[#FFF5FA] hover:text-[#F8589F] data-[state=checked]:bg-[#FFF5FA] data-[state=checked]:text-[#F8589F] rounded-[20px] py-3 px-4 my-1"
                  >
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="mb-6 sel">
          <span className="font-[600] text-[#191919] mb-3 block text-[15px]">
            Module
          </span>
          <Select
            value={selectedModule}
            onValueChange={(val) => setSelectedModule(val)}
          >
            <SelectTrigger className="rounded-[24px] w-full bg-white border border-gray-300 text-[#191919] py-3 px-4 flex items-center justify-between">
              <SelectValue placeholder="Select a Module" />
              
            </SelectTrigger>
            <SelectContent className="bg-white rounded-[20px] border border-[#E0E0E0]">
              <SelectGroup>
                {modules.map((module) => (
                  <SelectItem
                    key={module.id}
                    value={module.id}
                    className="text-[#191919] hover:bg-[#FFF5FA] hover:text-[#F8589F] data-[state=checked]:bg-[#FFF5FA] data-[state=checked]:text-[#F8589F] rounded-[20px] py-3 px-4 my-1"
                  >
                    {module.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Course Select */}
        <div className="mb-6 sel">
          <span className="font-[600] text-[#191919] mb-3 block text-[15px]">
            Course
          </span>
          <Select
            value={selectedCourse}
            onValueChange={(val) => setSelectedCourse(val)}
          >
            <SelectTrigger className="rounded-[24px] w-full bg-white border border-gray-300 text-[#191919] py-3 px-4 flex items-center justify-between">
              <SelectValue placeholder="Select a Course" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-[20px] border border-[#E0E0E0]">
              <SelectGroup>
                {courses.map((course) => (
                  <SelectItem
                    key={course.id}
                    value={course.id}
                    className="text-[#191919] hover:bg-[#FFF5FA] hover:text-[#F8589F] data-[state=checked]:bg-[#FFF5FA] data-[state=checked]:text-[#F8589F] rounded-[20px] py-3 px-4 my-1"
                  >
                    {course.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <TrainingDate value={trainingDate} onChange={setTrainingDate} />
          </div>
          <div className="flex-1">
            <span className="font-[600] text-[#191919] text-[15px]">Time</span>
            <input
              type="time"
              value={selectedTimeInput}
              onChange={(e) => setSelectedTimeInput(e.target.value)}
              className="w-full rounded-[24px] bg-white border border-gray-300 text-[#191919] text-[14px] py-[10px] px-4 mt-2 focus:outline-none focus:border-[#F8589F]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6">
          <button
            onClick={onClose}
            className="text-[#F8589F] px-6 py-3 rounded-lg text-[14px] font-[500]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log({
                title,
                unit: selectedUnit,
                module: selectedModule,
                course: selectedCourse,
                date: trainingDate,
                time: selectedTimeInput,
              });
              onClose();
            }}
            className="bg-[#F8589F] text-[14px] font-[500] text-white px-6 py-3 rounded-[20px]"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulePopup;
