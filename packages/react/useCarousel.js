import { useRef, useCallback, useState } from 'react'

export function useCarousel() {
  const ref = useRef(null)
  const [current, setCurrent] = useState(0)

  const goTo = useCallback((index) => {
    if (!ref.current) return
    const items = Array.from(ref.current.querySelectorAll('.carousel-item'))
    if (!items.length) return
    const next = Math.max(0, Math.min(index, items.length - 1))
    setCurrent(next)
    items[next].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }, [])

  return {
    ref,
    current,
    goTo,
    next: useCallback(() => goTo(current + 1), [current, goTo]),
    prev: useCallback(() => goTo(current - 1), [current, goTo]),
  }
}
