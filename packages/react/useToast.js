import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((message, { duration = 3000, type = '' } = {}) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message, type }])
    if (duration > 0) setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  return {
    toasts,
    show,
    dismiss,
    success: (msg, opts) => show(msg, { ...opts, type: 'success' }),
    error: (msg, opts) => show(msg, { ...opts, type: 'error' }),
    warning: (msg, opts) => show(msg, { ...opts, type: 'warning' }),
    info: (msg, opts) => show(msg, { ...opts, type: 'info' }),
  }
}
