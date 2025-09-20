"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Timer,
  Hash,
  Wrench,
  Palette,
  Clock,
  CheckCircle,
  Play,
  Pause,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BuildMetadataProps {
  status: string;
  createdAt: Date;
  completedAt?: Date | null;
  buildDuration?: number;
  milestonesCount?: number;
  tags?: string[];
  toolsUsed?: string[];
  paintsUsed?: string[];
  gradeName?: string;
  seriesName?: string;
  className?: string;
}

const STATUS_CONFIG = {
  PLANNING: { icon: AlertCircle, color: "text-gray-600", bg: "bg-gray-100", label: "Planning" },
  IN_PROGRESS: { icon: Play, color: "text-blue-600", bg: "bg-blue-100", label: "In Progress" },
  ON_HOLD: { icon: Pause, color: "text-yellow-600", bg: "bg-yellow-100", label: "On Hold" },
  COMPLETED: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", label: "Completed" },
};

const GRADE_COLORS = {
  HG: "bg-blue-100 text-blue-800 border-blue-200",
  RG: "bg-purple-100 text-purple-800 border-purple-200",
  MG: "bg-green-100 text-green-800 border-green-200",
  PG: "bg-yellow-100 text-yellow-800 border-yellow-200",
  SD: "bg-pink-100 text-pink-800 border-pink-200",
  EG: "bg-orange-100 text-orange-800 border-orange-200",
  FM: "bg-indigo-100 text-indigo-800 border-indigo-200",
  RE: "bg-red-100 text-red-800 border-red-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
};

export function BuildMetadata({
  status,
  createdAt,
  completedAt,
  buildDuration,
  milestonesCount,
  tags,
  toolsUsed,
  paintsUsed,
  gradeName,
  seriesName,
  className
}: BuildMetadataProps) {
  const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PLANNING;
  const StatusIcon = statusConfig.icon;

  const gradeColorClass = gradeName ?
    (GRADE_COLORS[gradeName as keyof typeof GRADE_COLORS] || GRADE_COLORS.default)
    : GRADE_COLORS.default;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Status and Grade Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={cn("text-xs", statusConfig.bg, statusConfig.color)}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>

        {gradeName && (
          <Badge className={cn("text-xs", gradeColorClass)}>
            {gradeName}
          </Badge>
        )}

        {seriesName && (
          <Badge variant="outline" className="text-xs">
            {seriesName}
          </Badge>
        )}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Hash className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {tags.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{tags.length - 4} more
            </Badge>
          )}
        </div>
      )}

      {/* Build Info */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>
            {completedAt
              ? `Completed ${format(new Date(completedAt), "MMM d, yyyy")}`
              : `Started ${format(new Date(createdAt), "MMM d, yyyy")}`
            }
          </span>
        </div>

        {buildDuration && (
          <div className="flex items-center gap-1">
            <Timer className="w-4 h-4" />
            <span>{buildDuration}h total</span>
          </div>
        )}

        {milestonesCount && milestonesCount > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{milestonesCount} milestone{milestonesCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Tools & Paints Used */}
      {(toolsUsed?.length || paintsUsed?.length) && (
        <div className="space-y-2">
          {toolsUsed?.length && (
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Tools: {toolsUsed.slice(0, 3).join(", ")}
                {toolsUsed.length > 3 && ` +${toolsUsed.length - 3} more`}
              </span>
            </div>
          )}

          {paintsUsed?.length && (
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Paints: {paintsUsed.slice(0, 3).join(", ")}
                {paintsUsed.length > 3 && ` +${paintsUsed.length - 3} more`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
