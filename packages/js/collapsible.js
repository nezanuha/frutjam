export function createCollapsible(el) {
  function syncAria() {
    const isOpen = el.classList.contains('collapsible-open')
    const trigger = el.querySelector('[aria-expanded]')
    if (trigger) trigger.setAttribute('aria-expanded', String(isOpen))
  }

  return {
    open: () => { el.classList.add('collapsible-open'); syncAria() },
    close: () => { el.classList.remove('collapsible-open'); syncAria() },
    toggle: () => { el.classList.toggle('collapsible-open'); syncAria() },
    isOpen: () => el.classList.contains('collapsible-open'),
  }
}
