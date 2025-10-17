"use client";

import {
  useCallback,
  useEffect,
  useRef,
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

const cardListStyle: CSSProperties = {
  display: "grid",
  gap: "1rem",
};

const cardStyle: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "1rem",
  display: "grid",
  gap: "0.75rem",
  backgroundColor: "#ffffff",
};

const cardHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "0.75rem",
};

const subtleTextStyle: CSSProperties = {
  color: "#6b7280",
  fontSize: "0.9rem",
  margin: 0,
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
};

const secondaryActionButton: CSSProperties = {
  padding: "0.5rem 0.9rem",
  borderRadius: 6,
  border: "1px solid #111827",
  backgroundColor: "#ffffff",
  color: "#111827",
  cursor: "pointer",
};

const approveActionButton: CSSProperties = {
  padding: "0.5rem 0.9rem",
  borderRadius: 6,
  border: "1px solid #047857",
  backgroundColor: "#047857",
  color: "#ffffff",
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

type ImportedPreview = {
  id: string;
  question: string;
  type: string;
  estimated_time: number;
  approval_status: string;
  difficulty: string;
  quiz_type: string;
  options?: { id?: string; content: string; is_correct: boolean }[];
  answer?: string;
  explanation?: string;
};

type EditableOption = {
  id: string;
  content: string;
  is_correct: boolean;
};

type EditableMcq = {
  id: string;
  question: string;
  type: string;
  estimated_time: number;
  approval_status: string;
  difficulty?: string;
  quiz_type?: string;
  options: EditableOption[];
  answer?: string;
  explanation?: string;
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

const formatSeconds = (totalSeconds: number): string => {
  const safeValue = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const minutes = Math.floor(safeValue / 60);
  const seconds = safeValue % 60;
  if (minutes <= 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

const clampPositiveInt = (value: number, fallback: number = 1): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.round(value);
};

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
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);

  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchStatus, setBatchStatus] = useState<string | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchResultErrors, setBatchResultErrors] = useState<
    { row: number; message: string }[]
  >([]);
  const [latestPreview, setLatestPreview] = useState<ImportedPreview[]>([]);
  const [pendingMcqs, setPendingMcqs] = useState<ImportedPreview[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [editingMcq, setEditingMcq] = useState<EditableMcq | null>(null);
  const [editingSaving, setEditingSaving] = useState(false);

  const toggleContentType = (value: "mcq" | "qroc") => {
    setSelectedContentTypes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const loadPendingMcqs = useCallback(async () => {
    if (!selectedCourse) {
      setPendingMcqs([]);
      return;
    }

    setPendingLoading(true);
    setPendingError(null);
    setPendingMessage(null);

    const query = new URLSearchParams({
      approval_status: "pending",
      offset: "200",
      course: selectedCourse,
    });

    try {
      const response = await apiFetch<any>(`/mcq/freelancer?${query.toString()}`);
      const payload = unwrapResponse<any>(response);
      const items = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.data)
        ? payload.data.data
        : Array.isArray(payload)
        ? payload
        : [];

      const normalized: ImportedPreview[] = items.map((item: any) => ({
        id: item?.id ?? "",
        question: item?.question ?? "",
        type: item?.type ?? "mcq",
        estimated_time: clampPositiveInt(Number(item?.estimated_time) ?? 0),
        approval_status: item?.approval_status ?? "pending",
        difficulty: item?.difficulty ?? "medium",
        quiz_type: item?.quiz_type ?? "theorique",
        options: Array.isArray(item?.options)
          ? item.options.map((option: any) => ({
              id: option?.id ?? "",
              content:
                option?.content ?? option?.text ?? option?.label ?? "",
              is_correct: Boolean(
                option?.is_correct ?? option?.isCorrect ?? option?.correct,
              ),
            }))
          : [],
        answer: item?.answer ?? "",
        explanation: item?.explanation ?? "",
      }));

      setPendingMcqs(normalized);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      setPendingError(
        error instanceof Error
          ? error.message
          : "Failed to load pending MCQs.",
      );
    } finally {
      setPendingLoading(false);
    }
  }, [selectedCourse]);

  const handleApproveMcq = useCallback(
    async (mcqId: string) => {
      if (!mcqId) return;
      setPendingMessage(null);
      setPendingError(null);
      try {
        await apiFetch(`/mcq/${mcqId}/approve`, { method: "POST" });
        setPendingMessage("MCQ approved.");
        await loadPendingMcqs();
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          redirectToLogin();
          return;
        }
        setPendingError(
          error instanceof Error
            ? error.message
            : "Unable to approve this MCQ.",
        );
      }
    },
    [loadPendingMcqs],
  );

  const handleApproveAll = useCallback(async () => {
    if (pendingMcqs.length === 0) {
      setPendingMessage("No pending MCQs to approve.");
      return;
    }

    setPendingMessage(null);
    setPendingError(null);

    try {
      await apiFetch(`/mcq/approve/all`, { method: "POST" });
      setPendingMessage("All pending MCQs approved.");
      await loadPendingMcqs();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      setPendingError(
        error instanceof Error
          ? error.message
          : "Unable to approve all MCQs.",
      );
    }
  }, [loadPendingMcqs, pendingMcqs.length]);

  const openEditMcq = useCallback(
    async (mcqId: string) => {
      if (!mcqId) return;
      setPendingError(null);
      setPendingMessage(null);

      try {
        const response = await apiFetch<any>(`/mcq/${mcqId}`);
        const payload = unwrapResponse<any>(response);
        const data = payload?.data ?? payload;

        const normalizedOptions: EditableOption[] = Array.isArray(data?.options)
          ? data.options.map((option: any) => ({
              id: option?.id ?? "",
              content:
                option?.content ?? option?.text ?? option?.label ?? "",
              is_correct: Boolean(
                option?.is_correct ?? option?.isCorrect ?? option?.correct,
              ),
            }))
          : [];

        setEditingMcq({
          id: data?.id ?? mcqId,
          question: data?.question ?? "",
          type: data?.type ?? "mcq",
          estimated_time: clampPositiveInt(Number(data?.estimated_time) ?? 0),
          approval_status: data?.approval_status ?? "pending",
          difficulty: data?.difficulty ?? "medium",
          quiz_type: data?.quiz_type ?? "theorique",
          options: normalizedOptions,
          answer: data?.answer ?? "",
          explanation: data?.explanation ?? "",
        });
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          redirectToLogin();
          return;
        }
        setPendingError(
          error instanceof Error
            ? error.message
            : "Unable to load MCQ details.",
        );
      }
    },
    [],
  );

  const closeEditing = useCallback(() => {
    setEditingMcq(null);
  }, []);

  const updateEditingField = useCallback(
    (field: keyof EditableMcq, value: string | number) => {
      setEditingMcq((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: value,
        } as EditableMcq;
      });
    },
    [],
  );

  const updateOptionContent = useCallback((index: number, value: string) => {
    setEditingMcq((prev) => {
      if (!prev) return prev;
      const nextOptions = prev.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, content: value } : option,
      );
      return { ...prev, options: nextOptions };
    });
  }, []);

  const toggleOptionCorrect = useCallback((index: number) => {
    setEditingMcq((prev) => {
      if (!prev) return prev;
      const nextOptions = prev.options.map((option, optionIndex) =>
        optionIndex === index
          ? { ...option, is_correct: !option.is_correct }
          : option,
      );
      return { ...prev, options: nextOptions };
    });
  }, []);

  const saveEditingMcq = useCallback(async () => {
    if (!editingMcq) return;

    const payload = editingMcq;
    const formData = new FormData();
    formData.append("question", payload.question);
    formData.append(
      "estimated_time",
      clampPositiveInt(Number(payload.estimated_time) ?? 1).toString(),
    );

    if (payload.explanation) {
      formData.append("explanation", payload.explanation);
    }

    if (payload.type === "qroc") {
      formData.append("answer", payload.answer ?? "");
    } else if (payload.options.length > 0) {
      formData.append(
        "options",
        JSON.stringify(
          payload.options.map((option) => ({
            id: option.id,
            content: option.content,
            is_correct: option.is_correct,
          })),
        ),
      );
    }

    setEditingSaving(true);
    setPendingError(null);
    setPendingMessage(null);

    try {
      await apiFetch(`/mcq/${payload.id}`, {
        method: "PATCH",
        body: formData,
      });
      setPendingMessage("MCQ updated.");
      setEditingMcq(null);
      await loadPendingMcqs();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      setPendingError(
        error instanceof Error ? error.message : "Unable to update MCQ.",
      );
    } finally {
      setEditingSaving(false);
    }
  }, [editingMcq, loadPendingMcqs]);

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
    if (!selectedCourse) {
      setPendingMcqs([]);
      return;
    }
    loadPendingMcqs();
  }, [selectedCourse, loadPendingMcqs]);

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

  const handleBatchFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setBatchError(null);
    setBatchStatus(null);
    setBatchResultErrors([]);

    if (selected && selected.size > 5 * 1024 * 1024) {
      setBatchError("Spreadsheet must be 5 MB or smaller.");
      setBatchFile(null);
      if (batchFileInputRef.current) {
        batchFileInputRef.current.value = "";
      }
      return;
    }

    setBatchFile(selected);
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

  const handleBatchUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBatchError(null);
    setBatchStatus(null);
    setBatchResultErrors([]);

    if (loadingMetadata) {
      setBatchError("Please wait for metadata to finish loading.");
      return;
    }

    if (
      !selectedUniversity ||
      !selectedFaculty ||
      !selectedYear ||
      !selectedUnit ||
      !selectedSubject ||
      !selectedCourse
    ) {
      setBatchError(
        "Select university, faculty, unit, module, and course before uploading.",
      );
      return;
    }

    if (!batchFile) {
      setBatchError("Choose a spreadsheet file to upload.");
      return;
    }

    setBatchSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", batchFile);
      formData.append("year_of_study", selectedYear);
      formData.append("university", selectedUniversity);
      formData.append("faculty", selectedFaculty);
      formData.append("unit", selectedUnit);
      formData.append("subject", selectedSubject);
      formData.append("course", selectedCourse);

      const response = await apiFetch<{
        data?: {
          created: number;
          failed: number;
          errors: { row: number; message: string }[];
        };
        message?: string;
      }>("/mcq/batch-upload", {
        method: "POST",
        body: formData,
      });

      const result = response?.data;
      if (result) {
        const previewItems = Array.isArray((result as any)?.preview)
          ? (result as any).preview
          : [];
        const normalizedPreview: ImportedPreview[] = previewItems.map(
          (item: any) => ({
            id: item?.id ?? "",
            question: item?.question ?? "",
            type: item?.type ?? "mcq",
            estimated_time: clampPositiveInt(Number(item?.estimated_time) ?? 0),
            approval_status: item?.approval_status ?? "pending",
            difficulty: item?.difficulty ?? "medium",
            quiz_type: item?.quiz_type ?? "theorique",
            options: Array.isArray(item?.options)
              ? item.options.map((option: any) => ({
                  id: option?.id ?? "",
                  content:
                    option?.content ?? option?.text ?? option?.label ?? "",
                  is_correct: Boolean(
                    option?.is_correct ?? option?.isCorrect ?? option?.correct,
                  ),
                }))
              : [],
            answer: item?.answer ?? "",
            explanation: item?.explanation ?? "",
          }),
        );
        setLatestPreview(normalizedPreview);
        setBatchStatus(
          `Imported ${result.created} question(s). ${result.failed} row(s) skipped.`,
        );
        setBatchResultErrors(result.errors ?? []);
        setPendingMessage(
          "Import complete. Review the pending MCQs below before approving.",
        );
        await loadPendingMcqs();
      } else {
        setLatestPreview([]);
        setBatchStatus("Spreadsheet processed successfully.");
      }

      setBatchFile(null);
      if (batchFileInputRef.current) {
        batchFileInputRef.current.value = "";
      }
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      setLatestPreview([]);
      setBatchError(
        err instanceof Error
          ? err.message
          : "Failed to upload the spreadsheet.",
      );
    } finally {
      setBatchSubmitting(false);
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

      <section
        style={{
          border: "1px solid #d1d5db",
          borderRadius: 8,
          padding: "1rem",
          display: "grid",
          gap: "1rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Course context</h2>
        <p style={{ margin: 0, color: "#6b7280" }}>
          These selections are reused for AI generation and spreadsheet uploads.
        </p>
        <div style={{ display: "grid", gap: "1rem" }}>
          <label style={labelStyle}>
            <span>University</span>
            <select
              value={selectedUniversity}
              onChange={(event) => setSelectedUniversity(event.target.value)}
              style={inputStyle}
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
        </div>
      </section>

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
          <legend style={{ padding: "0 0.5rem" }}>Generation details</legend>
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

      <section
        style={{
          border: "1px solid #d1d5db",
          borderRadius: 8,
          padding: "1rem",
          display: "grid",
          gap: "1rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
          Batch upload from spreadsheet
        </h2>
        <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.5 }}>
          Upload an Excel (.xlsx, .xls) or CSV file with the columns{" "}
          <strong>
            Question Text, Question Type, Quiz Type, Difficulty, Tag, Promo,
            Time (sec), Option 1-5, Correct Option(s), Answer Text, Explanation
          </strong>
          . For MCQs the service infers QCM/QCS based on the correct options,
          and for QROC rows the answer text is saved directly.
        </p>

        <form style={formStyle} onSubmit={handleBatchUpload}>
          <p style={{ margin: 0, color: "#6b7280" }}>
            Course context is taken from the fields above. Difficulty, quiz type,
            tag, promo year, and timings come directly from the spreadsheet
            columns.
          </p>
          <label style={labelStyle}>
            <span>Spreadsheet file (.xlsx, .xls, .csv)</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleBatchFileChange}
              ref={batchFileInputRef}
              disabled={batchSubmitting}
              required
            />
          </label>

          <button
            type="submit"
            style={buttonStyle}
            disabled={batchSubmitting || loadingMetadata}
          >
            {batchSubmitting ? "Uploading..." : "Upload questions"}
          </button>
        </form>
      </section>

      {batchStatus && (
        <p style={{ color: "#047857", marginTop: 0 }}>{batchStatus}</p>
      )}

      {batchError && (
        <p style={{ color: "#b91c1c" }} role="alert">
          {batchError}
        </p>
      )}

      {batchResultErrors.length > 0 && (
        <div
          style={{
            borderLeft: "4px solid #f97316",
            background: "#fff7ed",
            padding: "0.75rem 1rem",
            borderRadius: 8,
            color: "#92400e",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>Rows skipped</p>
          <ul
            style={{
              margin: "0.5rem 0 0",
              paddingLeft: "1.25rem",
              display: "grid",
              gap: "0.25rem",
              fontSize: "0.95rem",
            }}
          >
            {batchResultErrors.slice(0, 5).map((item) => (
              <li key={`${item.row}-${item.message}`}>
                Row {item.row}: {item.message}
              </li>
            ))}
          </ul>
          {batchResultErrors.length > 5 && (
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>
              {batchResultErrors.length - 5} additional row(s) skipped.
            </p>
          )}
        </div>
      )}

      {latestPreview.length > 0 && (
        <section
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 8,
            padding: "1rem",
            display: "grid",
            gap: "1rem",
            backgroundColor: "#f9fafb",
          }}
        >
          <div style={cardHeaderStyle}>
            <h2 style={{ margin: 0 }}>Latest upload preview</h2>
            <p style={subtleTextStyle}>
              {latestPreview.length} item{latestPreview.length > 1 ? "s" : ""}
            </p>
          </div>
          <p style={{ ...subtleTextStyle, margin: 0 }}>
            These questions were parsed from your last spreadsheet upload. Use
            this preview to double-check the imported content before approving
            it.
          </p>
          <div style={cardListStyle}>
            {latestPreview.map((item) => (
              <article key={item.id || item.question} style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <span style={{ fontWeight: 600 }}>
                    {(item.type ?? "mcq").toUpperCase()}
                  </span>
                  <span style={subtleTextStyle}>
                    Estimated time: {formatSeconds(item.estimated_time)}
                  </span>
                </div>
                <div
                  style={{ lineHeight: 1.5 }}
                  dangerouslySetInnerHTML={{
                    __html:
                      item.question && item.question.trim().length > 0
                        ? item.question
                        : "<em>No question provided.</em>",
                  }}
                />
                <p style={subtleTextStyle}>
                  Difficulty: {item.difficulty ?? "-"} • Quiz type:{" "}
                  {item.quiz_type ?? "-"}
                </p>
                {item.options && item.options.length > 0 ? (
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "1.25rem",
                      display: "grid",
                      gap: "0.25rem",
                    }}
                  >
                    {item.options.map((option, optionIndex) => (
                      <li key={option.id ?? `${item.id}-${optionIndex}`}>
                        {option.is_correct ? "✅ " : ""}
                        {option.content && option.content.trim().length > 0
                          ? option.content
                          : "Empty option"}
                      </li>
                    ))}
                  </ul>
                ) : item.answer ? (
                  <p style={subtleTextStyle}>Answer: {item.answer}</p>
                ) : null}
                {item.explanation && item.explanation.trim().length > 0 && (
                  <p style={subtleTextStyle}>Explanation: {item.explanation}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
      <section
        style={{
          border: "1px solid #d1d5db",
          borderRadius: 8,
          padding: "1rem",
          display: "grid",
          gap: "1rem",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={cardHeaderStyle}>
          <h2 style={{ margin: 0 }}>Pending MCQs</h2>
          <button
            type="button"
            style={approveActionButton}
            onClick={handleApproveAll}
            disabled={pendingLoading || pendingMcqs.length === 0}
          >
            Approve all
          </button>
        </div>
        <p style={{ ...subtleTextStyle, margin: 0 }}>
          Newly imported MCQs stay pending until you approve them. Edit any item
          to fix mistakes, then approve individually or all at once.
        </p>

        {pendingMessage && (
          <p style={{ color: "#047857", margin: 0 }}>{pendingMessage}</p>
        )}

        {pendingError && (
          <p style={{ color: "#b91c1c", margin: 0 }} role="alert">
            {pendingError}
          </p>
        )}

        {pendingLoading ? (
          <p style={subtleTextStyle}>Loading pending MCQs…</p>
        ) : pendingMcqs.length > 0 ? (
          <div style={cardListStyle}>
            {pendingMcqs.map((item) => (
              <article key={item.id} style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <span style={{ fontWeight: 600 }}>
                    {(item.type ?? "mcq").toUpperCase()} •{" "}
                    {item.difficulty ?? "-"}
                  </span>
                  <span style={subtleTextStyle}>
                    Estimated time: {formatSeconds(item.estimated_time)}
                  </span>
                </div>
                <div
                  style={{ lineHeight: 1.5 }}
                  dangerouslySetInnerHTML={{
                    __html:
                      item.question && item.question.trim().length > 0
                        ? item.question
                        : "<em>No question provided.</em>",
                  }}
                />
                {item.options && item.options.length > 0 ? (
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "1.25rem",
                      display: "grid",
                      gap: "0.25rem",
                    }}
                  >
                    {item.options.map((option, optionIndex) => (
                      <li key={option.id ?? `${item.id}-${optionIndex}`}>
                        {option.is_correct ? "✅ " : ""}
                        {option.content && option.content.trim().length > 0
                          ? option.content
                          : "Empty option"}
                      </li>
                    ))}
                  </ul>
                ) : item.answer ? (
                  <p style={subtleTextStyle}>Answer: {item.answer}</p>
                ) : null}
                {item.explanation && item.explanation.trim().length > 0 && (
                  <p style={subtleTextStyle}>Explanation: {item.explanation}</p>
                )}

                <div style={actionRowStyle}>
                  <button
                    type="button"
                    style={secondaryActionButton}
                    onClick={() => openEditMcq(item.id)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    style={approveActionButton}
                    onClick={() => handleApproveMcq(item.id)}
                    disabled={pendingLoading}
                  >
                    Approve
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p style={subtleTextStyle}>
            No pending MCQs for this course. Upload a spreadsheet to add more
            questions.
          </p>
        )}

        {editingMcq && (
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: "1rem",
              display: "grid",
              gap: "0.75rem",
            }}
          >
            <h3 style={{ margin: 0 }}>Edit MCQ</h3>
            <label style={labelStyle}>
              <span>Question</span>
              <textarea
                value={editingMcq.question}
                onChange={(event) =>
                  updateEditingField("question", event.target.value)
                }
                style={{ ...inputStyle, minHeight: "6rem" }}
              />
            </label>

            <label style={labelStyle}>
              <span>Estimated time (seconds)</span>
              <input
                type="number"
                min={1}
                value={editingMcq.estimated_time}
                onChange={(event) =>
                  updateEditingField(
                    "estimated_time",
                    Math.max(1, Number(event.target.value) || 1),
                  )
                }
                style={inputStyle}
              />
            </label>

            {(editingMcq.type === "qcm" || editingMcq.type === "qcs") && (
              <section style={{ display: "grid", gap: "0.75rem" }}>
                <h4 style={{ margin: 0 }}>Answer options</h4>
                {editingMcq.options.map((option, index) => (
                  <div
                    key={option.id ?? `${editingMcq.id}-${index}`}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      padding: "0.75rem",
                      display: "grid",
                      gap: "0.5rem",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={option.is_correct}
                        onChange={() => toggleOptionCorrect(index)}
                      />
                      <span>Correct</span>
                    </label>
                    <input
                      type="text"
                      value={option.content}
                      onChange={(event) =>
                        updateOptionContent(index, event.target.value)
                      }
                      style={inputStyle}
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
              </section>
            )}

            {editingMcq.type === "qroc" && (
              <label style={labelStyle}>
                <span>Expected answer</span>
                <input
                  type="text"
                  value={editingMcq.answer ?? ""}
                  onChange={(event) =>
                    updateEditingField("answer", event.target.value)
                  }
                  style={inputStyle}
                />
              </label>
            )}

            <label style={labelStyle}>
              <span>Explanation (optional)</span>
              <textarea
                value={editingMcq.explanation ?? ""}
                onChange={(event) =>
                  updateEditingField("explanation", event.target.value)
                }
                style={{ ...inputStyle, minHeight: "4.5rem" }}
              />
            </label>

            <div style={actionRowStyle}>
              <button
                type="button"
                style={secondaryActionButton}
                onClick={closeEditing}
                disabled={editingSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                style={approveActionButton}
                onClick={saveEditingMcq}
                disabled={editingSaving}
              >
                {editingSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
