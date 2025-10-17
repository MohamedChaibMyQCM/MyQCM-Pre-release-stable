"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
} from "@/app/lib/api";

const pageStyle: CSSProperties = {
  maxWidth: 720,
  margin: "3rem auto",
  display: "grid",
  gap: "1.5rem",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const formStyle: CSSProperties = {
  display: "grid",
  gap: "1rem",
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: "0.5rem",
};

const inputStyle: CSSProperties = {
  padding: "0.5rem",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  fontSize: "1rem",
};

const buttonStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: 4,
  border: "none",
  backgroundColor: "#111827",
  color: "#ffffff",
  fontSize: "1rem",
  cursor: "pointer",
};

const YEAR_OF_STUDY_OPTIONS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Fifth Year",
  "Sixth Year",
  "Seventh Year",
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const CONTENT_TYPE_OPTIONS: { value: "mcq" | "qroc"; label: string }[] = [
  { value: "mcq", label: "Multiple-choice questions (MCQ)" },
  { value: "qroc", label: "Short-answer questions (QROC)" },
];

const LARGE_PAGE_SIZE = "1000";

type SelectOption = {
  id: string;
  name: string;
};

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
    .map((item) => ({
      id: item?.id ?? item?.uuid ?? item?._id ?? "",
      name:
        item?.name ??
        item?.title ??
        item?.label ??
        item?.course_name ??
        "Unnamed",
    }))
    .filter((option) => option.id);

const unwrapResponse = <T,>(payload: any): T =>
  (payload?.data ?? payload) as T;

export default function NewGenerationRequestPage() {
  const router = useRouter();

  const [universities, setUniversities] = useState<SelectOption[]>([]);
  const [faculties, setFaculties] = useState<SelectOption[]>([]);
  const [units, setUnits] = useState<SelectOption[]>([]);
  const [subjects, setSubjects] = useState<SelectOption[]>([]);
  const [courses, setCourses] = useState<SelectOption[]>([]);

  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([
    "mcq",
  ]);

  const [mcqCount, setMcqCount] = useState<number>(0);
  const [qrocCount, setQrocCount] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  const toggleContentType = (value: "mcq" | "qroc") => {
    setSelectedContentTypes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoadingMetadata(true);
      try {
        const response = await apiFetch<any>("/university");
        const items = mapOptions(extractItems(unwrapResponse(response)));
        setUniversities(items);
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
        } else if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoadingMetadata(false);
      }
    };

    fetchUniversities();
  }, []);

  useEffect(() => {
    const fetchFaculties = async () => {
      if (!selectedUniversity) {
        setFaculties([]);
        setSelectedFaculty("");
        return;
      }
      try {
        const response = await apiFetch<any>(
          `/faculty?universityId=${encodeURIComponent(selectedUniversity)}`,
        );
        const items = mapOptions(extractItems(unwrapResponse(response)));
        setFaculties(items);
        if (!items.find((item) => item.id === selectedFaculty)) {
          setSelectedFaculty("");
        }
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
        } else if (err instanceof Error) {
          setError(err.message);
        }
      }
    };

    fetchFaculties();
    setSubjects([]);
    setCourses([]);
    setSelectedCourse("");
    setSelectedSubject("");
  }, [selectedUniversity]);

  useEffect(() => {
    if (!selectedYear) {
      setUnits([]);
      setSelectedUnit("");
      return;
    }

    const fetchUnits = async () => {
      try {
        const params = new URLSearchParams();
        params.set("year_of_study", selectedYear);
        params.set("page", "1");
        params.set("offset", LARGE_PAGE_SIZE);
        const response = await apiFetch<any>(`/unit?${params.toString()}`);
        const payload = unwrapResponse<any>(response);
        const data = Array.isArray(payload?.data)
          ? payload.data
          : extractItems(payload);
        const items = mapOptions(data);
        setUnits(items);
        if (!items.find((item) => item.id === selectedUnit)) {
          setSelectedUnit("");
        }
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
        } else if (err instanceof Error) {
          setError(err.message);
        }
      }
    };

    fetchUnits();
    setSelectedSubject("");
    setSubjects([]);
    setCourses([]);
    setSelectedCourse("");
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedUnit) {
      setSubjects([]);
      setSelectedSubject("");
      return;
    }

    const fetchSubjects = async () => {
      try {
        const queries = new URLSearchParams();
        queries.set("unit", selectedUnit);
        if (selectedYear) {
          queries.set("year_of_study", selectedYear);
        }
        queries.set("page", "1");
        queries.set("offset", LARGE_PAGE_SIZE);
        const response = await apiFetch<any>(`/subject?${queries.toString()}`);
        const payload = unwrapResponse<any>(response);
        const data = extractItems(payload);
        const items = mapOptions(data);
        setSubjects(items);
        if (!items.find((item) => item.id === selectedSubject)) {
          setSelectedSubject("");
        }
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
        } else if (err instanceof Error) {
          setError(err.message);
        }
      }
    };

    fetchSubjects();
    setCourses([]);
    setSelectedCourse("");
  }, [selectedUnit, selectedYear]);

  useEffect(() => {
    if (!selectedSubject) {
      setCourses([]);
      setSelectedCourse("");
      return;
    }

    const fetchCourses = async () => {
      try {
        const params = new URLSearchParams();
        params.set("subject", selectedSubject);
        params.set("page", "1");
        params.set("offset", LARGE_PAGE_SIZE);
        const response = await apiFetch<any>(`/course?${params.toString()}`);
        const payload = unwrapResponse<any>(response);
        const data = extractItems(payload);
        const items = mapOptions(data);
        setCourses(items);
        if (!items.find((item) => item.id === selectedCourse)) {
          setSelectedCourse("");
        }
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
        } else if (err instanceof Error) {
          setError(err.message);
        }
      }
    };

    fetchCourses();
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedContentTypes.includes("mcq")) {
      setMcqCount(0);
    }
    if (!selectedContentTypes.includes("qroc")) {
      setQrocCount(0);
    }
  }, [selectedContentTypes]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!selectedUniversity || !selectedFaculty || !selectedYear) {
      setError("Please choose university, faculty, and year of study.");
      return;
    }

    if (!selectedUnit) {
      setError("Please choose a unit.");
      return;
    }

    if (!selectedSubject) {
      setError("Please choose a module.");
      return;
    }

    if (!selectedCourse) {
      setError("Please choose a course.");
      return;
    }

    if (!file) {
      setError("Please select a source document to upload.");
      return;
    }

    if (selectedContentTypes.length === 0) {
      setError("Select at least one content type (MCQ or QROC).");
      return;
    }

    if (
      selectedContentTypes.includes("mcq") &&
      (!Number.isFinite(mcqCount) || mcqCount <= 0)
    ) {
      setError("Enter a positive number of MCQs to generate.");
      return;
    }

    if (
      selectedContentTypes.includes("qroc") &&
      (!Number.isFinite(qrocCount) || qrocCount <= 0)
    ) {
      setError("Enter a positive number of QROCs to generate.");
      return;
    }

    setSubmitting(true);

    try {
      setProgressMessage("Creating generation request...");

      const payload = {
        university: selectedUniversity,
        faculty: selectedFaculty,
        unit: selectedUnit,
        subject: selectedSubject,
        course: selectedCourse,
        year_of_study: selectedYear,
        difficulty: selectedDifficulty,
        requestedCounts: {
          mcq: selectedContentTypes.includes("mcq") ? mcqCount : 0,
          qroc: selectedContentTypes.includes("qroc") ? qrocCount : 0,
        },
        contentTypes: selectedContentTypes,
        sourceFileName: file.name,
        sourceFileMime: file.type,
        sourceFileSize: file.size,
      };

      const creationResponse = await apiFetch<any>(
        "/generation/requests",
        {
          method: "POST",
          body: payload,
        },
      );

      const created = unwrapResponse<any>(creationResponse);
      const requestId = created?.id ?? created?.data?.id;
      const uploadPath =
        created?.uploadUrl ??
        created?.signedUrl ??
        (requestId ? `/generation/requests/${requestId}/upload` : null);

      if (!requestId || !uploadPath) {
        throw new Error("Invalid response when creating generation request.");
      }

      setProgressMessage("Uploading source document...");
      const formData = new FormData();
      formData.append("file", file);
      await apiFetch(uploadPath, {
        method: "PUT",
        body: formData,
      });

      setProgressMessage("Confirming upload...");
      await apiFetch(`/generation/requests/${requestId}/confirm-upload`, {
        method: "POST",
      });

      router.push(`/generation/${requestId}`);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to create generation request.");
      }
    } finally {
      setSubmitting(false);
      setProgressMessage(null);
    }
  };

  return (
    <main style={pageStyle}>
      <header>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          New Generation Request
        </h1>
        <p style={{ color: "#6b7280" }}>
          Provide the course context, desired output counts, and upload a source
          document to kick off AI generation.
        </p>
      </header>

      <form style={formStyle} onSubmit={handleSubmit}>
        <fieldset
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 8,
            padding: "1rem",
            display: "grid",
            gap: "1rem",
          }}
        >
          <legend style={{ padding: "0 0.5rem" }}>Context</legend>
          <label style={labelStyle}>
            <span>University</span>
            <select
              value={selectedUniversity}
              onChange={(event) => setSelectedUniversity(event.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Select university</option>
              {universities.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            <span>Faculty</span>
            <select
              value={selectedFaculty}
              onChange={(event) => setSelectedFaculty(event.target.value)}
              style={inputStyle}
              required
              disabled={!selectedUniversity || faculties.length === 0}
            >
              <option value="">Select faculty</option>
              {faculties.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            <span>Year of study</span>
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Select year</option>
              {YEAR_OF_STUDY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            <span>Unit</span>
            <select
              value={selectedUnit}
              onChange={(event) => setSelectedUnit(event.target.value)}
              style={inputStyle}
              required
              disabled={!selectedYear || units.length === 0}
            >
              <option value="">Select unit</option>
              {units.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            <span>Module</span>
            <select
              value={selectedSubject}
              onChange={(event) => setSelectedSubject(event.target.value)}
              style={inputStyle}
              required
              disabled={!selectedUnit || subjects.length === 0}
            >
              <option value="">Select module</option>
              {subjects.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            <span>Course</span>
            <select
              value={selectedCourse}
              onChange={(event) => setSelectedCourse(event.target.value)}
              style={inputStyle}
              required
              disabled={!selectedSubject || courses.length === 0}
            >
              <option value="">Select course</option>
              {courses.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            <span>Difficulty</span>
            <select
              value={selectedDifficulty}
              onChange={(event) => setSelectedDifficulty(event.target.value)}
              style={inputStyle}
              required
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <fieldset
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 8,
            padding: "1rem",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <legend style={{ padding: "0 0.5rem" }}>Content types</legend>
          {CONTENT_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <input
                type="checkbox"
                checked={selectedContentTypes.includes(option.value)}
                onChange={() => toggleContentType(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>

        <fieldset
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 8,
            padding: "1rem",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <legend style={{ padding: "0 0.5rem" }}>Requested counts</legend>
          <label style={labelStyle}>
            <span>MCQ count</span>
            <input
              type="number"
              min={0}
              value={mcqCount}
              onChange={(event) => setMcqCount(Number(event.target.value) || 0)}
              style={inputStyle}
              disabled={!selectedContentTypes.includes("mcq")}
            />
          </label>

          <label style={labelStyle}>
            <span>QROC count</span>
            <input
              type="number"
              min={0}
              value={qrocCount}
              onChange={(event) => setQrocCount(Number(event.target.value) || 0)}
              style={inputStyle}
              disabled={!selectedContentTypes.includes("qroc")}
            />
          </label>
        </fieldset>

        <label style={labelStyle}>
          <span>Source document (PDF, PPTX, DOCX)</span>
          <input
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx"
            onChange={handleFileChange}
            required
          />
        </label>

        <button
          type="submit"
          style={buttonStyle}
          disabled={submitting || loadingMetadata}
        >
          {submitting ? "Submitting..." : "Create request"}
        </button>
      </form>

      {progressMessage && (
        <p style={{ color: "#2563eb" }}>{progressMessage}</p>
      )}

      {error && (
        <p style={{ color: "#b91c1c" }} role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
