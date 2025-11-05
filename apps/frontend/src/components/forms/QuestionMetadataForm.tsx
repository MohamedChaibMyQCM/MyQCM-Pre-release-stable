"use client";

import * as React from "react";

export interface QuestionMetadata {
  difficulty: "easy" | "medium" | "hard";
  quiz_type: "theorique" | "pratique";
  mcq_tags: string[];
  estimated_time: number; // in seconds
  explanation?: string;
}

interface QuestionMetadataFormProps {
  value: QuestionMetadata;
  onChange: (value: QuestionMetadata) => void;
  className?: string;
}

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
] as const;

const QUIZ_TYPE_OPTIONS = [
  { value: "theorique", label: "Theoretical" },
  { value: "pratique", label: "Practical" },
] as const;

const TAG_OPTIONS = [
  { value: "book", label: "Book" },
  { value: "serie", label: "Series" },
  { value: "exam", label: "Exam" },
  { value: "td/tp", label: "TD/TP" },
  { value: "others", label: "Others" },
] as const;

export function QuestionMetadataForm({
  value,
  onChange,
  className,
}: QuestionMetadataFormProps) {
  const handleChange = (field: keyof QuestionMetadata, newValue: any) => {
    onChange({ ...value, [field]: newValue });
  };

  const toggleTag = (tag: string) => {
    const newTags = value.mcq_tags.includes(tag)
      ? value.mcq_tags.filter((t) => t !== tag)
      : [...value.mcq_tags, tag];
    handleChange("mcq_tags", newTags);
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Difficulty */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Difficulty *</label>
          <div className="flex gap-4">
            {DIFFICULTY_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="difficulty"
                  value={option.value}
                  checked={value.difficulty === option.value}
                  onChange={(e) => handleChange("difficulty", e.target.value)}
                  className="h-4 w-4 border-input text-primary focus:ring-2 focus:ring-ring"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Quiz Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quiz Type *</label>
          <div className="flex gap-4">
            {QUIZ_TYPE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="quiz_type"
                  value={option.value}
                  checked={value.quiz_type === option.value}
                  onChange={(e) =>
                    handleChange("quiz_type", e.target.value as "theorique" | "pratique")
                  }
                  className="h-4 w-4 border-input text-primary focus:ring-2 focus:ring-ring"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => (
              <label
                key={tag.value}
                className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors hover:bg-muted cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.mcq_tags.includes(tag.value)}
                  onChange={() => toggleTag(tag.value)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                />
                <span>{tag.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Estimated Time */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Estimated Time (seconds) *
          </label>
          <input
            type="number"
            min="1"
            value={value.estimated_time}
            onChange={(e) =>
              handleChange("estimated_time", parseInt(e.target.value) || 60)
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            Time in seconds (e.g., 60 for 1 minute, 120 for 2 minutes)
          </p>
        </div>

        {/* Explanation (optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Explanation (Optional)</label>
          <textarea
            value={value.explanation || ""}
            onChange={(e) => handleChange("explanation", e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Add an explanation or rationale for this question..."
          />
        </div>
      </div>
    </div>
  );
}
