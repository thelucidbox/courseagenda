import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a date to a readable string
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Calculate the time difference between two dates in days
export function daysBetween(start: Date, end: Date): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((end.getTime() - start.getTime()) / millisecondsPerDay));
}

// Generate a readable time distance (e.g., "in 3 days", "2 weeks ago")
export function timeDistance(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(targetDate.getTime())) {
    return 'Invalid date';
  }
  
  const isPast = targetDate < now;
  const days = daysBetween(now, targetDate);
  
  if (days === 0) {
    return isPast ? 'Today' : 'Today';
  } else if (days === 1) {
    return isPast ? 'Yesterday' : 'Tomorrow';
  } else if (days < 7) {
    return isPast ? `${days} days ago` : `in ${days} days`;
  } else if (days < 30) {
    const weeks = Math.round(days / 7);
    return isPast ? `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago` : `in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  } else if (days < 365) {
    const months = Math.round(days / 30);
    return isPast ? `${months} ${months === 1 ? 'month' : 'months'} ago` : `in ${months} ${months === 1 ? 'month' : 'months'}`;
  } else {
    const years = Math.round(days / 365);
    return isPast ? `${years} ${years === 1 ? 'year' : 'years'} ago` : `in ${years} ${years === 1 ? 'year' : 'years'}`;
  }
}

// Truncate text with ellipsis if it exceeds maxLength
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
}

// Get initials from a name (e.g., "John Smith" -> "JS")
export function getInitials(name: string): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

// Format file size to a readable string (e.g., "2.5 MB")
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
