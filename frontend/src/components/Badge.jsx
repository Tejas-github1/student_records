import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    pass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
    fail: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20',
    active: 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/20',
    published: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20',
    draft: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  const style = variants[variant] || variants.neutral;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${style} ${className}`}
    >
      {children}
    </span>
  );
};
