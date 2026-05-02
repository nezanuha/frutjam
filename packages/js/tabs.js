export function createTabs(tabsEl, panelsEl) {
  const getTabs = () => Array.from(tabsEl.querySelectorAll('.tab'))
  const getPanels = () => (panelsEl ? Array.from(panelsEl.children) : [])

  function activate(index) {
    getTabs().forEach((tab, i) => {
      tab.classList.toggle('tab-active', i === index)
      tab.setAttribute('aria-selected', String(i === index))
    })
    getPanels().forEach((panel, i) => {
      panel.hidden = i !== index
    })
  }

  tabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab')
    if (tab) activate(getTabs().indexOf(tab))
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
