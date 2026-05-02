import { useRef, useCallback } from 'react'

export function useCollapsible() {
  const ref = useRef(null)
  return {
    ref,
    open: useCallback(() => ref.current?.classList.add('collapsible-open'), []),
    close: useCallback(() => ref.current?.classList.remove('collapsible-open'), []),
    toggle: useCallback(() => ref.current?.classList.toggle('collapsible-open'), []),
    isOpen: () => ref.current?.classList.contains('collapsible-open') ?? false,
  }
}
