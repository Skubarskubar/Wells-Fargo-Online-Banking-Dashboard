import React from 'react';
import { ToastMessage } from '../types/banking';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start space-x-3 transition-all transform animate-slide-up bg-white ${
            toast.type === 'success' ? 'border-emerald-500/40 text-emerald-950' :
            toast.type === 'error' ? 'border-red-500/40 text-red-950' :
            toast.type === 'warning' ? 'border-amber-500/40 text-amber-950' :
            'border-blue-500/40 text-blue-950'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#005eb8]" />}
          </div>

          <div className="flex-1 space-y-0.5">
            <h5 className="font-bold text-xs">{toast.title}</h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">{toast.description}</p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
