import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './component/App'

kintone.events.on('app.record.detail.show', (event) => {
  const container = kintone.app.record.getHeaderMenuSpaceElement()
  const root = createRoot(container)
  root.render(<App />)
  return event
})
