import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  title: string;
  description?: string;
}

interface WizardProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Wizard({ steps, currentStep, className }: WizardProps) {
  return (
    <nav aria-label="Progress" className={cn("mb-8", className)}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <li
              key={step.title}
              className={cn(
                "relative flex flex-1 flex-col items-center",
                index !== steps.length - 1 && "after:absolute after:left-[calc(50%+1.5rem)] after:top-5 after:h-0.5 after:w-[calc(100%-3rem)] after:bg-border"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-background text-primary ring-4 ring-primary/10",
                    isUpcoming && "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-primary",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="hidden text-xs text-muted-foreground sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface WizardStepProps {
  children: React.ReactNode;
  className?: string;
}

export function WizardStep({ children, className }: WizardStepProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}

interface WizardActionsProps {
  onBack?: () => void;
  onNext?: () => void;
  onCancel?: () => void;
  backLabel?: string;
  nextLabel?: string;
  cancelLabel?: string;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  nextDisabled?: boolean;
  loading?: boolean;
}

export function WizardActions({
  onBack,
  onNext,
  onCancel,
  backLabel = "Back",
  nextLabel = "Next",
  cancelLabel = "Cancel",
  isFirstStep = false,
  isLastStep = false,
  nextDisabled = false,
  loading = false,
}: WizardActionsProps) {
  return (
    <div className="flex items-center justify-between border-t pt-6">
      <div>
        {!isFirstStep && onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            {backLabel}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || loading}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Loading..." : isLastStep ? "Submit" : nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
