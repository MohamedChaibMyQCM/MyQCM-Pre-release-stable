"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type CSSProperties,
  type SVGProps,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
} from "@/app/lib/api";

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

const WORKFLOW_TABS = [
  {
    value: "generate",
    label: "AI generator",
    description: "Upload a source file and let the assistant propose questions.",
  },
  {
    value: "upload",
    label: "Spreadsheet upload",
    description: "Import a curated batch with fine-grained control.",
  },
] as const;

const DEFAULT_PENDING_VIEW_LIMIT = 15;
const PREVIEW_LIMIT = 5;
const COURSE_CONTEXT_STORAGE_KEY = "freelancer-course-context";
const COURSE_CONTEXT_PREFERENCE_KEY = "freelancer-course-context-remember";

const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
    <path
      d="M16.704 5.216a.75.75 0 0 0-1.24-.78l-6.416 7.166-2.596-2.596a.75.75 0 0 0-1.06 1.06l3.2 3.2a.75.75 0 0 0 1.102-.04l6.01-7.01Z"
      fill="currentColor"
    />
  </svg>
);

type StepStatus = "current" | "complete" | "upcoming";

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

type PersistedCourseContext = {
  university?: string;
  faculty?: string;
  year?: string;
  unit?: string;
  subject?: string;
  course?: string;
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
    .map((item) => {
      const rawId =
        item?.id ??
        item?.uuid ??
        item?._id ??
        item?.value ??
        item?.courseId ??
        item?.course_id ??
        item?.course?.id ??
        "";
      const id =
        typeof rawId === "string"
          ? rawId
          : rawId !== null && rawId !== undefined
          ? String(rawId)
          : "";

      return {
        id,
        name:
          item?.name ??
          item?.title ??
          item?.label ??
          item?.course_name ??
          "Unnamed",
      };
    })
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
  const [hasLoadedPersistedContext, setHasLoadedPersistedContext] = useState(false);
  const [rememberContext, setRememberContext] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([
    "mcq",
  ]);

  const [mcqCount, setMcqCount] = useState<number>(10);
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
  const [activeWorkflow, setActiveWorkflow] = useState<
    (typeof WORKFLOW_TABS)[number]["value"]
  >("generate");
  const [previewExpanded, setPreviewExpanded] = useState(true);
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingViewLimit, setPendingViewLimit] = useState(
    DEFAULT_PENDING_VIEW_LIMIT,
  );
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const previewSectionRef = useRef<HTMLDivElement | null>(null);
  const pendingSectionRef = useRef<HTMLDivElement | null>(null);
  const editingSectionRef = useRef<HTMLDivElement | null>(null);
  const editingQuestionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const persistedContextRef = useRef<PersistedCourseContext | null>(null);
  const hydrationStateRef = useRef({
    university: false,
    faculty: false,
    year: false,
    unit: false,
    subject: false,
    course: false,
  });

  const toggleContentType = (value: "mcq" | "qroc") => {
    setSelectedContentTypes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const scrollToPreview = useCallback(
    (force: boolean = false) => {
      if (!force && latestPreview.length === 0) {
        return;
      }
      setPreviewExpanded(true);
      previewSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    [latestPreview.length],
  );

  const scrollToPending = useCallback(() => {
    setReviewModalOpen(true);
  }, []);

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
        toast.success("MCQ approved");
        await loadPendingMcqs();
        scrollToPending();
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          redirectToLogin();
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Unable to approve this MCQ.";
        setPendingError(message);
        toast.error(message);
      }
    },
    [loadPendingMcqs, scrollToPending],
  );

  const handleApproveAll = useCallback(async () => {
    if (pendingMcqs.length === 0) {
      setPendingMessage("No pending MCQs to approve.");
      toast("No pending MCQs to approve.");
      return;
    }

    setPendingMessage(null);
    setPendingError(null);

    try {
      await apiFetch(`/mcq/approve/all`, { method: "POST" });
      setPendingMessage("All pending MCQs approved.");
      toast.success("All pending MCQs approved");
      await loadPendingMcqs();
      scrollToPending();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      const message =
        error instanceof Error
          ? error.message
          : "Unable to approve all MCQs.";
      setPendingError(message);
      toast.error(message);
    }
  }, [loadPendingMcqs, pendingMcqs.length, scrollToPending]);

  const closeEditing = useCallback(() => {
    setEditingMcq(null);
  }, []);

  const handleRemoveMcq = useCallback(
    async (mcqId: string) => {
      if (!mcqId) return;
      setPendingMessage(null);
      setPendingError(null);

      if (typeof window !== "undefined") {
        const confirmed = window.confirm(
          "Remove this MCQ from the pending queue?",
        );
        if (!confirmed) {
          return;
        }
      }

      try {
        await apiFetch(`/mcq/${mcqId}`, { method: "DELETE" });
        setPendingMessage("MCQ removed.");
        toast.success("MCQ removed");
        if (editingMcq?.id === mcqId) {
          closeEditing();
        }
        await loadPendingMcqs();
        scrollToPending();
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          redirectToLogin();
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Unable to remove this MCQ.";
        setPendingError(message);
        toast.error(message);
      }
    },
    [closeEditing, editingMcq, loadPendingMcqs, scrollToPending],
  );

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

  const closeReviewModal = useCallback(() => {
    closeEditing();
    setReviewModalOpen(false);
    setPendingSearch("");
    setPendingViewLimit(DEFAULT_PENDING_VIEW_LIMIT);
  }, [closeEditing]);

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
      toast.success("MCQ updated");
      setEditingMcq(null);
      await loadPendingMcqs();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      const message =
        error instanceof Error ? error.message : "Unable to update MCQ.";
      setPendingError(message);
      toast.error(message);
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
    if (
      !rememberContext ||
      !hasLoadedPersistedContext ||
      hydrationStateRef.current.year
    ) {
      if (!rememberContext) {
        hydrationStateRef.current.year = true;
      }
      return;
    }
    const savedYear = persistedContextRef.current?.year;
    if (savedYear && YEAR_OF_STUDY_OPTIONS.includes(savedYear) && !selectedYear) {
      setSelectedYear(savedYear);
    }
    hydrationStateRef.current.year = true;
  }, [hasLoadedPersistedContext, rememberContext, selectedYear]);

  useEffect(() => {
    if (
      !rememberContext ||
      !hasLoadedPersistedContext ||
      hydrationStateRef.current.university
    ) {
      if (!rememberContext) {
        hydrationStateRef.current.university = true;
      }
      return;
    }
    const savedUniversity = persistedContextRef.current?.university;
    if (!savedUniversity) {
      hydrationStateRef.current.university = true;
      return;
    }
    if (!universities.length) {
      return;
    }
    if (!selectedUniversity && universities.some((item) => item.id === savedUniversity)) {
      setSelectedUniversity(savedUniversity);
    }
    hydrationStateRef.current.university = true;
  }, [hasLoadedPersistedContext, rememberContext, selectedUniversity, universities]);

  useEffect(() => {
    if (
      !rememberContext ||
      !hasLoadedPersistedContext ||
      hydrationStateRef.current.faculty
    ) {
      if (!rememberContext) {
        hydrationStateRef.current.faculty = true;
      }
      return;
    }
    const savedFaculty = persistedContextRef.current?.faculty;
    if (!savedFaculty) {
      hydrationStateRef.current.faculty = true;
      return;
    }
    if (!selectedUniversity || !faculties.length) {
      return;
    }
    if (!selectedFaculty && faculties.some((item) => item.id === savedFaculty)) {
      setSelectedFaculty(savedFaculty);
    }
    hydrationStateRef.current.faculty = true;
  }, [
    faculties,
    hasLoadedPersistedContext,
    rememberContext,
    selectedFaculty,
    selectedUniversity,
  ]);

  useEffect(() => {
    if (
      !rememberContext ||
      !hasLoadedPersistedContext ||
      hydrationStateRef.current.unit
    ) {
      if (!rememberContext) {
        hydrationStateRef.current.unit = true;
      }
      return;
    }
    const savedUnit = persistedContextRef.current?.unit;
    if (!savedUnit) {
      hydrationStateRef.current.unit = true;
      return;
    }
    if (!selectedYear || !units.length) {
      return;
    }
    if (!selectedUnit && units.some((item) => item.id === savedUnit)) {
      setSelectedUnit(savedUnit);
    }
    hydrationStateRef.current.unit = true;
  }, [hasLoadedPersistedContext, rememberContext, selectedUnit, selectedYear, units]);

  useEffect(() => {
    if (
      !rememberContext ||
      !hasLoadedPersistedContext ||
      hydrationStateRef.current.subject
    ) {
      if (!rememberContext) {
        hydrationStateRef.current.subject = true;
      }
      return;
    }
    const savedSubject = persistedContextRef.current?.subject;
    if (!savedSubject) {
      hydrationStateRef.current.subject = true;
      return;
    }
    if (!selectedUnit || !subjects.length) {
      return;
    }
    if (!selectedSubject && subjects.some((item) => item.id === savedSubject)) {
      setSelectedSubject(savedSubject);
    }
    hydrationStateRef.current.subject = true;
  }, [hasLoadedPersistedContext, rememberContext, selectedSubject, selectedUnit, subjects]);

  useEffect(() => {
    if (
      !rememberContext ||
      !hasLoadedPersistedContext ||
      hydrationStateRef.current.course
    ) {
      if (!rememberContext) {
        hydrationStateRef.current.course = true;
      }
      return;
    }
    const savedCourse = persistedContextRef.current?.course;
    if (!savedCourse) {
      hydrationStateRef.current.course = true;
      return;
    }
    if (!selectedSubject || !courses.length) {
      return;
    }
    if (!selectedCourse && courses.some((item) => item.id === savedCourse)) {
      setSelectedCourse(savedCourse);
    }
    hydrationStateRef.current.course = true;
  }, [courses, hasLoadedPersistedContext, rememberContext, selectedCourse, selectedSubject]);

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
    } else if (mcqCount <= 0) {
      setMcqCount(10);
    }
    if (!selectedContentTypes.includes("qroc")) {
      setQrocCount(0);
    }
  }, [selectedContentTypes, mcqCount]);

  useEffect(() => {
    setPendingViewLimit(DEFAULT_PENDING_VIEW_LIMIT);
  }, [pendingSearch, pendingMcqs]);

  useEffect(() => {
    setPendingSearch("");
    setPendingViewLimit(DEFAULT_PENDING_VIEW_LIMIT);
  }, [selectedCourse]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasLoadedPersistedContext) {
      return;
    }
    if (!rememberContext) {
      window.localStorage.removeItem(COURSE_CONTEXT_STORAGE_KEY);
      persistedContextRef.current = null;
      return;
    }
    if (!hydrationStateRef.current.course && persistedContextRef.current) {
      return;
    }
    const payload: PersistedCourseContext = {
      university: selectedUniversity || undefined,
      faculty: selectedFaculty || undefined,
      year: selectedYear || undefined,
      unit: selectedUnit || undefined,
      subject: selectedSubject || undefined,
      course: selectedCourse || undefined,
    };
    persistedContextRef.current = payload;
    try {
      window.localStorage.setItem(
        COURSE_CONTEXT_STORAGE_KEY,
        JSON.stringify(payload),
      );
    } catch {
      // ignore write failures
    }
  }, [
    hasLoadedPersistedContext,
    rememberContext,
    selectedCourse,
    selectedFaculty,
    selectedSubject,
    selectedUnit,
    selectedUniversity,
    selectedYear,
  ]);

  useEffect(() => {
    if (latestPreview.length > 0) {
      scrollToPreview(true);
    }
  }, [latestPreview.length, scrollToPreview]);

  useEffect(() => {
    if (!reviewModalOpen) {
      return;
    }
    const node = pendingSectionRef.current;
    if (node) {
      node.focus({ preventScroll: true });
      node.scrollTop = 0;
    }
  }, [reviewModalOpen]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const { body } = document;
    const previousOverflow = body.style.overflow;

    if (reviewModalOpen) {
      body.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [reviewModalOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setHasLoadedPersistedContext(true);
      return;
    }

    const preference =
      window.localStorage.getItem(COURSE_CONTEXT_PREFERENCE_KEY) === "true";
    setRememberContext(preference);

    if (preference) {
      try {
        const stored = window.localStorage.getItem(COURSE_CONTEXT_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as PersistedCourseContext;
          persistedContextRef.current = parsed;
        }
      } catch {
        // Ignore JSON parse errors and fall back to defaults.
      }
    }

    setHasLoadedPersistedContext(true);
  }, []);

  useEffect(() => {
    if (!reviewModalOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeReviewModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeReviewModal, reviewModalOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasLoadedPersistedContext) {
      return;
    }
    window.localStorage.setItem(
      COURSE_CONTEXT_PREFERENCE_KEY,
      rememberContext ? "true" : "false",
    );
    if (!rememberContext) {
      window.localStorage.removeItem(COURSE_CONTEXT_STORAGE_KEY);
      persistedContextRef.current = null;
    }
  }, [hasLoadedPersistedContext, rememberContext]);

  useEffect(() => {
    if (!reviewModalOpen || !editingMcq) {
      return;
    }
    const timeout = window.setTimeout(() => {
      editingSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      editingQuestionInputRef.current?.focus({ preventScroll: true });
    }, 80);
    return () => window.clearTimeout(timeout);
  }, [editingMcq, reviewModalOpen]);

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
      const message = "Spreadsheet must be 5 MB or smaller.";
      setBatchError(message);
      setBatchStatus(message);
      toast.error(message);

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
      const message = "Please choose university, faculty, and year of study.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!selectedUnit) {
      const message = "Please choose a unit.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!selectedSubject) {
      const message = "Please choose a module.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!selectedCourse) {
      const message = "Please choose a course.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!file) {
      const message = "Please select a source document to upload.";
      setError(message);
      toast.error(message);
      return;
    }

    if (selectedContentTypes.length === 0) {
      const message = "Select at least one content type (MCQ or QROC).";
      setError(message);
      toast.error(message);
      return;
    }

    if (
      selectedContentTypes.includes("mcq") &&
      (!Number.isFinite(mcqCount) || mcqCount <= 0)
    ) {
      const message = "Enter a positive number of MCQs to generate.";
      setError(message);
      toast.error(message);
      return;
    }

    if (
      selectedContentTypes.includes("qroc") &&
      (!Number.isFinite(qrocCount) || qrocCount <= 0)
    ) {
      const message = "Enter a positive number of QROCs to generate.";
      setError(message);
      toast.error(message);
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

      toast.success("Generation request created");
      router.push(`/generation/${requestId}`);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : "Unable to create generation request.";
      setError(message);
      toast.error(message);
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
      const message = "Please wait for metadata to finish loading.";
      setBatchError(message);
      toast.error(message);
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
      const message =
        "Select university, faculty, unit, module, and course before uploading.";
      setBatchError(message);
      toast.error(message);
      return;
    }

    if (!batchFile) {
      const message = "Choose a spreadsheet file to upload.";
      setBatchError(message);
      toast.error(message);
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
      let statusMessage = "Spreadsheet processed successfully.";
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
        statusMessage = `Imported ${result.created} question(s). ${result.failed} row(s) skipped.`;
        setBatchResultErrors(result.errors ?? []);
        setPendingMessage(
          "Import complete. Review the pending MCQs below before approving.",
        );
        await loadPendingMcqs();
      } else {
        setLatestPreview([]);
      }
      setBatchStatus(statusMessage);
      toast.success(statusMessage);

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
      const message =
        err instanceof Error
          ? err.message
          : "Failed to upload the spreadsheet.";
      setBatchError(message);
      toast.error(message);
    } finally {
      setBatchSubmitting(false);
    }
  };

  const contextComplete = Boolean(
    selectedUniversity &&
      selectedFaculty &&
      selectedYear &&
      selectedUnit &&
      selectedSubject &&
      selectedCourse,
  );

  const normalizedSearch = pendingSearch.trim().toLowerCase();
  const pendingFiltered = normalizedSearch
    ? pendingMcqs.filter((item) =>
        item.question.toLowerCase().includes(normalizedSearch),
      )
    : pendingMcqs;
  const visiblePending = pendingFiltered.slice(0, pendingViewLimit);
  const hasMorePending = pendingFiltered.length > pendingViewLimit;
  const previewToRender = previewExpanded
    ? latestPreview.slice(0, PREVIEW_LIMIT)
    : [];
  const hasMorePreview = latestPreview.length > PREVIEW_LIMIT;

  const hasCreatedContent = Boolean(
    progressMessage ||
      batchStatus ||
      latestPreview.length > 0 ||
      pendingMcqs.length > 0,
  );
  const needsReview = pendingMcqs.length > 0 || Boolean(editingMcq);
  const currentStepIndex = !contextComplete
    ? 0
    : needsReview
    ? 2
    : hasCreatedContent
    ? 1
    : 1;

  const steps = [
    {
      id: "context",
      label: "Course context",
      description: "Select the academic scope for this session.",
    },
    {
      id: "create",
      label: "Create questions",
      description:
        activeWorkflow === "generate"
          ? "Use AI to transform your source files into draft MCQs."
          : "Upload a prepared spreadsheet to import questions in bulk.",
    },
    {
      id: "review",
      label: "Review and approve",
      description:
        "Edit, approve, and publish your pending questions with confidence.",
    },
  ].map((step, index) => ({
    ...step,
    status:
      index < currentStepIndex
        ? ("complete" as StepStatus)
        : index === currentStepIndex
        ? ("current" as StepStatus)
        : ("upcoming" as StepStatus),
  }));

  const pendingSummary =
    pendingMcqs.length === 0
      ? "No pending MCQs for this course yet."
      : `${pendingMcqs.length} pending question${
          pendingMcqs.length === 1 ? "" : "s"
        } ready for review.`;

  const metadataBlockingActions = false;
  const disabledFromGeneration = submitting || metadataBlockingActions;
  const disabledFromUpload = batchSubmitting || metadataBlockingActions;
  const baseInputClasses =
    "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";
  const secondaryButtonClasses =
    "inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-500 disabled:bg-slate-100 disabled:translate-y-0 sm:w-auto";
  const dangerButtonClasses =
    "inline-flex w-full items-center justify-center rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 disabled:cursor-not-allowed disabled:border-rose-200 disabled:text-rose-300 disabled:bg-rose-50 disabled:translate-y-0 sm:w-auto";
  const primaryButtonClasses =
    "inline-flex w-full items-center justify-center rounded-full border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-100 disabled:text-emerald-700 disabled:shadow-none disabled:translate-y-0 sm:w-auto";
  const primaryButtonStyle = (disabled: boolean): CSSProperties => ({
    backgroundColor: disabled ? "#d1fae5" : "#047857",
    borderColor: disabled ? "#6ee7b7" : "#047857",
    color: disabled ? "#065f46" : "#ffffff",
  });
  const showPreviewCard = latestPreview.length > 0 || Boolean(batchStatus);

  const handleWorkflowTabClick = (
    value: (typeof WORKFLOW_TABS)[number]["value"],
  ) => {
    if (!contextComplete) {
      toast.error("Complete the course context first.");
      return;
    }
    setActiveWorkflow(value);
  };

  const generateDisabledReason = !contextComplete
    ? "Complete the course context first."
    : disabledFromGeneration
    ? "Still loading prerequisites."
    : null;
  const generateInlineHint = !file
    ? "Attach the source document to launch generation."
    : null;

  const uploadDisabledReason = !contextComplete
    ? "Complete the course context first."
    : disabledFromUpload
    ? "Upload already in progress."
    : null;
  const uploadInlineHint = !batchFile
    ? "Choose a spreadsheet file to upload."
    : null;

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 lg:px-0">
        <header className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Freelancer workspace
          </span>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Question generation hub
          </h1>
          <p className="max-w-2xl text-base text-slate-600">
            Guide freelancers through a calm, structured flow to create or
            import new questions, then polish and approve them before release.
          </p>
        </header>

        <div className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Clinical cases
            </span>
            <h2 className="text-lg font-semibold text-slate-900">
              Need to input a full clinical case manually?
            </h2>
            <p className="text-sm text-slate-600">
              Switch to the dedicated builder to capture the scenario, objectives, and MCQs for a case without going through the AI workflow.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/generation/clinical-case/new"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#F8589F] to-[#E74C8C] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-lg"
            >
              Open the clinical case builder
            </Link>
            <span className="text-xs text-slate-500">
              You can come back here at any time to resume question generation.
            </span>
          </div>
        </div>

        <ol className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:grid-cols-3">
          {steps.map((step, index) => {
            const statusStyles: Record<StepStatus, string> = {
              complete:
                "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm",
              current:
                "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm",
              upcoming: "border-slate-200 bg-slate-50 text-slate-500",
            };
            const badgeStyles: Record<StepStatus, string> = {
              complete: "bg-emerald-600 text-white",
              current: "bg-indigo-600 text-white",
              upcoming: "bg-white text-slate-500",
            };

            return (
              <li
                key={step.id}
                className={`flex flex-col gap-3 rounded-2xl border p-4 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md ${statusStyles[step.status]}`}
              >
                <span className="flex items-center gap-3 text-sm font-semibold">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border border-white text-base font-semibold ${badgeStyles[step.status]}`}
                  >
                    {step.status === "complete" ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {step.label}
                </span>
                <p className="text-sm text-slate-500">{step.description}</p>
              </li>
            );
          })}
        </ol>

        <section className="flex flex-col gap-6">
          <div
            ref={pendingSectionRef}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 1</p>
                <h2 className="text-lg font-semibold text-slate-900">Course context</h2>
                <p className="text-sm text-slate-500">
                  These selections are reused for AI generation and spreadsheet uploads.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 text-xs sm:items-end">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium ${
                    contextComplete
                      ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {contextComplete ? "Ready" : "Complete required fields"}
                </span>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 transition-colors duration-200 focus:ring-indigo-500"
                    checked={rememberContext}
                    onChange={(event) => setRememberContext(event.target.checked)}
                  />
                  <span>Remember these selections on this device</span>
                </label>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-600">University</span>
                <select
                  className={baseInputClasses}
                  value={selectedUniversity}
                  onChange={(event) => setSelectedUniversity(event.target.value)}
                  disabled={loadingMetadata}
                >
                  <option value="">Select university</option>
                  {universities.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-600">Faculty</span>
                <select
                  className={baseInputClasses}
                  value={selectedFaculty}
                  onChange={(event) => setSelectedFaculty(event.target.value)}
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
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-600">Year of study</span>
                <select
                  className={baseInputClasses}
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                >
                  <option value="">Select year</option>
                  {YEAR_OF_STUDY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-600">Unit</span>
                <select
                  className={baseInputClasses}
                  value={selectedUnit}
                  onChange={(event) => setSelectedUnit(event.target.value)}
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
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-600">Module</span>
                <select
                  className={baseInputClasses}
                  value={selectedSubject}
                  onChange={(event) => setSelectedSubject(event.target.value)}
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
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-600">Course</span>
                <select
                  className={baseInputClasses}
                  value={selectedCourse}
                  onChange={(event) => setSelectedCourse(event.target.value)}
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
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 2</p>
                <h2 className="text-lg font-semibold text-slate-900">Create questions</h2>
                <p className="text-sm text-slate-500">
                  Choose an approach to produce fresh content quickly or import prepared batches.
                </p>
              </div>
              <div className="flex flex-col items-start gap-1 text-xs text-slate-500 sm:items-end">
                <span>
                  {contextComplete
                    ? "Context locked for this session."
                    : "Complete step 1 to unlock actions."}
                </span>
                {submitting || batchSubmitting ? (
                  <span className="inline-flex items-center gap-2 text-indigo-600">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                    Working...
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {WORKFLOW_TABS.map((tab) => {
                const isActive = activeWorkflow === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleWorkflowTabClick(tab.value)}
                    className={`group rounded-2xl border px-4 py-3 text-left transition-transform duration-200 hover:-translate-y-0.5 ${
                      isActive
                        ? "border-indigo-400 bg-indigo-50 shadow-sm"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                    disabled={!contextComplete && !isActive}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        isActive ? "text-indigo-700" : "text-slate-700"
                      }`}
                    >
                      {tab.label}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {tab.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 border-t border-slate-100 pt-6">
              {activeWorkflow === "generate" ? (
                <form className="grid gap-6" onSubmit={handleSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">Difficulty</span>
                      <select
                        className={baseInputClasses}
                        value={selectedDifficulty}
                        onChange={(event) => setSelectedDifficulty(event.target.value)}
                        required
                        disabled={disabledFromGeneration}
                      >
                        {DIFFICULTY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-slate-700">MCQ count</span>
                        <input
                          type="number"
                          min={0}
                          className={baseInputClasses}
                          value={mcqCount}
                          onChange={(event) => setMcqCount(Number(event.target.value) || 0)}
                          disabled={
                            disabledFromGeneration ||
                            !selectedContentTypes.includes("mcq")
                          }
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-slate-700">QROC count</span>
                        <input
                          type="number"
                          min={0}
                          className={baseInputClasses}
                          value={qrocCount}
                          onChange={(event) => setQrocCount(Number(event.target.value) || 0)}
                          disabled={
                            disabledFromGeneration ||
                            !selectedContentTypes.includes("qroc")
                          }
                        />
                      </label>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {CONTENT_TYPE_OPTIONS.map((option) => {
                      const checked = selectedContentTypes.includes(option.value);
                      return (
                        <label
                          key={option.value}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                            checked
                              ? "border-indigo-400 bg-indigo-50 shadow-sm"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={checked}
                            onChange={() => toggleContentType(option.value)}
                            disabled={disabledFromGeneration}
                          />
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-slate-800">
                              {option.label}
                            </span>
                            <span className="text-xs text-slate-500">
                              {option.value === "mcq"
                                ? "Multiple-choice questions"
                                : "Short free-form answers"}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-700">Source document</span>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      onChange={handleFileChange}
                      required
                      disabled={disabledFromGeneration}
                      className="block w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 file:mr-4 file:rounded-full file:border-none file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <span className="text-xs text-slate-500">
                      Accepted formats: PDF, PPT, PPTX, DOC, DOCX.
                    </span>
                  </label>
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium text-slate-600">
                        Ready to launch? Start the AI generation or hop to the review queue.
                      </p>
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                        <button
                          type="submit"
                          className={primaryButtonClasses}
                          style={primaryButtonStyle(disabledFromGeneration)}
                          disabled={disabledFromGeneration}
                          title={
                            generateDisabledReason ?? "Send this request to the AI generator."
                          }
                        >
                          {submitting ? "Submitting..." : "Generate MCQs now"}
                        </button>
                        <button
                          type="button"
                          className={secondaryButtonClasses}
                          onClick={scrollToPending}
                          disabled={pendingMcqs.length === 0}
                          title={
                            pendingMcqs.length === 0
                              ? "You have no pending MCQs for this course yet."
                              : "Jump to the review queue."
                          }
                        >
                          View pending approvals
                        </button>
                      </div>
                    </div>
                    {generateDisabledReason && (
                      <p className="text-xs text-slate-500 sm:text-right">
                        {generateDisabledReason}
                      </p>
                    )}
                    {generateInlineHint && (
                      <p className="mt-1 text-xs text-slate-500 sm:text-right">
                        {generateInlineHint}
                      </p>
                    )}
                  </div>
                  {progressMessage && (
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                      {progressMessage}
                    </div>
                  )}
                  {error && (
                    <div
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}
                </form>
              ) : (
                <form className="grid gap-6" onSubmit={handleBatchUpload}>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-700">Spreadsheet template</span>
                    <p className="text-sm text-slate-500">
                      Include every column so the importer can match answers and metadata.
                    </p>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Columns:</span>{" "}
                      Question Text, Question Type, Quiz Type, Difficulty, Tag, Promo, Time (sec), Option 1-5,
                      Correct Option(s), Answer Text, Explanation.
                    </div>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-700">Spreadsheet file</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleBatchFileChange}
                      ref={batchFileInputRef}
                      disabled={disabledFromUpload}
                      required
                      className="block w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 file:mr-4 file:rounded-full file:border-none file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <span className="text-xs text-slate-500">
                      Upload .xlsx, .xls, or .csv files prepared from your template.
                    </span>
                  </label>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium text-slate-600">
                        Upload your spreadsheet and instantly review the imported questions.
                      </p>
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                        <button
                          type="submit"
                          className={primaryButtonClasses}
                          style={primaryButtonStyle(disabledFromUpload || !contextComplete)}
                          disabled={disabledFromUpload || !contextComplete}
                          title={
                            uploadDisabledReason ??
                            "Upload the spreadsheet and process its rows."
                          }
                        >
                          {batchSubmitting ? "Uploading..." : "Upload questions"}
                        </button>
                        <button
                          type="button"
                          className={secondaryButtonClasses}
                          onClick={() => scrollToPreview()}
                          disabled={latestPreview.length === 0}
                          title={
                            latestPreview.length === 0
                              ? "Upload a spreadsheet to see its preview."
                              : "Jump to the recently imported questions."
                          }
                        >
                          Review uploaded questions
                        </button>
                      </div>
                    </div>
                    {uploadDisabledReason && (
                      <p className="text-xs text-slate-500 sm:text-right">
                        {uploadDisabledReason}
                      </p>
                    )}
                    {uploadInlineHint && (
                      <p className="mt-1 text-xs text-slate-500 sm:text-right">
                        {uploadInlineHint}
                      </p>
                    )}
                  </div>
                  {batchStatus && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {batchStatus}
                    </div>
                  )}
                  {batchError && (
                    <div
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                      role="alert"
                    >
                      {batchError}
                    </div>
                  )}
                  {batchResultErrors.length > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      <p className="font-semibold text-amber-800">Rows to double-check</p>
                      <ul className="mt-2 space-y-1">
                        {batchResultErrors.map((item) => (
                          <li key={`${item.row}-${item.message}`} className="flex items-start gap-3">
                            <span className="font-semibold text-amber-800">Row {item.row}</span>
                            <span className="text-amber-700">{item.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {showPreviewCard && (
            <div
              ref={previewSectionRef}
              className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Snapshot
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Latest import preview
                  </h2>
                  <p className="text-sm text-slate-500">
                    {latestPreview.length > 0
                      ? `Showing ${
                          previewExpanded ? previewToRender.length : 0
                        } of ${latestPreview.length} question${
                          latestPreview.length === 1 ? "" : "s"
                        } just imported.`
                      : "No preview available yet. Upload a spreadsheet to see a sample."}
                  </p>
                </div>
                {latestPreview.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewExpanded((prev) => !prev)}
                    className={secondaryButtonClasses}
                  >
                    {previewExpanded ? "Hide preview" : "Show preview"}
                  </button>
                )}
              </div>
              {previewExpanded && previewToRender.length > 0 && (
                <div className="mt-6 grid gap-4">
                  {previewToRender.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                        <span className="rounded-full bg-white px-3 py-1">
                          {(item.type ?? "mcq").toUpperCase()}
                        </span>
                        <span>{item.difficulty ?? "-"}</span>
                        <span>{item.quiz_type ?? "-"}</span>
                        <span>{formatSeconds(item.estimated_time)}</span>
                      </div>
                      <div
                        className="mt-3 text-sm leading-6 text-slate-700 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5"
                        dangerouslySetInnerHTML={{
                          __html:
                            item.question && item.question.trim().length > 0
                              ? item.question
                              : "<em>No question provided.</em>",
                        }}
                      />
                      {item.options && item.options.length > 0 ? (
                        <ul className="mt-3 grid gap-1 text-sm text-slate-600">
                          {item.options.map((option, optionIndex) => (
                            <li key={option.id ?? `${item.id}-${optionIndex}`}>
                              {option.is_correct ? "[Correct] " : ""}
                              {option.content && option.content.trim().length > 0
                                ? option.content
                                : "Empty option"}
                            </li>
                          ))}
                        </ul>
                      ) : item.answer ? (
                        <p className="mt-3 text-sm text-slate-600">Answer: {item.answer}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
              {hasMorePreview && previewExpanded && (
                <p className="mt-4 text-xs text-slate-500">
                  Showing the first {PREVIEW_LIMIT} questions. Review the full set inside the pending area.
                </p>
              )}
            </div>
          )}

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 3</p>
                <h2 className="text-lg font-semibold text-slate-900">Review and approve</h2>
                <p className="text-sm text-slate-500">{pendingSummary}</p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={scrollToPending}
                  className={primaryButtonClasses}
                  style={primaryButtonStyle(false)}
                >
                  Open review workspace
                </button>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-4 text-sm text-slate-500">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      pendingLoading ? "animate-pulse bg-indigo-500" : "bg-emerald-500"
                    }`}
                  />
                  {pendingLoading ? "Refreshing list..." : "Up to date"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {pendingError ? (
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-600">
                      {pendingError}
                    </span>
                  ) : pendingMessage ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                      {pendingMessage}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-slate-600">
                Open the review workspace to browse, edit, approve, or remove pending MCQs imported from spreadsheets.
              </div>
            </div>
          </div>
          {reviewModalOpen && (
            <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto px-4 py-6 sm:items-center sm:py-12">
              <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={closeReviewModal}
              />
              <div className="relative z-10 flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[90vh]">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Pending workspace
                    </p>
                    <h2 className="text-xl font-semibold text-slate-900">Review pending MCQs</h2>
                    <p className="text-sm text-slate-500">{pendingSummary}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className={primaryButtonClasses}
                      onClick={handleApproveAll}
                      style={primaryButtonStyle(pendingLoading || pendingFiltered.length === 0)}
                      disabled={pendingLoading || pendingFiltered.length === 0}
                    >
                      {pendingLoading ? "Processing..." : "Approve all"}
                    </button>
                    <button
                      type="button"
                      className={secondaryButtonClasses}
                      onClick={closeReviewModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div
                  ref={pendingSectionRef}
                  tabIndex={-1}
                  className="flex-1 overflow-y-auto p-6 focus:outline-none"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                    {editingMcq ? (
                      <div
                        ref={editingSectionRef}
                        className="order-first w-full rounded-2xl border border-indigo-200 bg-indigo-50/80 p-6 text-sm text-slate-700 shadow-sm transition-all duration-300 lg:sticky lg:top-6 lg:order-none lg:max-h-[calc(90vh-8rem)] lg:w-[28rem] lg:overflow-y-auto"
                      >
                        <h3 className="text-base font-semibold text-indigo-900">Edit MCQ</h3>
                        <div className="mt-4 grid gap-4">
                          <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-slate-700">Question</span>
                            <textarea
                              ref={editingQuestionInputRef}
                              value={editingMcq.question}
                              onChange={(event) =>
                                updateEditingField("question", event.target.value)
                              }
                              className={`${baseInputClasses} min-h-[6rem]`}
                            />
                          </label>
                          <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-slate-700">
                              Estimated time (seconds)
                            </span>
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
                              className={baseInputClasses}
                            />
                          </label>
                          {(editingMcq.type === "qcm" || editingMcq.type === "qcs") && (
                            <div className="grid gap-3">
                              <p className="text-sm font-medium text-slate-700">Answer options</p>
                              {editingMcq.options.map((option, index) => (
                                <div
                                  key={option.id ?? `${editingMcq.id}-${index}`}
                                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                  <label className="flex items-center gap-3 text-sm text-slate-700">
                                    <input
                                      type="checkbox"
                                      checked={option.is_correct}
                                      onChange={() => toggleOptionCorrect(index)}
                                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>Mark as correct</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={option.content}
                                    onChange={(event) =>
                                      updateOptionContent(index, event.target.value)
                                    }
                                    className={`${baseInputClasses} mt-3`}
                                    placeholder={`Option ${index + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          {editingMcq.type === "qroc" && (
                            <label className="flex flex-col gap-2">
                              <span className="text-sm font-medium text-slate-700">Expected answer</span>
                              <input
                                type="text"
                                value={editingMcq.answer ?? ""}
                                onChange={(event) =>
                                  updateEditingField("answer", event.target.value)
                                }
                                className={baseInputClasses}
                              />
                            </label>
                          )}
                          <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-slate-700">
                              Explanation (optional)
                            </span>
                            <textarea
                              value={editingMcq.explanation ?? ""}
                              onChange={(event) =>
                                updateEditingField("explanation", event.target.value)
                              }
                              className={`${baseInputClasses} min-h-[5rem]`}
                            />
                          </label>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              className={secondaryButtonClasses}
                              onClick={closeEditing}
                              disabled={editingSaving}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className={primaryButtonClasses}
                              onClick={saveEditingMcq}
                              style={primaryButtonStyle(editingSaving)}
                              disabled={editingSaving}
                            >
                              {editingSaving ? "Saving..." : "Save changes"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="hidden lg:flex lg:w-[28rem] lg:flex-shrink-0">
                        <div className="w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                          Select a pending question to preview and edit it here.
                        </div>
                      </div>
                    )}
                    <div
                      className={`flex-1 space-y-4 ${editingMcq ? "order-last lg:order-none" : "order-first lg:order-none"}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <input
                          type="search"
                          value={pendingSearch}
                          onChange={(event) => setPendingSearch(event.target.value)}
                          placeholder="Search within pending questions"
                          className={`${baseInputClasses} sm:max-w-md`}
                        />
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              pendingLoading ? "animate-pulse bg-indigo-500" : "bg-emerald-500"
                            }`}
                          />
                          {pendingLoading ? "Refreshing list..." : "Up to date"}
                        </div>
                      </div>
                      {pendingMessage && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                          {pendingMessage}
                        </div>
                      )}
                      {pendingError && (
                        <div
                          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                          role="alert"
                        >
                          {pendingError}
                        </div>
                      )}
                      {pendingLoading ? (
                        <div className="grid gap-3">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                          ))}
                        </div>
                      ) : pendingFiltered.length > 0 ? (
                        <div className="grid gap-4">
                          {visiblePending.map((item) => (
                            <article
                              key={item.id}
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-indigo-200"
                            >
                              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                                  {(item.type ?? "mcq").toUpperCase()}
                                </span>
                                <span>{item.difficulty ?? "-"}</span>
                                <span>{item.quiz_type ?? "-"}</span>
                                <span>{formatSeconds(item.estimated_time)}</span>
                              </div>
                              <div
                                className="mt-3 text-sm leading-6 text-slate-700 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    item.question && item.question.trim().length > 0
                                      ? item.question
                                      : "<em>No question provided.</em>",
                                }}
                              />
                              {item.options && item.options.length > 0 ? (
                                <ul className="mt-3 grid gap-1 text-sm text-slate-600">
                                  {item.options.map((option, optionIndex) => (
                                    <li key={option.id ?? `${item.id}-${optionIndex}`}>
                                      {option.is_correct ? "[Correct] " : ""}
                                      {option.content && option.content.trim().length > 0
                                        ? option.content
                                        : "Empty option"}
                                    </li>
                                  ))}
                                </ul>
                              ) : item.answer ? (
                                <p className="mt-3 text-sm text-slate-600">Answer: {item.answer}</p>
                              ) : null}
                              {item.explanation && item.explanation.trim().length > 0 && (
                                <p className="mt-2 text-sm text-slate-500">
                                  Explanation: {item.explanation}
                                </p>
                              )}
                              <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                  type="button"
                                  className={dangerButtonClasses}
                                  onClick={() => handleRemoveMcq(item.id)}
                                  disabled={pendingLoading}
                                >
                                  Remove
                                </button>
                                <button
                                  type="button"
                                  className={secondaryButtonClasses}
                                  onClick={() => openEditMcq(item.id)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className={primaryButtonClasses}
                                  onClick={() => handleApproveMcq(item.id)}
                                  style={primaryButtonStyle(pendingLoading)}
                                  disabled={pendingLoading}
                                >
                                  Approve
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                          Nothing pending for this course yet. Upload a spreadsheet or run an AI generation to create items.
                        </div>
                      )}
                      {hasMorePending && (
                        <button
                          type="button"
                          className={secondaryButtonClasses}
                          onClick={() =>
                            setPendingViewLimit((limit) => limit + DEFAULT_PENDING_VIEW_LIMIT)
                          }
                        >
                          Load more
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
