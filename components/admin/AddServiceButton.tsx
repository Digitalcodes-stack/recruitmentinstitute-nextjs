'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import ServiceModal from './ServiceModal'

export default function AddServiceButton() {
  const [show, setShow] = useState(false)

  return (
    <>
      <button
        onClick={() => setShow(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
      >
        <Plus style={{ width: 14, height: 14 }} />
        Add Service
      </button>
      {show && <ServiceModal onClose={() => setShow(false)} />}
    </>
  )
}
