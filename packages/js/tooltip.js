export function createTooltip(el) {
  return {
    show: () => el.classList.add('tooltip-open'),
    hide: () => el.classList.remove('tooltip-open'),
    toggle: () => el.classList.toggle('tooltip-open'),
    isOpen: () => el.classList.contains('tooltip-open'),
  }
}
