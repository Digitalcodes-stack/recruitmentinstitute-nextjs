'use client'

import { useRef, useState } from 'react'
import { FolderOpen, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  previewShape?: 'rect' | 'circle'
  placeholder?: string
  required?: boolean
}

export default function ImageUploadField({
  value,
  onChange,
  folder = 'uploads',
  label = 'Image',
  previewShape = 'rect',
  placeholder = 'Paste URL or click Browse…',
  required,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      onChange(json.url)
      toast.success('Image uploaded!')
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Upload failed')
    } finally {
      setUploading(false)
      if (ref.current) ref.current.value = ''
    }
  }

  const resolvedSrc = value
    ? value.startsWith('http') ? value : `/${value.replace(/^\/+/, '')}`
    : ''

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b',
    marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.1em',
  }

  return (
    <div>
      {label && (
        <label style={labelStyle}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
        </label>
      )}

      {/* hidden file input */}
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={upload} />

      {/* URL input + Browse button */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, padding: '9px 13px', borderRadius: 10, fontSize: 13,
            border: '1.5px solid #e2e8f0', outline: 'none',
            background: '#fafafa', color: '#0f172a',
          }}
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '0 16px', borderRadius: 10,
            border: '1.5px solid #dbeafe',
            background: uploading ? '#f1f5f9' : 'linear-gradient(135deg,#eff6ff,#e0e7ff)',
            color: uploading ? '#94a3b8' : '#2563eb',
            fontSize: 12.5, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {uploading ? (
            <>
              <span style={{ width: 12, height: 12, border: '2px solid #c7d2fe', borderTopColor: '#6366f1', borderRadius: '50%', display: 'inline-block', animation: 'imgUploadSpin 0.7s linear infinite' }} />
              Uploading…
            </>
          ) : (
            <><FolderOpen style={{ width: 13, height: 13 }} /> Browse</>
          )}
        </button>
      </div>

      {/* preview */}
      {resolvedSrc && (
        <div style={{ marginTop: 10, position: 'relative', display: 'inline-block', width: previewShape === 'circle' ? 64 : '100%' }}>
          <img
            src={resolvedSrc}
            alt="preview"
            style={previewShape === 'circle' ? {
              width: 64, height: 64, borderRadius: '50%', objectFit: 'cover',
              border: '2.5px solid #e2e8f0', display: 'block',
            } : {
              width: '100%', height: 140, objectFit: 'cover', borderRadius: 10,
              border: '1.5px solid #e2e8f0', display: 'block',
            }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              position: 'absolute', top: previewShape === 'circle' ? -4 : 6,
              right: previewShape === 'circle' ? -4 : 6,
              width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(15,23,42,0.65)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff',
            }}
          >
            <X style={{ width: 11, height: 11 }} />
          </button>
        </div>
      )}

      <style>{`@keyframes imgUploadSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
