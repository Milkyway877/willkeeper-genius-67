
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string using Intl.DateTimeFormat
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return 'Unknown date';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  // Format the date using Intl.DateTimeFormat
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
