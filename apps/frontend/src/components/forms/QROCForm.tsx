"use client";

import * as React from "react";

export interface QROCData {
  question: string;
  answer: string;
}

interface QROCFormProps {
  value: QROCData;
  onChange: (value: QROCData) => void;
  className?: string;
}

export function QROCForm({ value, onChange, className }: QROCFormProps) {
  const handleChange = (field: keyof QROCData, newValue: string) => {
    onChange({ ...value, [field]: newValue });
  };

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
          <p className="text-xs text-muted-foreground">
            Write a clear question that requires a short answer
          </p>
        </div>

        {/* Expected Answer */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Expected Answer *</label>
          <textarea
            value={value.answer}
            onChange={(e) => handleChange("answer", e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Enter the expected answer..."
          />
          <p className="text-xs text-muted-foreground">
            Provide the correct answer that students should provide
          </p>
        </div>
      </div>
    </div>
  );
}
