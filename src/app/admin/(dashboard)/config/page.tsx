'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getAllSettings, updateSettings } from '@/lib/settings'

interface SocialLink {
  name: string
  url: string
}

export const dynamic = 'force-dynamic'

export default function ConfigPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [issn, setIssn] = useState('')
  const [copyright, setCopyright] = useState('')
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const settings = await getAllSettings()
    setIssn(settings.footer_issn || '')
    setCopyright(settings.footer_copyright || '')
    try {
      setSocialLinks(JSON.parse(settings.footer_social_links || '[]'))
    } catch {
      setSocialLinks([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const addLink = () => {
    setSocialLinks([...socialLinks, { name: '', url: '' }])
  }

  const removeLink = (i: number) => {
    setSocialLinks(socialLinks.filter((_, idx) => idx !== i))
  }

  const updateLink = (i: number, field: 'name' | 'url', value: string) => {
    const copy = [...socialLinks]
    copy[i] = { ...copy[i], [field]: value }
    setSocialLinks(copy)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await updateSettings({
        footer_issn: issn,
        footer_copyright: copyright,
        footer_social_links: JSON.stringify(socialLinks.filter(l => l.name || l.url)),
      })
      setMessage('Guardat!')
      router.refresh()
    } catch (err) {
      setMessage('Error en guardar')
    }
    setSaving(false)
  }

  if (loading) return <div className="text-gray-500 text-sm">Carregant...</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Configuració</h1>
        <p className="text-gray-500 text-sm mt-1">Edita el footer de la revista</p>
      </div>

      <form onSubmit={handleSave} className="max-w-xl space-y-6">
        {/* ISSN */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
            ISSN
          </label>
          <input
            value={issn}
            onChange={e => setIssn(e.target.value)}
            className="w-full px-4 py-2.5 bg-black border border-gray-800 text-white text-sm
              focus:outline-none focus:border-red-500/50 transition-colors"
            placeholder="ISSN 2938-2026 (en tràmit)"
          />
        </div>

        {/* Copyright */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
            Copyright
          </label>
          <input
            value={copyright}
            onChange={e => setCopyright(e.target.value)}
            className="w-full px-4 py-2.5 bg-black border border-gray-800 text-white text-sm
              focus:outline-none focus:border-red-500/50 transition-colors"
            placeholder="© 2025 Xerrac!"
          />
        </div>

        {/* Social Links */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500 uppercase tracking-wider">
              Enllaços a xarxes socials
            </label>
            <button
              type="button"
              onClick={addLink}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors"
            >
              + Afegeix
            </button>
          </div>
          <div className="space-y-2">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  value={link.name}
                  onChange={e => updateLink(i, 'name', e.target.value)}
                  placeholder="Nom"
                  className="flex-1 px-3 py-2 bg-black border border-gray-800 text-white text-xs
                    focus:outline-none focus:border-red-500/50 transition-colors"
                />
                <input
                  value={link.url}
                  onChange={e => updateLink(i, 'url', e.target.value)}
                  placeholder="URL"
                  className="flex-[2] px-3 py-2 bg-black border border-gray-800 text-white text-xs
                    focus:outline-none focus:border-red-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="px-2 py-2 text-xs text-gray-600 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            {socialLinks.length === 0 && (
              <p className="text-xs text-gray-700 italic">No hi ha enllaços.</p>
            )}
          </div>
        </div>

        {message && (
          <p className={`text-xs ${message === 'Guardat!' ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-red-600 text-white text-sm uppercase tracking-wider
            hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardant...' : 'Guardar'}
        </button>
      </form>
    </div>
  )
}
