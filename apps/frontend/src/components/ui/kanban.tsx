"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  count?: number;
}

export interface KanbanItem {
  id: string;
  columnId: string;
  [key: string]: any;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onItemMove?: (itemId: string, fromColumnId: string, toColumnId: string) => void;
  renderItem: (item: KanbanItem) => React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
}

export function KanbanBoard({
  columns,
  items,
  onItemMove,
  renderItem,
  emptyState,
  className,
}: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = React.useState<KanbanItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null);

  const getColumnItems = (columnId: string) => {
    return items.filter((item) => item.columnId === columnId);
  };

  const handleDragStart = (item: KanbanItem) => {
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedItem && draggedItem.columnId !== columnId && onItemMove) {
      onItemMove(draggedItem.id, draggedItem.columnId, columnId);
    }

    setDraggedItem(null);
  };

  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
      {columns.map((column) => {
        const columnItems = getColumnItems(column.id);
        const isDragOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className="flex min-w-[300px] flex-1 flex-col"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div
              className={cn(
                "mb-3 flex items-center justify-between rounded-lg p-3",
                column.color || "bg-muted"
              )}
            >
              <h3 className="font-semibold">{column.title}</h3>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-medium">
                {column.count ?? columnItems.length}
              </span>
            </div>

            {/* Column Content */}
            <div
              className={cn(
                "flex min-h-[400px] flex-1 flex-col gap-3 rounded-lg border-2 border-dashed p-3 transition-colors",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/50"
              )}
            >
              {columnItems.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  {emptyState || (
                    <p className="text-sm text-muted-foreground">
                      No items
                    </p>
                  )}
                </div>
              ) : (
                columnItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "cursor-move rounded-lg border bg-card transition-shadow hover:shadow-md",
                      draggedItem?.id === item.id && "opacity-50"
                    )}
                  >
                    {renderItem(item)}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface KanbanCardProps {
  children: React.ReactNode;
  showDragHandle?: boolean;
  className?: string;
}

export function KanbanCard({
  children,
  showDragHandle = true,
  className,
}: KanbanCardProps) {
  return (
    <div className={cn("relative p-4", className)}>
      {showDragHandle && (
        <div className="absolute left-2 top-4 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className={cn(showDragHandle && "pl-6")}>{children}</div>
    </div>
  );
}
