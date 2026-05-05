import { useState, useCallback, useId } from 'react'

export function useTabs(initialIndex = 0) {
  const uid = useId()
  const [active, setActive] = useState(initialIndex)

  const activate = useCallback((index) => setActive(index), [])

  const tabId = (index) => `${uid}-tab-${index}`
  const panelId = (index) => `${uid}-panel-${index}`

  const handleKeyDown = useCallback((index, count) => (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      activate((index + 1) % count)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      activate((index - 1 + count) % count)
    } else if (e.key === 'Home') {
      e.preventDefault()
      activate(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      activate(count - 1)
    }
  }, [activate])

  return {
    active,
    activate,
    isActive: (index) => active === index,
    tablistProps: {
      role: 'tablist',
    },
    tabProps: (index, count = 0) => ({
      id: tabId(index),
      className: active === index ? 'tab tab-active' : 'tab',
      onClick: () => activate(index),
      onKeyDown: handleKeyDown(index, count),
      role: 'tab',
      'aria-selected': active === index,
      'aria-controls': panelId(index),
      tabIndex: active === index ? 0 : -1,
    }),
    panelProps: (index) => ({
      id: panelId(index),
      hidden: active !== index,
      role: 'tabpanel',
      'aria-labelledby': tabId(index),
      tabIndex: 0,
    }),
  }
}
