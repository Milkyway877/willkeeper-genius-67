
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';

interface InfoFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  tooltipText: string;
  description?: string;
  className?: string;
  containerClassName?: string;
}

export function InfoField({
  label,
  name,
  tooltipText,
  description,
  className,
  containerClassName,
  ...props
}: InfoFieldProps) {
  const form = useFormContext();

  // If form context is available, use FormField
  if (form) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className={cn("space-y-1", containerClassName)}>
            <div className="flex items-center gap-1.5">
              <FormLabel>{label}</FormLabel>
              <InfoTooltip text={tooltipText} />
            </div>
            {description && <FormDescription>{description}</FormDescription>}
            <FormControl>
              <Input 
                {...props} 
                {...field} 
                className={cn(
                  "bg-white border-2 focus:border-willtank-600 shadow-sm hover:border-gray-400 transition-colors",
                  className
                )}
                placeholder={props.placeholder || `Enter ${label.toLowerCase()}`} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Fallback for use without form context
  return (
    <div className={cn("space-y-1", containerClassName)}>
      <div className="flex items-center gap-1.5">
        <Label htmlFor={name}>{label}</Label>
        <InfoTooltip text={tooltipText} />
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <Input 
        id={name} 
        name={name} 
        className={cn(
          "bg-white border-2 focus:border-willtank-600 shadow-sm hover:border-gray-400 transition-colors",
          className
        )} 
        placeholder={props.placeholder || `Enter ${label.toLowerCase()}`}
        {...props} 
      />
    </div>
  );
}
