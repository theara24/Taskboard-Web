import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-200 bg-white shadow-emerald-500/10',
          error: 'border-rose-200 bg-white shadow-rose-500/10',
          warning: 'border-amber-200 bg-white shadow-amber-500/10',
          info: 'border-blue-200 bg-white shadow-blue-500/10',
        };

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-3 duration-200',
              borders[toast.type],
            )}
            role="alert"
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <p className="text-sm font-medium text-slate-800">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 rounded p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
