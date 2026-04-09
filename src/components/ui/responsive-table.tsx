import React, { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  priority: 'high' | 'medium' | 'low';
  render: (item: T) => ReactNode;
  mobileRender?: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
  mobileCardClassName?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data found',
  className,
  mobileCardClassName,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  const highPriorityColumns = columns.filter(c => c.priority === 'high');
  const mediumPriorityColumns = columns.filter(c => c.priority === 'medium');
  const lowPriorityColumns = columns.filter(c => c.priority === 'low');

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className={cn("space-y-3", className)}>
        {data.map(item => (
          <div
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            className={cn(
              "bg-card border border-border rounded-lg p-4 transition-colors touch-manipulation",
              onRowClick && "cursor-pointer active:bg-muted/50",
              mobileCardClassName
            )}
          >
            {/* High Priority Fields - Always Visible */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                {highPriorityColumns.map((col, idx) => (
                  <div key={col.key} className={idx === 0 ? "font-medium text-foreground" : "text-sm text-foreground/65"}>
                    {col.mobileRender ? col.mobileRender(item) : col.render(item)}
                  </div>
                ))}
              </div>
              {onRowClick && (
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
            </div>

            {/* Medium Priority Fields - Grid Layout */}
            {mediumPriorityColumns.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 pt-3 border-t border-border">
                {mediumPriorityColumns.map(col => (
                  <div key={col.key}>
                    <p className="text-xs text-muted-foreground mb-0.5">{col.header}</p>
                    <div className="text-sm text-foreground">
                      {col.mobileRender ? col.mobileRender(item) : col.render(item)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Low Priority - Hidden on mobile (expandable in future) */}
          </div>
        ))}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className={cn("rounded-lg border overflow-hidden", className)}>
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50 border-b">
            {columns.map(col => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-xs font-medium text-foreground/70 uppercase tracking-wide",
                  col.align === 'right' && "text-right",
                  col.align === 'center' && "text-center"
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map(item => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/30"
              )}
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-sm",
                    col.align === 'right' && "text-right",
                    col.align === 'center' && "text-center"
                  )}
                >
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
