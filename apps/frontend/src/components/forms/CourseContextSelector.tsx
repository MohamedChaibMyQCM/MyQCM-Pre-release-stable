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

const LARGE_PAGE_SIZE = "1000";

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

// Helper functions matching the legacy wizard implementation
const extractItems = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload?.units)) return payload.units;
  if (Array.isArray(payload?.data?.units)) return payload.data.units;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (payload?.data?.data?.data && Array.isArray(payload.data.data.data)) {
    return payload.data.data.data;
  }
  return [];
};

const mapOptions = (items: any[]): SelectOption[] =>
  items
    .map((item) => {
      const rawId =
        item?.id ??
        item?.uuid ??
        item?._id ??
        item?.identifier ??
        item?.key ??
        "";
      const id = typeof rawId === "string" ? rawId : String(rawId);
      const name =
        item?.name ??
        item?.title ??
        item?.label ??
        item?.displayName ??
        item?.desc ??
        "Unnamed";
      return {
        id,
        name,
      };
    })
    .filter((option) => option.id);

const unwrapResponse = <T,>(payload: any): T =>
  (payload?.data ?? payload) as T;

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
        const response = await apiFetch<any>("/university");
        const items = mapOptions(extractItems(unwrapResponse(response)));
        setUniversities(items);
      } catch (err) {
        console.error("Failed to load universities:", err);
      }
    };

    loadUniversities();
  }, []);

  // Load faculties when university changes
  React.useEffect(() => {
    if (!value.university) {
      setFaculties([]);
      return;
    }

    const loadFaculties = async () => {
      try {
        const response = await apiFetch<any>(
          `/faculty?universityId=${encodeURIComponent(value.university)}`
        );
        const items = mapOptions(extractItems(unwrapResponse(response)));
        setFaculties(items);
      } catch (err) {
        console.error("Failed to load faculties:", err);
        setFaculties([]);
      }
    };

    loadFaculties();
  }, [value.university]);

  // Load units when faculty and year are selected
  React.useEffect(() => {
    if (!value.faculty || !value.year) {
      setUnits([]);
      return;
    }

    const loadUnits = async () => {
      try {
        const params = new URLSearchParams();
        params.set("year_of_study", value.year);
        params.set("page", "1");
        params.set("offset", LARGE_PAGE_SIZE);
        const response = await apiFetch<any>(`/unit?${params.toString()}`);
        const payload = unwrapResponse<any>(response);
        const data = Array.isArray(payload?.data)
          ? payload.data
          : extractItems(payload);
        const items = mapOptions(data);
        setUnits(items);
      } catch (err) {
        console.error("Failed to load units:", err);
        setUnits([]);
      }
    };

    loadUnits();
  }, [value.faculty, value.year]);

  // Load subjects when unit is selected
  React.useEffect(() => {
    if (!value.unit) {
      setSubjects([]);
      return;
    }

    const loadSubjects = async () => {
      try {
        const queries = new URLSearchParams();
        queries.set("unit", value.unit);
        if (value.year) {
          queries.set("year_of_study", value.year);
        }
        queries.set("page", "1");
        queries.set("offset", LARGE_PAGE_SIZE);
        const response = await apiFetch<any>(`/subject?${queries.toString()}`);
        const payload = unwrapResponse<any>(response);
        const data = extractItems(payload);
        const items = mapOptions(data);
        setSubjects(items);
      } catch (err) {
        console.error("Failed to load subjects:", err);
        setSubjects([]);
      }
    };

    loadSubjects();
  }, [value.unit, value.year]);

  // Load courses when subject is selected
  React.useEffect(() => {
    if (!value.subject) {
      setCourses([]);
      return;
    }

    const loadCourses = async () => {
      try {
        const params = new URLSearchParams();
        params.set("subject", value.subject);
        params.set("page", "1");
        params.set("offset", LARGE_PAGE_SIZE);
        const response = await apiFetch<any>(`/course?${params.toString()}`);
        const payload = unwrapResponse<any>(response);
        const data = extractItems(payload);
        const items = mapOptions(data);
        setCourses(items);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setCourses([]);
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
