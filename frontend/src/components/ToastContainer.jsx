import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';
import { useToast } from '../hooks/useToast';

const styles = {
  success: { bg: 'bg-surface-2 border-status-success/20', icon: CheckCircle, color: 'text-status-success' },
  error: { bg: 'bg-surface-2 border-status-error/20', icon: AlertCircle, color: 'text-status-error' },
  warning: { bg: 'bg-surface-2 border-status-warning/20', icon: AlertTriangle, color: 'text-status-warning' },
  info: { bg: 'bg-surface-2 border-accent/20', icon: Info, color: 'text-accent' },
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-xs">
      {toasts.map((toast) => {
        const s = styles[toast.type] || styles.info;
        const Icon = s.icon;
        return (
          <div key={toast.id} className={clsx('flex items-start gap-2.5 p-3.5 rounded-xl border animate-slide-up', s.bg)}>
            <Icon className={clsx('w-4 h-4 flex-shrink-0 mt-0.5', s.color)} />
            <p className="text-xs text-text-primary flex-1 leading-relaxed">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="p-0.5 text-text-faint hover:text-text-secondary transition-default">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
