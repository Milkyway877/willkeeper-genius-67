
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export interface TextInputProps extends InputProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, ...props }, ref) => {
    return <Input className={cn("", className)} ref={ref} {...props} />;
  }
);
TextInput.displayName = "TextInput";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options?: SelectOption[];
  className?: string;
  disabled?: boolean;
}

export const Select = ({ 
  id, 
  value, 
  onValueChange, 
  placeholder, 
  options = [],
  className,
  disabled
}: SelectProps) => {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      disabled={disabled}
    >
      {placeholder && (
        <option value="" disabled selected={!value}>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

