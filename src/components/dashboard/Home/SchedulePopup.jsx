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
import { useQuery, useMutation } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import toast from "react-hot-toast";

const SchedulePopup = ({ selectedDate, onClose, onSessionCreated }) => {
  const [selectedUnit, setSelectedUnit] = React.useState("");
  const [selectedModule, setSelectedModule] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState("");
  const [selectedTimeInput, setSelectedTimeInput] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [trainingDate, setTrainingDate] = React.useState(selectedDate || null);

  const { data: unitsRaw = [], isLoading: isUnitsLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      try {
        const token = secureLocalStorage.getItem("token");
        const response = await BaseUrl.get("/unit/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data?.data?.data);
        return response.data?.data?.data || [];
      } catch (err) {
        toast.error("Failed to fetch units.");
        return [];
      }
    },
  });

  // Sort units based on their names/numbers
  const units = React.useMemo(() => {
    if (!unitsRaw.length) return [];

    return [...unitsRaw].sort((a, b) => {
      // Extract unit numbers if available
      const getUnitNumber = (name) => {
        const match = name.match(/UEI-(\d+)/);
        return match ? parseInt(match[1], 10) : Infinity;
      };

      const aNum = getUnitNumber(a.name);
      const bNum = getUnitNumber(b.name);

      // Sort by unit number first
      if (aNum !== bNum) return aNum - bNum;

      // If no number or same number, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [unitsRaw]);

  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery({
    queryKey: ["subjects", selectedUnit],
    queryFn: async () => {
      if (!selectedUnit) return [];
      try {
        const token = secureLocalStorage.getItem("token");
        const response = await BaseUrl.get(
          `/subject/me?unit=${selectedUnit}&offset=20`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data?.data?.data || [];
      } catch (err) {
        toast.error("Failed to fetch subjects.");
        return [];
      }
    },
    enabled: !!selectedUnit,
  });

  const { data: courses = [], isLoading: isCoursesLoading } = useQuery({
    queryKey: ["courses", selectedModule],
    queryFn: async () => {
      if (!selectedModule) return [];
      try {
        const token = secureLocalStorage.getItem("token");
        const response = await BaseUrl.get(
          `/course/subject/${selectedModule}?offset=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data?.data?.data || [];
      } catch (err) {
        toast.error("Failed to fetch courses.");
        return [];
      }
    },
    enabled: !!selectedModule,
  });

  const createTrainingSession = useMutation({
    mutationFn: async (sessionData) => {
      const token = secureLocalStorage.getItem("token");
      const response = await BaseUrl.post("/training-session", sessionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      onSessionCreated(data.data);
      toast.success("Session scheduled successfully!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to schedule session.");
    },
  });

  React.useEffect(() => {
    if (selectedUnit) setSelectedModule("");
  }, [selectedUnit]);

  React.useEffect(() => {
    if (selectedModule) setSelectedCourse("");
  }, [selectedModule]);

  const handleSubmit = () => {
    if (!title || !selectedCourse || !trainingDate || !selectedTimeInput) {
      toast.error("Please fill all required fields");
      return;
    }

    const date = new Date(trainingDate);
    const [hours, minutes] = selectedTimeInput.split(":");
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    const scheduled_at = date.toISOString();

    createTrainingSession.mutate({
      title,
      status: "scheduled",
      scheduled_at,
      course: selectedCourse,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[16px] p-6 w-[600px]  max-md:w-[92%]">
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
                {subjects.map((module) => (
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
        <div className="flex justify-center gap-6">
          <button
            onClick={onClose}
            className="text-[#F8589F] px-6 py-2 rounded-lg text-[14px] font-[500]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#F8589F] text-[14px] font-[500] text-white px-6 py-2 rounded-[20px]"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulePopup;
