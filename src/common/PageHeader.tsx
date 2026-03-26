// PageHeader.tsx
"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  createButtonLabel?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  createButtonLabel = "Create New",
  showCreateButton = true,
  onCreateClick,
}: PageHeaderProps) {
  return (
    <div className="bg-[#004687] px-5 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 shrink">
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h1 className="text-white font-bold text-sm tracking-wide truncate">
            {title}
          </h1>
          <p className="text-blue-200 text-[10px] tracking-widest uppercase">
            {subtitle}
          </p>
        </div>
      </div>

      {showCreateButton && onCreateClick && (
        <Button
          onClick={onCreateClick}
          className="bg-white text-[#004687] hover:bg-blue-50 font-semibold text-xs h-8 px-3 rounded-lg shadow-none gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
        >
          <Plus size={13} />
          {createButtonLabel}
        </Button>
      )}
    </div>
  );
}