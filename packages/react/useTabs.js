import { useState, useCallback } from 'react'

export function useTabs(initialIndex = 0) {
  const [active, setActive] = useState(initialIndex)

  const activate = useCallback((index) => setActive(index), [])

  return {
    active,
    activate,
    isActive: (index) => active === index,
    tabProps: (index) => ({
      className: active === index ? 'tab tab-active' : 'tab',
      onClick: () => activate(index),
      'aria-selected': active === index,
      role: 'tab',
    }),
    panelProps: (index) => ({
      hidden: active !== index,
      role: 'tabpanel',
    }),
  }
}
