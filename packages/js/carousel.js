export function createCarousel(el) {
  const getItems = () => Array.from(el.querySelectorAll('.carousel-item'))
  let current = 0

  function goTo(index) {
    const items = getItems()
    if (!items.length) return
    current = Math.max(0, Math.min(index, items.length - 1))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    items[current].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest', inline: 'start' })
  }

  return {
    goTo,
    next: () => goTo(current + 1),
    prev: () => goTo(current - 1),
    current: () => current,
    count: () => getItems().length,
  }
}
