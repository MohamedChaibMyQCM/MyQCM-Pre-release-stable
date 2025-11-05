"use client";

export const dynamic = "force-dynamic";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  apiFetch,
  UnauthorizedError,
  redirectToLogin,
} from "@/app/lib/api";

type SelectOption = {
  id: string;
  name: string;
};

type DraftOption = {
  id: string;
  remoteId?: string;
  content: string;
  is_correct: boolean;
};

type DraftMcq = {
  id: string;
  remoteId?: string;
  type: string;
  question: string;
  estimated_time: string;
  difficulty: string;
  quiz_type: string;
  mcq_tags: string;
  explanation: string;
  answer: string;
  options: DraftOption[];
  removedOptionIds: string[];
};

type CaseSummary = {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
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

const FACULTY_TYPE_OPTIONS = [
  { value: "General Medicine", label: "General medicine" },
  { value: "Dentistry", label: "Dentistry" },
  { value: "Pharmacy", label: "Pharmacy" },
];

const CASE_TYPE_OPTIONS: { value: "qcm" | "qcs" | "qroc"; label: string }[] = [
  { value: "qcm", label: "QCM (single correct)" },
  { value: "qcs", label: "QCS (multiple correct)" },
  { value: "qroc", label: "QROC (free response)" },
];

const MCQ_TAG_OPTIONS = [
  { value: "book", label: "Book / manual" },
  { value: "serie", label: "Serie" },
  { value: "exam", label: "Exam" },
  { value: "td/tp", label: "TD / TP" },
  { value: "others", label: "Others" },
];

const QUIZ_TYPE_OPTIONS = [
  { value: "theorique", label: "Theoretical" },
  { value: "pratique", label: "Practical" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const PROMO_MIN = 2015;
const PROMO_MAX = 2025;

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

const generateId = () => Math.random().toString(36).slice(2, 10);

const clampPositiveInt = (value: number, fallback: number = 1): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.round(value);
};

const createEmptyOption = (overrides: Partial<DraftOption> = {}): DraftOption => ({
  id: generateId(),
  remoteId: undefined,
  content: "",
  is_correct: false,
  ...overrides,
});

const createEmptyMcq = (overrides: Partial<DraftMcq> = {}): DraftMcq => ({
  id: generateId(),
  remoteId: undefined,
  type: "qcm",
  question: "",
  estimated_time: "60",
  difficulty: "medium",
  quiz_type: "theorique",
  mcq_tags: "exam",
  explanation: "",
  answer: "",
  options: [
    createEmptyOption(),
    createEmptyOption(),
    createEmptyOption(),
    createEmptyOption(),
  ],
  removedOptionIds: [],
  ...overrides,
});

function ClinicalCaseBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseIdParam = searchParams.get("caseId");

  const [caseLibrary, setCaseLibrary] = useState<CaseSummary[]>([]);
  const [loadingCaseLibrary, setLoadingCaseLibrary] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [loadingCase, setLoadingCase] = useState(false);
  const [removedMcqIds, setRemovedMcqIds] = useState<string[]>([]);
  const initialMcqIdsRef = useRef<Set<string>>(new Set());
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const [facultyType, setFacultyType] = useState(
    FACULTY_TYPE_OPTIONS[0]?.value ?? "General Medicine",
  );
  const [caseType, setCaseType] = useState<"qcm" | "qcs" | "qroc">("qcm");
  const [promo, setPromo] = useState<number | "">(2024);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [scenario, setScenario] = useState("");
  const [objectivesText, setObjectivesText] = useState("");
  const [tagsText, setTagsText] = useState("");

  const [mcqs, setMcqs] = useState<DraftMcq[]>(() => [
    createEmptyMcq({ type: "qcm" }),
  ]);

  const isMultipleChoice = caseType === "qcm" || caseType === "qcs";
  const isEditing = Boolean(editingCaseId);
  const libraryActionsDisabled = loadingCase || submitting;

  const loadCaseLibrary = useCallback(async () => {
    setLoadingCaseLibrary(true);
    setError(null);
    try {
      const response = await apiFetch<any>(
        "/clinical-case/freelancer?limit=100&page=1",
      );
      const payload = unwrapResponse<any>(response);
      const rawCases = Array.isArray(payload?.clincal_cases)
        ? payload.clincal_cases
        : Array.isArray(payload?.data?.clincal_cases)
        ? payload.data.clincal_cases
        : [];

      const mapped: CaseSummary[] = rawCases
        .map((item: any) => ({
          id: item?.id ?? "",
          title: item?.title ?? "Clinical case",
          createdAt: item?.createdAt ?? item?.created_at,
          updatedAt: item?.updatedAt ?? item?.updated_at,
        }))
        .filter((item) => item.id);

      setCaseLibrary(mapped);
      return mapped;
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoadingCaseLibrary(false);
    }
  }, []);

  const resetBuilderState = useCallback(() => {
    setTitle("");
    setAuthor("");
    setDescription("");
    setScenario("");
    setObjectivesText("");
    setTagsText("");
    setSelectedYear("");
    setPromo(2024);
    setFacultyType(FACULTY_TYPE_OPTIONS[0]?.value ?? "General Medicine");
    setCaseType("qcm");
    setSelectedUniversity("");
    setSelectedFaculty("");
    setSelectedUnit("");
    setSelectedSubject("");
    setSelectedCourse("");
    setMcqs([createEmptyMcq({ type: "qcm" })]);
    setRemovedMcqIds([]);
    initialMcqIdsRef.current = new Set();
    setEditingCaseId(null);
    setLoadingCase(false);
    setError(null);
    router.replace("/generation/clinical-case/new");
  }, [router]);

  const loadCaseDetails = useCallback(
    async (caseId: string) => {
      if (!caseId) {
        return;
      }
      setLoadingCase(true);
      setError(null);
      try {
        const response = await apiFetch<any>(`/clinical-case/${caseId}/full`);
        const payload = unwrapResponse<any>(response);
        const data = (payload?.data ?? payload) as any;

        if (!data?.id) {
          throw new Error("Clinical case not found.");
        }

        const caseTypeValue = (data.type ?? "qcm") as "qcm" | "qcs" | "qroc";
        setEditingCaseId(data.id);
        router.replace(`/generation/clinical-case/new?caseId=${data.id}`);
        setTitle(data.title ?? "");
        setAuthor(data.author ?? "");
        setDescription(data.description ?? "");
        setScenario(data.scenario ?? "");
        const objectivesArray = Array.isArray(data.objectives)
          ? data.objectives
          : [];
        setObjectivesText(objectivesArray.join("\n"));
        const tagsArray = Array.isArray(data.tags) ? data.tags : [];
        setTagsText(tagsArray.join("\n"));
        setSelectedYear(data.year_of_study ?? "");
        setPromo(
          Number.isFinite(Number(data.promo))
            ? Number(data.promo)
            : (2024 as number),
        );
        setFacultyType(
          data.faculty_type ??
            (FACULTY_TYPE_OPTIONS[0]?.value ?? "General Medicine"),
        );
        setCaseType(caseTypeValue);
        setSelectedUniversity(
          data?.university?.id ?? data?.universityId ?? "",
        );
        setSelectedFaculty(data?.faculty?.id ?? data?.facultyId ?? "");
        setSelectedUnit(data?.unit?.id ?? data?.unitId ?? "");
        setSelectedSubject(data?.subject?.id ?? data?.subjectId ?? "");

        const derivedCourse =
          data?.course?.id ??
          data?.courseId ??
          data?.mcqs?.[0]?.course?.id ??
          data?.mcqs?.[0]?.courseId ??
          data?.mcqs?.[0]?.course_id ??
          "";
        setSelectedCourse(
          derivedCourse ? String(derivedCourse) : "",
        );

        const mappedMcqs = Array.isArray(data.mcqs)
          ? data.mcqs.map((item: any) => {
              const rawOptions = Array.isArray(item?.options)
                ? item.options
                : [];
              const draftOptions =
                caseTypeValue === "qroc"
                  ? []
                  : rawOptions.length > 0
                  ? rawOptions.map((option: any) =>
                      createEmptyOption({
                        remoteId: option?.id ?? undefined,
                        content: option?.content ?? "",
                        is_correct: Boolean(option?.is_correct),
                      }),
                    )
                  : [
                      createEmptyOption(),
                      createEmptyOption(),
                      createEmptyOption(),
                      createEmptyOption(),
                    ];

              return {
                id: generateId(),
                remoteId: item?.id ?? undefined,
                type: item?.type ?? caseTypeValue,
                question: item?.question ?? "",
                estimated_time: clampPositiveInt(
                  Number(item?.estimated_time) ?? 60,
                  60,
                ).toString(),
                difficulty: item?.difficulty ?? "medium",
                quiz_type: item?.quiz_type ?? "theorique",
                mcq_tags: item?.mcq_tags ?? "exam",
                explanation: item?.explanation ?? "",
                answer: item?.answer ?? "",
                options: draftOptions,
                removedOptionIds: [],
              };
            })
          : [];

        setMcqs(
          mappedMcqs.length > 0
            ? mappedMcqs
            : [createEmptyMcq({ type: caseTypeValue })],
        );
        initialMcqIdsRef.current = new Set(
          mappedMcqs
            .map((item) => item.remoteId)
            .filter((value): value is string => Boolean(value)),
        );
        setRemovedMcqIds([]);
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
        } else if (err instanceof Error) {
          setError(err.message);
          toast.error(err.message);
        }
      } finally {
        setLoadingCase(false);
      }
    },
    [router],
  );

  const objectivesList = useMemo(
    () =>
      objectivesText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    [objectivesText],
  );

  const tagsList = useMemo(
    () =>
      tagsText
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    [tagsText],
  );

  const contextComplete = Boolean(
    selectedUniversity &&
      selectedFaculty &&
      selectedYear &&
      selectedUnit &&
      selectedSubject &&
      selectedCourse,
  );

  useEffect(() => {
    loadCaseLibrary();
  }, [loadCaseLibrary]);

  useEffect(() => {
    if (caseIdParam && caseIdParam !== editingCaseId) {
      loadCaseDetails(caseIdParam);
    }
  }, [caseIdParam, editingCaseId, loadCaseDetails]);

  useEffect(() => {
    let cancelled = false;

    const fetchUniversities = async () => {
      setLoadingMetadata(true);
      try {
        const response = await apiFetch<any>("/university");
        if (cancelled) return;
        const items = mapOptions(extractItems(unwrapResponse(response)));
        setUniversities(items);
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
        } else if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoadingMetadata(false);
        }
      }
    };

    fetchUniversities();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!selectedUniversity) {
      setFaculties([]);
      setSelectedFaculty("");
      return;
    }

    const fetchFaculties = async () => {
      try {
        const response = await apiFetch<any>(
          `/faculty?universityId=${encodeURIComponent(selectedUniversity)}`,
        );
        if (cancelled) return;
        const items = mapOptions(extractItems(unwrapResponse(response)));
        setFaculties(items);
        if (!items.some((item) => item.id === selectedFaculty)) {
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
    setSelectedUnit("");
    setUnits([]);
    setSelectedSubject("");
    setSubjects([]);
    setSelectedCourse("");
    setCourses([]);

    return () => {
      cancelled = true;
    };
  }, [selectedUniversity, selectedFaculty]);

  useEffect(() => {
    let cancelled = false;
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
        params.set("offset", "1000");
        const response = await apiFetch<any>(`/unit?${params.toString()}`);
        if (cancelled) return;
        const payload = unwrapResponse<any>(response);
        const items = mapOptions(
          Array.isArray(payload?.data) ? payload.data : extractItems(payload),
        );
        setUnits(items);
        if (!items.some((item) => item.id === selectedUnit)) {
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
    setSelectedCourse("");
    setCourses([]);

    return () => {
      cancelled = true;
    };
  }, [selectedYear, selectedUnit]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedUnit) {
      setSubjects([]);
      setSelectedSubject("");
      return;
    }

    const fetchSubjects = async () => {
      try {
        const params = new URLSearchParams();
        params.set("unit", selectedUnit);
        if (selectedYear) {
          params.set("year_of_study", selectedYear);
        }
        params.set("page", "1");
        params.set("offset", "1000");
        const response = await apiFetch<any>(`/subject?${params.toString()}`);
        if (cancelled) return;
        const items = mapOptions(extractItems(unwrapResponse(response)));
        setSubjects(items);
        if (!items.some((item) => item.id === selectedSubject)) {
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
    setSelectedCourse("");
    setCourses([]);

    return () => {
      cancelled = true;
    };
  }, [selectedUnit, selectedSubject, selectedYear]);

  useEffect(() => {
    let cancelled = false;
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
        params.set("offset", "1000");
        const response = await apiFetch<any>(`/course?${params.toString()}`);
        if (cancelled) return;
        const items = mapOptions(extractItems(unwrapResponse(response)));
        setCourses(items);
        if (!items.some((item) => item.id === selectedCourse)) {
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

    return () => {
      cancelled = true;
    };
  }, [selectedSubject, selectedCourse]);

  useEffect(() => {
    setMcqs((previous) =>
      previous.map((mcq) => ({
        ...mcq,
        type: caseType,
      })),
    );
  }, [caseType]);

  useEffect(() => {
    if (!isMultipleChoice) {
      return;
    }

    setMcqs((previous) =>
      previous.map((mcq) =>
        mcq.options.length > 1
          ? mcq
          : {
              ...mcq,
              options: [
                createEmptyOption(),
                createEmptyOption(),
                createEmptyOption(),
                createEmptyOption(),
              ],
            },
      ),
    );
  }, [isMultipleChoice]);

  const addMcq = () => {
    setMcqs((prev) => [...prev, createEmptyMcq({ type: caseType })]);
  };

  const removeMcq = (id: string) => {
    setMcqs((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      const target = prev.find((mcq) => mcq.id === id);
      if (target?.remoteId) {
        setRemovedMcqIds((current) =>
          current.includes(target.remoteId!)
            ? current
            : [...current, target.remoteId!],
        );
        initialMcqIdsRef.current.delete(target.remoteId);
      }
      return prev.filter((mcq) => mcq.id !== id);
    });
  };

  const updateMcqField = (
    id: string,
    field: keyof DraftMcq,
    value: string,
  ) => {
    setMcqs((prev) =>
      prev.map((mcq) => (mcq.id === id ? { ...mcq, [field]: value } : mcq)),
    );
  };

  const addOptionToMcq = (mcqId: string) => {
    setMcqs((prev) =>
      prev.map((mcq) =>
        mcq.id === mcqId
          ? { ...mcq, options: [...mcq.options, createEmptyOption()] }
          : mcq,
      ),
    );
  };

  const removeOptionFromMcq = (mcqId: string, optionId: string) => {
    setMcqs((prev) =>
      prev.map((mcq) => {
        if (mcq.id !== mcqId) return mcq;
        if (mcq.options.length <= 2) return mcq;
        const optionToRemove = mcq.options.find((option) => option.id === optionId);
        const removedOptionIds = optionToRemove?.remoteId
          ? mcq.removedOptionIds.includes(optionToRemove.remoteId)
            ? mcq.removedOptionIds
            : [...mcq.removedOptionIds, optionToRemove.remoteId]
          : mcq.removedOptionIds;
        return {
          ...mcq,
          options: mcq.options.filter((option) => option.id !== optionId),
          removedOptionIds,
        };
      }),
    );
  };

  const updateOptionContent = (mcqId: string, optionId: string, value: string) => {
    setMcqs((prev) =>
      prev.map((mcq) => {
        if (mcq.id !== mcqId) return mcq;
        return {
          ...mcq,
          options: mcq.options.map((option) =>
            option.id === optionId ? { ...option, content: value } : option,
          ),
        };
      }),
    );
  };

  const toggleOptionCorrect = (mcqId: string, optionId: string) => {
    setMcqs((prev) =>
      prev.map((mcq) => {
        if (mcq.id !== mcqId) return mcq;
        return {
          ...mcq,
          options: mcq.options.map((option) =>
            option.id === optionId
              ? { ...option, is_correct: !option.is_correct }
              : option,
          ),
        };
      }),
    );
  };

  const buildMcqPayload = (
    mcq: DraftMcq,
    promoValue: number,
    includeOptionIds: boolean,
  ) => {
    const mcqType = (mcq.type ?? caseType) as DraftMcq["type"];
    const payload: Record<string, unknown> = {
      promo: promoValue,
      type: mcqType,
      mcq_tags: mcq.mcq_tags,
      quiz_type: mcq.quiz_type,
      question: mcq.question.trim(),
      explanation: mcq.explanation.trim() || undefined,
      difficulty: mcq.difficulty,
      course: selectedCourse,
      estimated_time: clampPositiveInt(
        Number(mcq.estimated_time) || 0,
        60,
      ),
    };

    if (mcqType === "qroc") {
      payload.answer = mcq.answer.trim();
    } else {
      payload.options = mcq.options
        .filter((option) => option.content.trim())
        .map((option) => ({
          ...(includeOptionIds && option.remoteId ? { id: option.remoteId } : {}),
          content: option.content.trim(),
          is_correct: option.is_correct,
        }));
    }

    return payload;
  };

  const buildCreateMcqPayload = (mcq: DraftMcq, promoValue: number) =>
    buildMcqPayload(mcq, promoValue, false);

  const buildUpdateMcqPayload = (mcq: DraftMcq, promoValue: number) => {
    const payload = buildMcqPayload(mcq, promoValue, true) as Record<
      string,
      unknown
    >;
    if (mcq.removedOptionIds.length > 0) {
      payload.options_to_delete = Array.from(
        new Set(mcq.removedOptionIds),
      );
    }
    return payload;
  };

  const formatTimestamp = (value?: string | null) => {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleString();
  };

  const validateForm = (): string | null => {
    if (!title.trim()) return "Provide a title for the clinical case.";
    if (!author.trim()) return "Specify the author.";
    if (!description.trim()) return "Add a description.";
    if (!scenario.trim()) return "Describe the scenario.";
    if (!selectedYear) return "Select the year of study.";
    if (promo === "" || Number.isNaN(Number(promo))) {
      return "Specify a valid promo.";
    }
    const promoValue = Number(promo);
    if (promoValue < PROMO_MIN || promoValue > PROMO_MAX) {
      return `Promo should be between ${PROMO_MIN} and ${PROMO_MAX}.`;
    }
    if (!selectedUniversity) return "Select a university.";
    if (!selectedFaculty) return "Select a faculty.";
    if (!selectedUnit) return "Select a unit.";
    if (!selectedSubject) return "Select a module.";
    if (!selectedCourse) return "Select a course.";
    if (objectivesList.length === 0)
      return "Provide at least one learning objective.";
    if (mcqs.length === 0) return "Add at least one question.";

    for (const mcq of mcqs) {
      if (!mcq.question.trim()) {
        return "Every question needs a prompt.";
      }
      if (!mcq.difficulty) {
        return "Select a difficulty level for each question.";
      }
      if (!mcq.quiz_type) {
        return "Select a quiz type for each question.";
      }
      if (!mcq.mcq_tags) {
        return "Select a tag for each question.";
      }
      const estimatedSeconds = Number(mcq.estimated_time);
      if (!Number.isFinite(estimatedSeconds) || estimatedSeconds <= 0) {
        return "Set a positive estimated time (in seconds) for each question.";
      }
      if (caseType === "qroc") {
        if (!mcq.answer.trim()) {
          return "Provide the expected answer for each QROC question.";
        }
      } else {
        const filledOptions = mcq.options.filter((option) =>
          option.content.trim(),
        );
        if (filledOptions.length < 2) {
          return "Each MCQ should have at least two options.";
        }
        if (!filledOptions.some((option) => option.is_correct)) {
          return "Mark at least one correct option per question.";
        }
      }
    }

    if (!contextComplete) {
      return "Complete the course context before submitting.";
    }

    return null;
  };

  const handleEditCase = useCallback(
    (caseId: string) => {
      loadCaseDetails(caseId);
    },
    [loadCaseDetails],
  );

  const handleDeleteCase = useCallback(
    async (caseId: string) => {
      if (!caseId) {
        return;
      }
      const confirmed = window.confirm(
        "Delete this clinical case? This action cannot be undone.",
      );
      if (!confirmed) {
        return;
      }

      try {
        await apiFetch(`/clinical-case/${caseId}`, {
          method: "DELETE",
        });
        toast.success("Clinical case deleted.");
        if (editingCaseId === caseId) {
          resetBuilderState();
        }
        await loadCaseLibrary();
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          redirectToLogin();
          return;
        }
        const message =
          err instanceof Error ? err.message : "Failed to delete clinical case.";
        setError(message);
        toast.error(message);
      }
    },
    [editingCaseId, loadCaseLibrary, resetBuilderState],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    const promoValue = Number(promo);
    const baseCasePayload = {
      year_of_study: selectedYear,
      promo: promoValue,
      university: selectedUniversity,
      faculty: selectedFaculty,
      faculty_type: facultyType,
      title: title.trim(),
      author: author.trim(),
      description: description.trim(),
      scenario: scenario.trim(),
      objectives: objectivesList,
      tags: tagsList,
      type: caseType,
      unit: selectedUnit,
      subject: selectedSubject,
    };

    setSubmitting(true);
    try {
      if (isEditing && editingCaseId) {
        await apiFetch(`/clinical-case/${editingCaseId}`, {
          method: "PATCH",
          body: {
            ...baseCasePayload,
            course: selectedCourse,
          },
        });

        const uniqueRemovedMcqIds = Array.from(new Set(removedMcqIds)).filter(
          Boolean,
        );
        for (const mcqId of uniqueRemovedMcqIds) {
          await apiFetch(`/clinical-case/${editingCaseId}/mcq/${mcqId}`, {
            method: "DELETE",
          });
        }

        const existingMcqs = mcqs.filter((mcq) => mcq.remoteId);
        for (const mcq of existingMcqs) {
          const payload = buildUpdateMcqPayload(mcq, promoValue);
          await apiFetch(
            `/clinical-case/${editingCaseId}/mcq/${mcq.remoteId}`,
            {
              method: "PATCH",
              body: payload,
            },
          );
        }

        const newMcqs = mcqs.filter((mcq) => !mcq.remoteId);
        for (const mcq of newMcqs) {
          const payload = buildCreateMcqPayload(mcq, promoValue);
          await apiFetch(`/clinical-case/mcq/${editingCaseId}`, {
            method: "POST",
            body: payload,
          });
        }

        toast.success("Clinical case updated successfully.");
        await loadCaseLibrary();
        await loadCaseDetails(editingCaseId);
      } else {
        const createPayload = {
          ...baseCasePayload,
          mcqs: mcqs.map((mcq) =>
            buildCreateMcqPayload(mcq, promoValue),
          ),
        };
        const response = await apiFetch<any>("/clinical-case", {
          method: "POST",
          body: createPayload,
        });
        const createdCaseId =
          (response as any)?.data?.id ?? (response as any)?.id ?? null;
        toast.success("Clinical case created successfully.");
        await loadCaseLibrary();
        if (createdCaseId) {
          await loadCaseDetails(createdCaseId);
        } else {
          resetBuilderState();
        }
      }
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : "Clinical case submission failed.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 lg:px-0">
        <header className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Freelancer workspace
          </span>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Clinical case builder
          </h1>
          <p className="max-w-2xl text-base text-slate-600">
            Capture the narrative, objectives, and supporting questions for your clinical case before submitting it to the review team.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-slate-900">
                Saved clinical cases
              </h2>
              <span className="text-sm text-slate-500">
                Pick an existing case to resume editing or launch the interactive demo.
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resetBuilderState}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                disabled={libraryActionsDisabled}
              >
                Start new case
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    editingCaseId
                      ? `/demo/clinical-case?caseId=${editingCaseId}`
                      : "/demo/clinical-case",
                  )
                }
                className="rounded-full bg-gradient-to-r from-[#8C7DFF] to-[#5A4BFF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
                disabled={libraryActionsDisabled}
              >
                Open demo
              </button>
            </div>
          </div>
          <div className="mt-4">
            {loadingCaseLibrary ? (
              <div className="grid gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : caseLibrary.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                You have not created any clinical cases yet. Use the builder below to craft your first scenario.
              </div>
            ) : (
              <div className="grid gap-3">
                {caseLibrary.map((item) => {
                  const timestamp =
                    formatTimestamp(item.updatedAt ?? item.createdAt ?? null) ??
                    "Awaiting metadata";
                  const isActive = editingCaseId === item.id;
                  return (
                    <article
                      key={item.id}
                      className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 text-sm transition ${
                        isActive
                          ? "border-indigo-200 bg-indigo-50 shadow-sm"
                          : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-slate-800">
                            {item.title}
                          </span>
                          <span className="text-xs text-slate-500">
                            {isActive ? "Editing now · " : ""}
                            {timestamp}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditCase(item.id)}
                            className="rounded-full border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-60"
                            disabled={libraryActionsDisabled}
                          >
                            {isActive ? "Reload" : "Edit"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/demo/clinical-case?caseId=${item.id}`,
                              )
                            }
                            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
                            disabled={libraryActionsDisabled}
                          >
                            Play
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCase(item.id)}
                            className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                            disabled={libraryActionsDisabled}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
          {loadingCase && (
            <p className="mt-3 text-xs font-medium text-indigo-600">
              Loading clinical case details...
            </p>
          )}
        </section>

        <form
          className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
          onSubmit={handleSubmit}
        >
          <section className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="case-title">
                Case title
              </label>
              <input
                id="case-title"
                type="text"
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Acute coronary syndrome in the emergency department"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="case-author">
                Author / contributor
              </label>
              <input
                id="case-author"
                type="text"
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Dr Jane Doe"
                required
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="case-description">
                Short description
              </label>
              <textarea
                id="case-description"
                className="h-24 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Summarise the context, patient profile, and pedagogical intention."
                required
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="case-scenario">
                Scenario details
              </label>
              <textarea
                id="case-scenario"
                className="h-40 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={scenario}
                onChange={(event) => setScenario(event.target.value)}
                placeholder="Provide the narrative, clinical findings, lab results, and relevant data."
                required
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="case-objectives">
                Learning objectives
              </label>
              <textarea
                id="case-objectives"
                className="h-28 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={objectivesText}
                onChange={(event) => setObjectivesText(event.target.value)}
                placeholder={"Write one objective per line.\nExample: Identify the warning signs of an acute coronary syndrome."}
                required
              />
              <p className="text-xs text-slate-500">
                {objectivesList.length} objective{objectivesList.length !== 1 ? "s" : ""} detected.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="case-tags">
                Tags (optional)
              </label>
              <textarea
                id="case-tags"
                className="h-20 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
                placeholder="Separate each tag with a new line or comma."
              />
              <p className="text-xs text-slate-500">
                Tags help the reviewers classify the case. Leave empty if unsure.
              </p>
            </div>
          </section>

          <section className="grid gap-5 rounded-2xl border border-slate-100 bg-slate-50 p-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="year-of-study">
                Year of study
              </label>
              <select
                id="year-of-study"
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                required
              >
                <option value="">Choose a year</option>
                {YEAR_OF_STUDY_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="promo">
                Promo
              </label>
              <input
                id="promo"
                type="number"
                min={PROMO_MIN}
                max={PROMO_MAX}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={promo}
                onChange={(event) => {
                  const value = event.target.value === "" ? "" : Number(event.target.value);
                  setPromo(value);
                }}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="faculty-type">
                Faculty profile
              </label>
              <select
                id="faculty-type"
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={facultyType}
                onChange={(event) => setFacultyType(event.target.value)}
              >
                {FACULTY_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="case-type">
                MCQ format
              </label>
              <select
                id="case-type"
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={caseType}
                onChange={(event) =>
                  setCaseType(event.target.value as "qcm" | "qcs" | "qroc")
                }
              >
                {CASE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="university">
                University
              </label>
              <select
                id="university"
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={selectedUniversity}
                onChange={(event) => setSelectedUniversity(event.target.value)}
                required
              >
                <option value="">Choose a university</option>
                {universities.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="faculty">
                Faculty
              </label>
              <select
                id="faculty"
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={selectedFaculty}
                onChange={(event) => setSelectedFaculty(event.target.value)}
                required
              >
                <option value="">Choose a faculty</option>
                {faculties.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="unit">
                Unit
              </label>
              <select
                id="unit"
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={selectedUnit}
                onChange={(event) => setSelectedUnit(event.target.value)}
                required
              >
                <option value="">Choose a unit</option>
                {units.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="subject">
                Module
              </label>
              <select
                id="subject"
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value)}
                required
              >
                <option value="">Choose a module</option>
                {subjects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="course">
                Course
              </label>
              <select
                id="course"
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
                required
              >
                <option value="">Choose a course</option>
                {courses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                These selections align the clinical case with the course catalogue used by the platform.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Questions ({mcqs.length})
                </h2>
                <p className="text-sm text-slate-500">
                  {isMultipleChoice
                    ? "Provide at least two options per question and mark the correct answers."
                    : "Write the expected answer for each QROC question."}
                </p>
              </div>
              <button
                type="button"
                onClick={addMcq}
                className="rounded-full border border-indigo-500 px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm transition hover:bg-indigo-50"
              >
                Add question
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {mcqs.map((mcq, index) => (
                <div
                  key={mcq.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">
                        Question {index + 1}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Capture the prompt, supporting data, and the expected answer.
                      </p>
                    </div>
                    {mcqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMcq(mcq.id)}
                        className="text-xs font-medium text-rose-600 transition hover:text-rose-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    className="h-28 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={mcq.question}
                    onChange={(event) =>
                      updateMcqField(mcq.id, "question", event.target.value)
                    }
                    placeholder="Formulate the question associated with the scenario."
                    required
                  />

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        Estimated time (seconds)
                      </span>
                      <input
                        type="number"
                        min={5}
                        step={5}
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        value={mcq.estimated_time}
                        onChange={(event) =>
                          updateMcqField(
                            mcq.id,
                            "estimated_time",
                            event.target.value,
                          )
                        }
                        placeholder="e.g. 90"
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        Difficulty
                      </span>
                      <select
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        value={mcq.difficulty}
                        onChange={(event) =>
                          updateMcqField(mcq.id, "difficulty", event.target.value)
                        }
                      >
                        {DIFFICULTY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        Quiz type
                      </span>
                      <select
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        value={mcq.quiz_type}
                        onChange={(event) =>
                          updateMcqField(mcq.id, "quiz_type", event.target.value)
                        }
                      >
                        {QUIZ_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        Tag
                      </span>
                      <select
                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        value={mcq.mcq_tags}
                        onChange={(event) =>
                          updateMcqField(mcq.id, "mcq_tags", event.target.value)
                        }
                      >
                        {MCQ_TAG_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {isMultipleChoice ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          Answer options
                        </span>
                        <button
                          type="button"
                          onClick={() => addOptionToMcq(mcq.id)}
                          className="text-xs font-medium text-indigo-600 transition hover:text-indigo-700"
                        >
                          Add option
                        </button>
                      </div>
                      <div className="flex flex-col gap-3">
                        {mcq.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                          >
                            <div className="flex flex-1 flex-col gap-2">
                              <input
                                type="text"
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                value={option.content}
                                onChange={(event) =>
                                  updateOptionContent(
                                    mcq.id,
                                    option.id,
                                    event.target.value,
                                  )
                                }
                                placeholder="Option text"
                              />
                              <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={option.is_correct}
                                  onChange={() =>
                                    toggleOptionCorrect(mcq.id, option.id)
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                Mark as correct
                              </label>
                            </div>
                            {mcq.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOptionFromMcq(mcq.id, option.id)}
                                className="text-xs font-medium text-rose-600 transition hover:text-rose-700"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        Expected answer
                      </span>
                      <textarea
                        className="h-24 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        value={mcq.answer}
                        onChange={(event) =>
                          updateMcqField(mcq.id, "answer", event.target.value)
                        }
                        placeholder="Detail the core elements expected in the response."
                      />
                    </label>
                  )}

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      Explanation / rationale (optional)
                    </span>
                    <textarea
                      className="h-24 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      value={mcq.explanation}
                      onChange={(event) =>
                        updateMcqField(mcq.id, "explanation", event.target.value)
                      }
                      placeholder="Clarify why this is the correct answer or provide supporting reasoning."
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {loadingMetadata && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Loading metadata...
            </div>
          )}

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/generation/new")}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#F8589F] to-[#E74C8C] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? isEditing
                  ? "Saving changes..."
                  : "Submitting..."
                : isEditing
                ? "Update clinical case"
                : "Create clinical case"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default function ClinicalCaseBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-sm text-[#6C7A89]">
          Chargement du générateur de cas clinique...
        </div>
      }
    >
      <ClinicalCaseBuilderContent />
    </Suspense>
  );
}
