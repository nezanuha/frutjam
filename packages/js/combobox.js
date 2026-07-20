let _comboboxIdCounter = 0

export function createCombobox(el) {
  const input = el.querySelector('input')
  let activeIndex = -1

  const uid = ++_comboboxIdCounter
  const listbox = el.querySelector('[role="listbox"]') ?? el.querySelector('.combobox-dropdown') ?? (() => {
    const found = el.querySelector('.combobox-item, [role="option"]')
    return found ? found.parentElement : null
  })()

  if (listbox && !listbox.id) listbox.id = `fj-combobox-listbox-${uid}`
  if (listbox && !listbox.getAttribute('role')) listbox.setAttribute('role', 'listbox')
  if (input && listbox) {
    input.setAttribute('aria-controls', listbox.id)
    if (!input.getAttribute('role')) input.setAttribute('role', 'combobox')
    if (!input.getAttribute('aria-autocomplete')) input.setAttribute('aria-autocomplete', 'list')
  }

  const allOptions = () => Array.from(el.querySelectorAll('[role="option"], .combobox-item'))
  const visibleOptions = () => allOptions().filter((o) => !o.hidden)

  function open() {
    el.classList.add('combobox-open')
    input?.setAttribute('aria-expanded', 'true')
  }

  function close() {
    el.classList.remove('combobox-open')
    input?.setAttribute('aria-expanded', 'false')
    highlight(-1)
  }

  function toggle() {
    el.classList.contains('combobox-open') ? close() : open()
  }

  function filter(query) {
    allOptions().forEach((opt) => {
      opt.hidden = !opt.textContent.toLowerCase().includes(query.toLowerCase())
    })
    highlight(-1)
  }

  function highlight(index) {
    const opts = visibleOptions()
    opts.forEach((o, i) => {
      o.classList.remove('combobox-item-active')
      if (!o.id) o.id = `fj-combobox-option-${uid}-${i}`
    })
    if (index >= 0 && opts[index]) {
      opts[index].classList.add('combobox-item-active')
      opts[index].scrollIntoView({ block: 'nearest' })
      input?.setAttribute('aria-activedescendant', opts[index].id)
    } else {
      input?.removeAttribute('aria-activedescendant')
    }
    activeIndex = index
  }

  function select(opt) {
    if (input) input.value = opt.textContent.trim()
    el.dispatchEvent(new CustomEvent('fj:select', { detail: { value: opt.dataset.value ?? opt.textContent.trim() } }))
    close()
  }

  input?.addEventListener('input', (e) => {
    open()
    filter(e.target.value)
  })

  input?.addEventListener('keydown', (e) => {
    const opts = visibleOptions()
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!el.classList.contains('combobox-open')) { open(); return }
      highlight(Math.min(activeIndex + 1, opts.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      highlight(Math.max(activeIndex - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      select(opts[activeIndex])
    } else if (e.key === 'Escape') {
      close()
    }
  })

  el.addEventListener('click', (e) => {
    const opt = e.target.closest('[role="option"], .combobox-item')
    if (opt) { select(opt); return }
    if (e.target === input) open()
  })

  document.addEventListener('click', (e) => {
    if (!el.contains(e.target)) close()
  }, { capture: true })

  return { open, close, toggle, filter }
}
