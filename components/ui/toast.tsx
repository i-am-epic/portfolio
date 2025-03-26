"use client";

import * as React from "react";
import ReactDOM from "react-dom";
import { cn } from "@/lib/utils";

// Types for toast variants and options.
type ToastVariant = "default" | "destructive";

interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // in ms, 0 for manual dismissal.
  action?: React.ReactNode;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  addToast: (options: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = React.useCallback((options: ToastOptions) => {
    const id = options.id || Date.now().toString();
    setToasts((prev) => [...prev, { ...options, id }]);
    if (options.duration !== 0) {
      // Auto dismiss after duration (default 5000ms)
      setTimeout(() => {
        removeToast(id);
      }, options.duration || 5000);
    }
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastViewport toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

interface ToastViewportProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

const ToastViewport: React.FC<ToastViewportProps> = ({ toasts, removeToast }) => {
  return ReactDOM.createPortal(
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>,
    document.body
  );
};

interface ToastProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const variantClasses =
    toast.variant === "destructive"
      ? "border border-red-500 bg-red-100 text-red-800"
      : "border bg-white text-gray-800";

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md p-6 shadow-lg transition-all",
        variantClasses
      )}
    >
      <div className="flex flex-col">
        {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
        {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
      </div>
      {toast.action && <ToastAction>{toast.action}</ToastAction>}
      <ToastClose onClick={onDismiss} />
    </div>
  );
};

export const ToastTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="text-sm font-semibold">{children}</div>;
};

export const ToastDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="text-sm opacity-90">{children}</div>;
};

export const ToastAction: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <button className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-gray-200 focus:outline-none">
      {children}
    </button>
  );
};

export const ToastClose: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-50 transition-opacity hover:text-gray-700 focus:opacity-100 focus:outline-none"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
};
