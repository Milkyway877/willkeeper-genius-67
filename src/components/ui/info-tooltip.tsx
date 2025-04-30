
import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface InfoTooltipProps {
  text: string;
  className?: string;
  iconClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function InfoTooltip({ text, className, iconClassName, side = "top", align = "center" }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex cursor-help", className)}>
            <Info className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />
          </div>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className="max-w-sm text-sm">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
