export function createModal(el) {
  return {
    open: () => el.showModal(),
    close: () => el.close(),
    toggle: () => (el.open ? el.close() : el.showModal()),
    isOpen: () => el.open,
  }
}
