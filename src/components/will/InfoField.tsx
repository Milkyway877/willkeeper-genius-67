
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
          <FormItem className={cn("space-y-2", containerClassName)}>
            <div className="flex items-center gap-1.5">
              <FormLabel className="font-medium text-gray-800">{label}</FormLabel>
              <InfoTooltip text={tooltipText} />
            </div>
            {description && <FormDescription className="text-sm">{description}</FormDescription>}
            <FormControl>
              <div className="relative">
                <Input 
                  {...props} 
                  {...field} 
                  className={cn(
                    "bg-white border-2 shadow-sm transition-all min-h-[44px]",
                    !field.value || field.value === '' 
                      ? "border-amber-300 bg-amber-50 focus:border-willtank-600 focus:bg-white placeholder:text-amber-700" 
                      : "border-gray-300 focus:border-willtank-600 hover:border-gray-400",
                    "focus:ring-2 focus:ring-willtank-100",
                    className
                  )}
                  placeholder={
                    !field.value || field.value === '' 
                      ? `[${props.placeholder || `Enter ${label.toLowerCase()}`}]`
                      : props.placeholder || `Enter ${label.toLowerCase()}`
                  }
                />
                {(!field.value || field.value === '') && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-400 rounded-md bg-amber-50/30" />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Fallback for use without form context
  return (
    <div className={cn("space-y-2", containerClassName)}>
      <div className="flex items-center gap-1.5">
        <Label htmlFor={name} className="font-medium text-gray-800">{label}</Label>
        <InfoTooltip text={tooltipText} />
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <div className="relative">
        <Input 
          id={name} 
          name={name} 
          className={cn(
            "bg-white border-2 shadow-sm transition-all min-h-[44px]",
            !props.value || props.value === '' 
              ? "border-amber-300 bg-amber-50 focus:border-willtank-600 focus:bg-white placeholder:text-amber-700" 
              : "border-gray-300 focus:border-willtank-600 hover:border-gray-400",
            "focus:ring-2 focus:ring-willtank-100",
            className
          )} 
          placeholder={
            !props.value || props.value === '' 
              ? `[${props.placeholder || `Enter ${label.toLowerCase()}`}]`
              : props.placeholder || `Enter ${label.toLowerCase()}`
          }
          {...props} 
        />
        {(!props.value || props.value === '') && (
          <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-400 rounded-md bg-amber-50/30" />
        )}
      </div>
    </div>
  );
}
