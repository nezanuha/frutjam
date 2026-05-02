import { useState, useCallback } from 'react'

export function useCombobox({ items = [], filterFn } = {}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [value, setValue] = useState('')

  const filtered = filterFn
    ? filterFn(items, query)
    : items.filter((item) =>
        String(item.label ?? item).toLowerCase().includes(query.toLowerCase())
      )

  const select = useCallback((item) => {
    const label = item.label ?? String(item)
    setValue(label)
    setQuery(label)
    setOpen(false)
    setActiveIndex(-1)
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) { setOpen(true); return }
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      select(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }, [open, filtered, activeIndex, select])

  return {
    open,
    value,
    query,
    filtered,
    activeIndex,
    select,
    containerProps: {
      className: open ? 'combobox combobox-open' : 'combobox',
    },
    inputProps: {
      value: query,
      onChange: (e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(-1) },
      onKeyDown: handleKeyDown,
      onFocus: () => setOpen(true),
      onBlur: () => setTimeout(() => setOpen(false), 150),
      'aria-expanded': open,
      'aria-autocomplete': 'list',
      role: 'combobox',
    },
    optionProps: (item, index) => ({
      className: activeIndex === index ? 'combobox-option combobox-option-active' : 'combobox-option',
      role: 'option',
      'aria-selected': activeIndex === index,
      onMouseDown: (e) => e.preventDefault(),
      onClick: () => select(item),
      onMouseEnter: () => setActiveIndex(index),
    }),
  }
}
