import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, Circle } from "lucide-react";

export interface TimelineItem {
  title: string;
  description?: string;
  timestamp?: string;
  status: "completed" | "current" | "upcoming";
  substeps?: {
    title: string;
    status: "completed" | "current" | "upcoming" | "pending";
  }[];
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        const getStatusIcon = () => {
          if (item.status === "completed") {
            return (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-foreground">
                <Check className="h-5 w-5" />
              </div>
            );
          }
          if (item.status === "current") {
            return (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info text-info-foreground">
                <Clock className="h-5 w-5" />
              </div>
            );
          }
          return (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-background">
              <Circle className="h-5 w-5 text-muted-foreground" />
            </div>
          );
        };

        return (
          <div key={index} className="relative flex gap-4 pb-8">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-5 top-10 h-full w-0.5 bg-border" />
            )}

            {/* Icon */}
            <div className="relative z-10">{getStatusIcon()}</div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3
                    className={cn(
                      "font-semibold",
                      item.status === "current" && "text-info",
                      item.status === "upcoming" && "text-muted-foreground"
                    )}
                  >
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}

                  {/* Substeps */}
                  {item.substeps && item.substeps.length > 0 && (
                    <div className="mt-3 space-y-2 border-l-2 border-border pl-4">
                      {item.substeps.map((substep, subIndex) => (
                        <div key={subIndex} className="flex items-center gap-2">
                          {substep.status === "completed" && (
                            <Check className="h-4 w-4 text-success" />
                          )}
                          {substep.status === "current" && (
                            <div className="h-2 w-2 animate-pulse rounded-full bg-info" />
                          )}
                          {substep.status === "pending" && (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span
                            className={cn(
                              "text-sm",
                              substep.status === "completed" &&
                                "text-foreground",
                              substep.status === "current" &&
                                "font-medium text-info",
                              substep.status === "pending" &&
                                "text-muted-foreground"
                            )}
                          >
                            {substep.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {item.timestamp && (
                  <span className="text-sm text-muted-foreground">
                    {item.timestamp}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
