import { createContext, useContext, useRef, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const TOAST_DURATION_MS = 3000;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // A counter instead of Date.now(): two toasts in the same millisecond would share an id.
  const nextId = useRef(0);

  function showToast(message: string, type: ToastType = 'success') {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(
      () => setToasts((current) => current.filter((t) => t.id !== id)),
      TOAST_DURATION_MS,
    );
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div aria-live="polite" className="toasts">
        {toasts.map((t) => (
          <p key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
