"use client";

import * as React from "react";
import { apiFetch } from "@/app/lib/api";

type SelectOption = {
  id: string;
  name: string;
};

const YEAR_OPTIONS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Fifth Year",
  "Sixth Year",
  "Seventh Year",
];

export interface CourseContext {
  university: string;
  faculty: string;
  year: string;
  unit: string;
  subject: string;
  course: string;
}

interface CourseContextSelectorProps {
  value: CourseContext;
  onChange: (value: CourseContext) => void;
  className?: string;
}

export function CourseContextSelector({
  value,
  onChange,
  className,
}: CourseContextSelectorProps) {
  const [universities, setUniversities] = React.useState<SelectOption[]>([]);
  const [faculties, setFaculties] = React.useState<SelectOption[]>([]);
  const [units, setUnits] = React.useState<SelectOption[]>([]);
  const [subjects, setSubjects] = React.useState<SelectOption[]>([]);
  const [courses, setCourses] = React.useState<SelectOption[]>([]);

  // Load universities on mount
  React.useEffect(() => {
    const loadUniversities = async () => {
      try {
        const response = await apiFetch<any>("/universities?limit=1000");
        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setUniversities(
          data.map((u: any) => ({ id: u.id || u.uuid, name: u.name }))
        );
      } catch (err) {
        console.error("Failed to load universities:", err);
      }
    };

    loadUniversities();
  }, []);

  // Load faculties when university changes
  React.useEffect(() => {
    if (!value.university) return;

    const loadFaculties = async () => {
      try {
        const response = await apiFetch<any>(
          `/universities/${value.university}/faculties?limit=1000`
        );
        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setFaculties(
          data.map((f: any) => ({ id: f.id || f.uuid, name: f.name }))
        );
      } catch (err) {
        console.error("Failed to load faculties:", err);
      }
    };

    loadFaculties();
  }, [value.university]);

  // Load units when faculty and year are selected
  React.useEffect(() => {
    if (!value.faculty || !value.year) return;

    const loadUnits = async () => {
      try {
        const response = await apiFetch<any>(
          `/faculties/${value.faculty}/units?year_of_study=${value.year}&limit=1000`
        );
        const data = Array.isArray(response?.units)
          ? response.units
          : Array.isArray(response?.data?.units)
          ? response.data.units
          : [];
        setUnits(data.map((u: any) => ({ id: u.id || u.uuid, name: u.name })));
      } catch (err) {
        console.error("Failed to load units:", err);
      }
    };

    loadUnits();
  }, [value.faculty, value.year]);

  // Load subjects when unit is selected
  React.useEffect(() => {
    if (!value.unit) return;

    const loadSubjects = async () => {
      try {
        const response = await apiFetch<any>(
          `/units/${value.unit}/subjects?limit=1000`
        );
        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setSubjects(
          data.map((s: any) => ({ id: s.id || s.uuid, name: s.name }))
        );
      } catch (err) {
        console.error("Failed to load subjects:", err);
      }
    };

    loadSubjects();
  }, [value.unit]);

  // Load courses when subject is selected
  React.useEffect(() => {
    if (!value.subject) return;

    const loadCourses = async () => {
      try {
        const response = await apiFetch<any>(
          `/subjects/${value.subject}/courses?limit=1000`
        );
        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setCourses(
          data.map((c: any) => ({ id: c.id || c.uuid, name: c.name }))
        );
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };

    loadCourses();
  }, [value.subject]);

  const handleChange = (field: keyof CourseContext, newValue: string) => {
    // Reset dependent fields when a parent changes
    const updates: Partial<CourseContext> = { [field]: newValue };

    if (field === "university") {
      updates.faculty = "";
      updates.unit = "";
      updates.subject = "";
      updates.course = "";
    } else if (field === "faculty") {
      updates.unit = "";
      updates.subject = "";
      updates.course = "";
    } else if (field === "year") {
      updates.unit = "";
      updates.subject = "";
      updates.course = "";
    } else if (field === "unit") {
      updates.subject = "";
      updates.course = "";
    } else if (field === "subject") {
      updates.course = "";
    }

    onChange({ ...value, ...updates });
  };

  return (
    <div className={className}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">University *</label>
          <select
            value={value.university}
            onChange={(e) => handleChange("university", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select university...</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Faculty *</label>
          <select
            value={value.faculty}
            onChange={(e) => handleChange("faculty", e.target.value)}
            disabled={!value.university}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select faculty...</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Year of Study *</label>
          <select
            value={value.year}
            onChange={(e) => handleChange("year", e.target.value)}
            disabled={!value.faculty}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select year...</option>
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Unit *</label>
          <select
            value={value.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            disabled={!value.year}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select unit...</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Subject *</label>
          <select
            value={value.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            disabled={!value.unit}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select subject...</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Course *</label>
          <select
            value={value.course}
            onChange={(e) => handleChange("course", e.target.value)}
            disabled={!value.subject}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select course...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
