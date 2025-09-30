"use client"

import { createContext, useContext, useState, useCallback } from "react"

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = "info", duration = 5000) => {
    const id = Date.now()
    const toast = { id, message, type }

    setToasts((prev) => [...prev, toast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const typeStyles = {
    success: "toast-success",
    error: "toast-error",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-white",
  }

  return (
    <div className={`toast ${typeStyles[toast.type]} flex items-center justify-between min-w-[300px]`}>
      <span>{toast.message}</span>
      <button onClick={onRemove} className="ml-4 text-white hover:text-gray-200">
        ✕
      </button>
    </div>
  )
}
