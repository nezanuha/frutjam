export function createCollapsible(el) {
  return {
    open: () => el.classList.add('collapsible-open'),
    close: () => el.classList.remove('collapsible-open'),
    toggle: () => el.classList.toggle('collapsible-open'),
    isOpen: () => el.classList.contains('collapsible-open'),
  }
}
