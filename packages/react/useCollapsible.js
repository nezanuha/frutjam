import { useRef, useCallback } from 'react'

export function useCollapsible() {
  const ref = useRef(null)

  function syncAria() {
    if (!ref.current) return
    const isOpen = ref.current.classList.contains('collapsible-open')
    const trigger = ref.current.querySelector('[aria-expanded]')
    if (trigger) trigger.setAttribute('aria-expanded', String(isOpen))
  }

  return {
    ref,
    open: useCallback(() => { ref.current?.classList.add('collapsible-open'); syncAria() }, []),
    close: useCallback(() => { ref.current?.classList.remove('collapsible-open'); syncAria() }, []),
    toggle: useCallback(() => { ref.current?.classList.toggle('collapsible-open'); syncAria() }, []),
    isOpen: () => ref.current?.classList.contains('collapsible-open') ?? false,
  }
}
