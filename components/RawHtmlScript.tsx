'use client'

import { useEffect, useRef } from 'react'

export default function RawHtmlScript({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !html) return
    ref.current.innerHTML = html
    // Re-execute any script tags since innerHTML doesn't execute them
    ref.current.querySelectorAll('script').forEach((oldScript) => {
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      )
      newScript.textContent = oldScript.textContent
      oldScript.replaceWith(newScript)
    })
  }, [html])

  return <div ref={ref} suppressHydrationWarning />
}
