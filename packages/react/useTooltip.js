import { useRef, useCallback } from 'react'

export function useTooltip() {
  const ref = useRef(null)
  return {
    ref,
    show: useCallback(() => ref.current?.classList.add('tooltip-open'), []),
    hide: useCallback(() => ref.current?.classList.remove('tooltip-open'), []),
    toggle: useCallback(() => ref.current?.classList.toggle('tooltip-open'), []),
    isOpen: () => ref.current?.classList.contains('tooltip-open') ?? false,
  }
}
