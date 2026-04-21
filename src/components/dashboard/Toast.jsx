import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ toast, onDismiss }) {
  return (
    <div className={`toast ${toast.type} ${toast.exiting ? 'exiting' : ''}`}>
      <span className="toast-icon">
        {toast.type === 'success' && '✓'}
        {toast.type === 'danger'  && '⚠'}
        {toast.type === 'warning' && '!'}
        {toast.type === 'info'    && 'ℹ'}
      </span>
      <div className="toast-body">
        {toast.title   && <div className="toast-title">{toast.title}</div>}
        {toast.message && <div className="toast-message">{toast.message}</div>}
      </div>
      <div className="toast-progress" />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 220);
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 3000 }) => {
    const id = ++counterRef.current;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
