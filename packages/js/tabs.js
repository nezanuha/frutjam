let _tabsIdCounter = 0

export function createTabs(tabsEl, panelsEl) {
  const uid = ++_tabsIdCounter
  const getTabs = () => Array.from(tabsEl.querySelectorAll('.tab'))
  const getPanels = () => (panelsEl ? Array.from(panelsEl.children) : [])

  if (!tabsEl.getAttribute('role')) tabsEl.setAttribute('role', 'tablist')

  function initAria() {
    getTabs().forEach((tab, i) => {
      if (!tab.id) tab.id = `fj-tab-${uid}-${i}`
      if (!tab.getAttribute('role')) tab.setAttribute('role', 'tab')
    })
    getPanels().forEach((panel, i) => {
      if (!panel.id) panel.id = `fj-panel-${uid}-${i}`
      if (!panel.getAttribute('role')) panel.setAttribute('role', 'tabpanel')
      const tab = getTabs()[i]
      if (tab && !panel.getAttribute('aria-labelledby')) {
        panel.setAttribute('aria-labelledby', tab.id)
      }
      if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '0')
    })
    getTabs().forEach((tab, i) => {
      const panel = getPanels()[i]
      if (panel && !tab.getAttribute('aria-controls')) {
        tab.setAttribute('aria-controls', panel.id)
      }
    })
  }

  function activate(index) {
    getTabs().forEach((tab, i) => {
      const active = i === index
      tab.classList.toggle('tab-active', active)
      tab.setAttribute('aria-selected', String(active))
      tab.setAttribute('tabindex', active ? '0' : '-1')
    })
    getPanels().forEach((panel, i) => {
      panel.hidden = i !== index
    })
  }

  initAria()

  tabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab')
    if (tab) activate(getTabs().indexOf(tab))
  })

  tabsEl.addEventListener('keydown', (e) => {
    const tabs = getTabs()
    const current = tabs.findIndex((t) => t === document.activeElement)
    if (current === -1) return
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (current + 1) % tabs.length
      activate(next)
      tabs[next].focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = (current - 1 + tabs.length) % tabs.length
      activate(prev)
      tabs[prev].focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      activate(0)
      tabs[0].focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      activate(tabs.length - 1)
      tabs[tabs.length - 1].focus()
    }
  })

  return {
    activate,
    next() {
      const all = getTabs()
      const current = all.findIndex((t) => t.classList.contains('tab-active'))
      activate((current + 1) % all.length)
    },
    prev() {
      const all = getTabs()
      const current = all.findIndex((t) => t.classList.contains('tab-active'))
      activate((current - 1 + all.length) % all.length)
    },
  }
}
