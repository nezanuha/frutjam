import { useRef, useCallback } from 'react'

export function useModal() {
  const ref = useRef(null)
  return {
    ref,
    open: useCallback(() => ref.current?.showModal(), []),
    close: useCallback(() => ref.current?.close(), []),
    toggle: useCallback(() => (ref.current?.open ? ref.current.close() : ref.current?.showModal()), []),
    isOpen: () => ref.current?.open ?? false,
  }
}
