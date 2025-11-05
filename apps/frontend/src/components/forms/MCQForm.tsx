"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

export interface MCQOption {
  content: string;
  is_correct: boolean;
}

export interface MCQData {
  question: string;
  type: "qcm" | "qcs"; // qcm = single correct, qcs = multiple correct
  options: MCQOption[];
}

interface MCQFormProps {
  value: MCQData;
  onChange: (value: MCQData) => void;
  className?: string;
}

export function MCQForm({ value, onChange, className }: MCQFormProps) {
  const handleChange = (field: keyof MCQData, newValue: any) => {
    onChange({ ...value, [field]: newValue });
  };

  const addOption = () => {
    const newOptions = [
      ...value.options,
      { content: "", is_correct: false },
    ];
    handleChange("options", newOptions);
  };

  const removeOption = (index: number) => {
    if (value.options.length <= 2) {
      alert("MCQ must have at least 2 options");
      return;
    }
    const newOptions = value.options.filter((_, i) => i !== index);
    handleChange("options", newOptions);
  };

  const updateOption = (
    index: number,
    field: keyof MCQOption,
    newValue: any
  ) => {
    const newOptions = [...value.options];
    newOptions[index] = { ...newOptions[index], [field]: newValue };
    handleChange("options", newOptions);
  };

  const toggleCorrect = (index: number) => {
    const newOptions = [...value.options];

    if (value.type === "qcm") {
      // Single correct: uncheck all others
      newOptions.forEach((opt, i) => {
        opt.is_correct = i === index;
      });
    } else {
      // Multiple correct: toggle
      newOptions[index].is_correct = !newOptions[index].is_correct;
    }

    handleChange("options", newOptions);
  };

  const correctCount = value.options.filter((opt) => opt.is_correct).length;

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Question Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Question *</label>
          <textarea
            value={value.question}
            onChange={(e) => handleChange("question", e.target.value)}
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Enter the question text..."
          />
        </div>

        {/* MCQ Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Answer Type *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mcq_type"
                value="qcm"
                checked={value.type === "qcm"}
                onChange={(e) => handleChange("type", "qcm")}
                className="h-4 w-4 border-input text-primary focus:ring-2 focus:ring-ring"
              />
              <span>Single Correct (QCM)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mcq_type"
                value="qcs"
                checked={value.type === "qcs"}
                onChange={(e) => handleChange("type", "qcs")}
                className="h-4 w-4 border-input text-primary focus:ring-2 focus:ring-ring"
              />
              <span>Multiple Correct (QCS)</span>
            </label>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Answer Options * (min 2)
            </label>
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
              Add Option
            </button>
          </div>

          <div className="space-y-3">
            {value.options.map((option, index) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded-lg border border-input bg-background p-3"
              >
                <input
                  type="checkbox"
                  checked={option.is_correct}
                  onChange={() => toggleCorrect(index)}
                  className="mt-2 h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Option {index + 1}
                    </span>
                    {option.is_correct && (
                      <span className="text-xs font-medium text-primary">
                        ✓ Correct
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={option.content}
                    onChange={(e) =>
                      updateOption(index, "content", e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Enter option text..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={value.options.length <= 2}
                  className="mt-2 rounded p-1 text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Validation Messages */}
          {correctCount === 0 && (
            <p className="text-sm text-destructive">
              Please mark at least one option as correct
            </p>
          )}
          {value.type === "qcm" && correctCount > 1 && (
            <p className="text-sm text-destructive">
              Single Correct (QCM) should have exactly one correct answer
            </p>
          )}
          {value.type === "qcs" && correctCount < 2 && correctCount > 0 && (
            <p className="text-sm text-warning">
              Multiple Correct (QCS) should have at least 2 correct answers
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
