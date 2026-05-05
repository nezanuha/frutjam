export function createToastManager(containerEl) {
  containerEl.setAttribute('aria-live', 'polite')
  containerEl.setAttribute('aria-atomic', 'false')

  function show(message, { duration = 3000, type = '' } = {}) {
    const el = document.createElement('div')
    el.className = ['alert', type && `alert-${type}`].filter(Boolean).join(' ')
    el.textContent = message
    if (type === 'error' || type === 'warning') {
      el.setAttribute('role', 'alert')
    } else {
      el.setAttribute('role', 'status')
    }
    containerEl.appendChild(el)
    if (duration > 0) setTimeout(() => el.remove(), duration)
    return el
  }

  return {
    show,
    success: (msg, opts) => show(msg, { ...opts, type: 'success' }),
    error: (msg, opts) => show(msg, { ...opts, type: 'error' }),
    warning: (msg, opts) => show(msg, { ...opts, type: 'warning' }),
    info: (msg, opts) => show(msg, { ...opts, type: 'info' }),
    dismiss: (el) => el?.remove(),
  }
}
