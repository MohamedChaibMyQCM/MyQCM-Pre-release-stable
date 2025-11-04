import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "info";
}

const variantStyles = {
  default: "bg-card border-border",
  success: "bg-success-light border-success/20",
  warning: "bg-warning-light border-warning/20",
  info: "bg-info-light border-info/20",
};

const iconVariantStyles = {
  default: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
};

function Stat({
  label,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
  ...props
}: StatProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-6 transition-all hover:shadow-md",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground">
              <span
                className={cn(
                  "font-semibold",
                  trend.value > 0 ? "text-success" : "text-destructive"
                )}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>{" "}
              {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "rounded-full p-3",
              variant === "default" ? "bg-muted" : "bg-background/50"
            )}
          >
            <Icon className={cn("h-6 w-6", iconVariantStyles[variant])} />
          </div>
        )}
      </div>
    </div>
  );
}

export { Stat };
