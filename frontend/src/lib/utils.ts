import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'DRAFT': return 'bg-gray-100 text-gray-800';
    case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
    case 'QUEUED': return 'bg-yellow-100 text-yellow-800';
    case 'ASSIGNED': return 'bg-orange-100 text-orange-800';
    case 'ACCEPTED': return 'bg-indigo-100 text-indigo-800';
    case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
    case 'ANSWERED': return 'bg-teal-100 text-teal-800';
    case 'RESOLVED': return 'bg-green-100 text-green-800';
    case 'CLOSED': return 'bg-slate-100 text-slate-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
