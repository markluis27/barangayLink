import React from 'react';
import { Clock, CheckCircle2, XCircle, CheckCheck } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  switch (status) {
    case 'Pending':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 text-amber-500'} />
          Pending
        </span>
      );
    case 'Approved':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 text-blue-600'} />
          Approved
        </span>
      );
    case 'Completed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCheck className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 text-emerald-600'} />
          Completed
        </span>
      );
    case 'Rejected':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 text-rose-500'} />
          Rejected
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-gray-100 text-gray-700 border border-gray-200 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}
