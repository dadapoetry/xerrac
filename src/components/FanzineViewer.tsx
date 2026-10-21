'use client'

import { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect, Fragment } from 'react'
import { IssueData } from '@/types'
import { buildSectionSlugMap, issuePath, articlePath } from '@/lib/slugs'
import { getSiteUrl } from '@/lib/site'
import { SectionRenderer } from './SectionRenderer'
import { SectionBackground } from './SectionBackground'
import { PortadaSection } from './sections/PortadaSection'
import { Logo } from './Logo'
import { SawIcon } from './SawIcon'
import { NewsletterPopUp } from './NewsletterPopUp'
import { accentOnColor, accentTextColor, hexToRgb } from '@/lib/color'

interface FanzineViewerProps {
  issue: IssueData
  initialSectionIndex?: number
}

function getCurrentSectionIndex(): number {
  const els = document.querySelectorAll('[data-section-index]')
  let idx = 0
  let closest = Infinity
  els.forEach((el) => {
    try {
      const rect = el.getBoundingClientRect()
      const dist = Math.abs(rect.top)
      if (dist < closest) {
        closest = dist
        const val = parseInt(el.getAttribute('data-section-index') || '0', 10)
        if (!isNaN(val)) idx = val
      }
    } catch {}
  })
  return idx
}

function scrollToSectionEl(index: number) {
  const el = document.querySelector(`[data-section-index="${index}"]`) as HTMLElement | null
  if (!el) return
  try {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch {}
}

function sectionSlug(index: number) {
  return `s-${index}`
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error("Clipboard API failed:", err)
    }
  }

  const textArea = document.createElement("textarea")
  textArea.value = text
  textArea.setAttribute("readonly", "")
  textArea.style.position = "fixed"
  textArea.style.left = "-9999px"
  textArea.style.top = "0"
  textArea.style.opacity = "0"
  textArea.style.fontSize = "16px"

  document.body.appendChild(textArea)

  textArea.focus()
  textArea.select()
  textArea.setSelectionRange(0, textArea.value.length)

  const copied = document.execCommand("copy")

  document.body.removeChild(textArea)

  return copied
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  )
}

function CopyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 1 1 2.828 2.828l-3 3a2 2 0 0 1-2.828 0 1 1 0 0 0-1.414 1.414 4 4 0 0 0 5.656 0l3-3a4 4 0 0 0-5.656-5.656l-1.5 1.5a1 1 0 1 0 1.414 1.414l1.5-1.5Zm-5 5a2 2 0 0 1 2.828 0 1 1 0 1 0 1.414-1.414 4 4 0 0 0-5.656 0l-3 3a4 4 0 1 0 5.656 5.656l1.5-1.5a1 1 0 1 0-1.414-1.414l-1.5 1.5a2 2 0 1 1-2.828-2.828l3-3Z" clipRule="evenodd" />
    </svg>
  )
}

function CloseIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  )
}

function ShareIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.475l6.733-3.366A2.52 2.52 0 0 1 13 4.5Z" />
    </svg>
  )
}

export function FanzineViewer({ issue, initialSectionIndex }: FanzineViewerProps) {
  const sortedSections = useMemo(
    () => [...issue.sections].sort((a, b) => a.order - b.order),
    [issue.sections]
  )
  const slugMap = useMemo(
    () => buildSectionSlugMap(issue.sections),
    [issue.sections]
  )
  const sumariEntries = useMemo(() => {
    return sortedSections.slice(1).map((s, i) => ({
      number: String(i + 1).padStart(2, '0'),
      title: s.title,
    }))
  }, [sortedSections])

  // S'inicia a 0 i es fixa en efecte per evitar desenganxament d'hidratació:
  // la secció inicial es llegeix de la URL (slug) després de muntar.
  const [activeSection, setActiveSection] = useState(0)
  const [copied, setCopied] = useState(false)
  const [sharePhase, setSharePhase] = useState<'closed' | 'open' | 'closing'>('closed')
  const [togglePop, setTogglePop] = useState(false)
  const [showNewsletter, setShowNewsletter] = useState(false)
  const [idle, setIdle] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shareTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const navRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef<number | null>(null)
  const dragOffset = useRef(0)
  useEffect(() => {
    const onActivity = () => {
      setIdle(false)
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => setIdle(true), 4000)
    }
    window.addEventListener('scroll', onActivity, { passive: true })
    window.addEventListener('wheel', onActivity, { passive: true })
    onActivity()
    return () => {
      window.removeEventListener('scroll', onActivity)
      window.removeEventListener('wheel', onActivity)
      clearTimeout(idleTimer.current)
    }
  }, [])

  // Enllaç profund: si la URL ja porta l'slug d'una secció, situem el número
  // sencer just allà. També accepta l'antic ?section=N com a reserva. Es fa en
  // efecte (no en el state inicial) per no provocar desenganxament d'hidratació.
  useEffect(() => {
    if (typeof window === 'undefined') return
    let target = initialSectionIndex && initialSectionIndex > 0 ? initialSectionIndex : 0
    if (target === 0) {
      const v = new URLSearchParams(window.location.search).get('section')
      const idx = v !== null ? parseInt(v, 10) : NaN
      if (!isNaN(idx) && idx > 0 && idx < sortedSections.length) target = idx
    }
    if (target <= 0) return
    setActiveSection(target)
    const el = document.querySelector(`[data-section-index="${target}"]`) as HTMLElement | null
    if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' })
  }, [initialSectionIndex, sortedSections])

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-section-index]'))
    if (els.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const idx = parseInt(entry.target.getAttribute('data-section-index') || '0', 10)
          if (isNaN(idx)) continue
          setActiveSection(idx)
          if (idx >= 2) setShowNewsletter(true)
          try {
            // La URL de lectura passa a ser la de la secció (/numeros/X/slug),
            // de manera que el navegador i el botó de compartir coincideixen.
            const section = sortedSections[idx]
            const slug = section ? slugMap.get(section.id) : undefined
            history.replaceState(null, '', slug ? articlePath(issue.number, slug) : issuePath(issue.number))
          } catch {}
        }
      },
      { threshold: 0, rootMargin: '-50% 0px -50% 0px' }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sortedSections, slugMap, issue.number])

  useLayoutEffect(() => {
    const container = navRef.current
    if (!container) return
    const t = setTimeout(() => {
      if (activeSection === 0) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
        return
      }
      const btn = container.children[activeSection] as HTMLElement | undefined
      if (!btn) return
      const containerRect = container.getBoundingClientRect()
      const btnRect = btn.getBoundingClientRect()
      const relativeLeft = btnRect.left - containerRect.left + container.scrollLeft
      const targetLeft = relativeLeft - (containerRect.width - btnRect.width) / 2
      container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' })
    }, 150)
    return () => clearTimeout(t)
  }, [activeSection])

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('section')
    if (v === null) return
    const idx = parseInt(v, 10)
    if (!isNaN(idx) && idx >= 0 && idx < sortedSections.length) {
      setTimeout(() => scrollToSectionEl(idx), 150)
    }
  }, [sortedSections.length])

  // La barra de progrés ha de dir la veritat del desplaçament. Abans es movia
  // a bots (índex de secció / nombre de seccions) i, en una pàgina amb
  // seccions molt llargues, quedava clavada mentre s'hi llegia a dins.
  // L'amplada s'escriu directament al DOM, un cop per fotograma: així el
  // desplaçament no provoca cap re-render de la revista sencera.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const bar = progressRef.current
      if (!bar) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      bar.style.width = `${p * 100}%`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [sortedSections.length])

  useEffect(() => {
    // Les fletxes canvien de secció, però només quan el lector les demana de debò.
    // Si està escrivint en un camp, navegant un encreuat o un altre element ja
    // n'ha fet ús (defaultPrevented), el gest pertoca a l'element, no a nosaltres.
    const isBusyTarget = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null
      if (!el || typeof el.tagName !== 'string') return false
      const tag = el.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button') return true
      if (el.isContentEditable) return true
      return Boolean(el.closest('[data-arrow-nav-off]'))
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      if (isBusyTarget(e.target)) return
      try {
        const cur = getCurrentSectionIndex()
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          if (cur > 0) scrollToSectionEl(cur - 1)
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          if (cur < sortedSections.length - 1) scrollToSectionEl(cur + 1)
        }
      } catch {}
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sortedSections.length])

  const iconHoverOn = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = 'var(--accent-text)'
    e.currentTarget.style.backgroundColor = 'rgba(var(--accent-rgb), 0.12)'
  }
  const iconHoverOff = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = ''
    e.currentTarget.style.backgroundColor = ''
  }
  const toggleHoverOn = (e: React.MouseEvent<HTMLElement>) => {
    iconHoverOn(e)
    e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.5)'
  }
  const toggleHoverOff = (e: React.MouseEvent<HTMLElement>) => {
    iconHoverOff(e)
    e.currentTarget.style.borderColor = ''
  }

  const shareMeta = useMemo(() => {
    const section = sortedSections[activeSection]
    if (!section) return null
    const slug = slugMap.get(section.id)
    const title = section.type === 'portada' ? issue.title : section.title
    return {
      path: slug ? articlePath(issue.number, slug) : issuePath(issue.number),
      text: `${title} — Xerrac!, núm. ${String(issue.number).padStart(2, '0')}`,
    }
  }, [activeSection, sortedSections, slugMap, issue])

  // La URL compartida és sempre la canònica del lloc, no la de la desplegada
  // (evita compartir adreces de preview de Vercel).
  const shareUrl = shareMeta ? `${getSiteUrl()}${shareMeta.path}` : ''

  const shareTargets = useMemo(() => {
    if (!shareMeta) return []
    const url = `${getSiteUrl()}${shareMeta.path}`
    const text = shareMeta.text
    const brand = 'w-4 h-4'
    return [
      {
        name: 'WhatsApp',
        label: 'Compartir a WhatsApp',
        href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={brand}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        ),
      },
      {
        name: 'X',
        label: 'Compartir a X',
        href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={brand}>
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
          </svg>
        ),
      },
      {
        name: 'Facebook',
        label: 'Compartir a Facebook',
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={brand}>
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
          </svg>
        ),
      },
      {
        name: 'Bluesky',
        label: 'Compartir a Bluesky',
        href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${text} ${url}`)}`,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={brand}>
            <path d="M5.769 2.462C8.445 4.471 11.317 8.545 12.4 10.733c1.083-2.188 3.955-6.262 6.631-8.271 1.93-1.45 5.06-2.57 5.06.998 0 .713-.409 5.992-.649 6.849-.834 2.98-3.873 3.74-6.577 3.28 4.727.803 5.93 3.47 3.333 6.136-4.937 5.064-7.096-1.27-7.649-2.894-.1-.294-.147-.432-.147-.315 0-.117-.048.021-.148.315-.553 1.624-2.712 7.958-7.649 2.894-2.597-2.666-1.394-5.333 3.333-6.136-2.704.46-5.743-.3-6.577-3.28-.24-.857-.649-6.136-.649-6.849 0-3.568 3.13-2.448 5.06-.998Z" />
          </svg>
        ),
      },
      {
        name: 'Correu',
        label: 'Compartir per correu',
        href: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={brand}>
            <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
            <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
          </svg>
        ),
      },
    ]
  }, [shareMeta])

  const showStrip = sharePhase !== 'closed'
  const stripAnim = sharePhase === 'closing' ? 'animate-share-item-out' : 'animate-share-item-in'
  const stripDelay = (index: number) => {
    const total = shareTargets.length + 2
    return sharePhase === 'closing' ? `${(total - 1 - index) * 16}ms` : `${index * 40}ms`
  }

  const copyShareLink = useCallback(async () => {
    if (!shareUrl) return
    const ok = await copyToClipboard(shareUrl)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [shareUrl])

  const openShare = useCallback(() => {
    clearTimeout(shareTimer.current)
    setTogglePop(false)
    setSharePhase('open')
  }, [])

  const closeShare = useCallback(() => {
    if (sharePhase !== 'open') return
    setSharePhase('closing')
    clearTimeout(shareTimer.current)
    // Deixa acabar la sortida esglaonada abans de tornar a mostrar el botó.
    shareTimer.current = setTimeout(() => {
      setSharePhase('closed')
      setTogglePop(false)
    }, 250)
  }, [sharePhase])

  // El full del sistema és la primera fila del full del mòbil, no el que
  // passa en tocar el botó: així es veu que hi ha més opcions sense haver de
  // tancar el full natiu per obrir-lo un altre cop.
  const shareWithSystem = useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.share({ title: shareMeta?.text, text: shareMeta?.text, url: shareUrl })
    } catch {
      // Si la persona cancel·la el full, no hi ha res a fer ni a desfer.
    }
    setTogglePop(false)
    closeShare()
  }, [shareUrl, shareMeta, closeShare])

  // Al full del mòbil, un cop copiat l'enllaç, es deixa veure la confirmació
  // uns instants i tot seguit el full es tanca.
  const copyShareLinkAndClose = useCallback(async () => {
    const ok = await copyToClipboard(shareUrl)
    if (!ok) return
    setCopied(true)
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => {
      setCopied(false)
      closeShare()
    }, 1200)
  }, [shareUrl, closeShare])

  // La barreta de dalt és per arrossegar: molta gent intenta tancar el full
  // estirant-la cap avall. Faig servir events de punter, que cobreixen tant el
  // dit al mòbil com el ratolí: mentre es mou, el full segueix el punter, i en
  // deixar-lo anar, si ha baixat prou es tanca i, si no, torna a lloc.
  const onHandlePointerDown = (e: React.PointerEvent) => {
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
    dragStartY.current = e.clientY
    dragOffset.current = 0
    const node = sheetRef.current
    if (node) node.style.transition = 'none'
  }

  const onHandlePointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return
    const dy = e.clientY - dragStartY.current
    const offset = dy > 0 ? dy : 0
    dragOffset.current = offset
    const node = sheetRef.current
    if (node) node.style.transform = `translateY(${offset}px)`
  }

  const onHandlePointerUp = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return
    dragStartY.current = null
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
    const node = sheetRef.current
    const offset = dragOffset.current
    dragOffset.current = 0
    if (!node) return
    if (offset > 80) {
      // Marxem cap avall des d'on és: neutralitzem l'animació del full i
      // deixem que la transició acabi la feina; closeShare() porta l'estat.
      node.style.animation = 'none'
      node.style.transition = 'transform 0.2s ease-in'
      node.style.transform = 'translateY(100%)'
      closeShare()
    } else {
      node.style.transition = 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)'
      node.style.transform = ''
      window.setTimeout(() => {
        node.style.transition = ''
      }, 220)
    }
  }

  useEffect(() => () => {
    clearTimeout(shareTimer.current)
    clearTimeout(copyTimer.current)
  }, [])

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Amb el full de compartir obert, el fons no s'ha de poder moure.
  useEffect(() => {
    if (!(showStrip && isMobile)) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [showStrip, isMobile])

  useEffect(() => {
    if (sharePhase === 'closed') return
    const onOutside = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null
      // No tanquem si el toc cau dins de la barra de compartir o dins del
      // mateix full (sigui quina sigui la seva posició a l'arbre).
      if (el && el.closest('[data-share-region]')) return
      if (sheetRef.current && el && sheetRef.current.contains(el)) return
      closeShare()
    }
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeShare()
    }
    document.addEventListener('pointerdown', onOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('pointerdown', onOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [sharePhase, closeShare])

  if (sortedSections.length === 0) {
    return (
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800/50 safe-top shadow-sm">
        <div className="flex items-center gap-2 px-3 min-h-[2.5rem]">
          <Logo compact />
          <span className="text-sm text-gray-600">Cap secció disponible</span>
        </div>
      </div>
    )
  }

  const accentColor = issue.accentColor || '#dc2626'

  return (
    <div
      style={
        {
          '--accent': accentColor,
          '--accent-rgb': hexToRgb(accentColor),
          '--accent-on': accentOnColor(accentColor),
          '--accent-text': accentTextColor(accentColor),
        } as React.CSSProperties
      }
    >
      {/* Header — sticky at top, accompanies reader */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800/50 no-print relative safe-top shadow-sm">
        <div className="flex items-center gap-1 md:gap-2 px-3 min-h-[2.5rem]">
          <Logo compact />

          <SawIcon
            className={`w-4 h-4 transition-opacity duration-300 shrink-0 ${activeSection > 0 ? 'opacity-60' : 'opacity-20'} ${idle && activeSection > 0 ? 'animate-blade-sway' : ''}`}
            color={accentColor}
          />

          <div className="relative flex-1 min-w-0">
            <nav ref={navRef} aria-label="Seccions del número" className="nav-scroll flex items-center gap-0 w-full overflow-x-auto min-w-0">
              {sortedSections.map((section, i) => (
                <a
                  key={section.id}
                  href={`#${sectionSlug(i)}`}
                  onClick={(e) => { e.preventDefault(); scrollToSectionEl(i) }}
                  aria-current={i === activeSection ? 'location' : undefined}
                  className={`nav-btn text-2xs uppercase tracking-wider whitespace-nowrap px-1.5 h-9 md:h-7 flex items-center leading-none transition-colors duration-200 shrink-0 ${
                    i === activeSection
                      ? 'active'
                      : 'text-gray-600 hover:text-gray-400'
                  }`}
                  style={i === activeSection ? { color: 'var(--accent-text)' } : undefined}
                >
                  <span>{section.type === 'portada' ? issue.title : section.title}</span>
                </a>
              ))}
            </nav>
            <span className="nav-mask-left" aria-hidden="true" />
            <span className="nav-mask-right" aria-hidden="true" />
          </div>

          <div data-share-region className="flex items-center min-w-0">
            {showStrip && !isMobile ? (
              <div className="flex h-8 items-stretch divide-x divide-gray-800 border border-gray-800 bg-white/[0.03] min-w-0 overflow-x-auto nav-scroll">
                {shareTargets.map((t, i) => (
                  <a
                    key={t.name}
                    href={t.href}
                    target={t.name === 'Correu' ? undefined : '_blank'}
                    rel={t.name === 'Correu' ? undefined : 'noopener noreferrer'}
                    onClick={closeShare}
                    title={t.name}
                    aria-label={t.label}
                    className={`${stripAnim} w-8 h-8 shrink-0 flex items-center justify-center text-gray-400 transition-all duration-150 hover:scale-110 active:scale-90 focus-visible:outline-offset-[-2px]`}
                    style={{ animationDelay: stripDelay(i) }}
                    onMouseEnter={iconHoverOn}
                    onMouseLeave={iconHoverOff}
                  >
                    {t.icon}
                  </a>
                ))}
                <button
                  type="button"
                  onClick={copyShareLink}
                  title="Copiar l'enllaç"
                  aria-label="Copiar l'enllaç"
                  className={`${stripAnim} w-8 h-8 shrink-0 flex items-center justify-center text-gray-400 transition-all duration-150 hover:scale-110 active:scale-90 focus-visible:outline-offset-[-2px]`}
                  style={{ animationDelay: stripDelay(shareTargets.length) }}
                  onMouseEnter={iconHoverOn}
                  onMouseLeave={iconHoverOff}
                >
                  {copied ? <CheckIcon className="w-4 h-4 animate-check-pop" /> : <CopyIcon className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={closeShare}
                  title="Tancar"
                  aria-label="Tancar"
                  className={`${stripAnim} w-8 h-8 shrink-0 flex items-center justify-center text-gray-400 transition-all duration-150 hover:scale-110 active:scale-90 focus-visible:outline-offset-[-2px]`}
                  style={{ animationDelay: stripDelay(shareTargets.length + 1) }}
                  onMouseEnter={iconHoverOn}
                  onMouseLeave={iconHoverOff}
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openShare}
                className={`w-8 h-8 shrink-0 border border-gray-800 text-gray-400 transition-all duration-150 active:scale-95 flex items-center justify-center ${togglePop ? 'animate-share-toggle-in' : ''}`}
                title="Compartir"
                aria-label="Compartir"
                onMouseEnter={toggleHoverOn}
                onMouseLeave={toggleHoverOff}
              >
                <ShareIcon />
              </button>
            )}
          </div>
        </div>
        {/* Full de compartir mòbil. */}
        {showStrip && isMobile && (
          <div
            data-share-region
            role="dialog"
            aria-modal="true"
            aria-label="Compartir"
            onClick={closeShare}
            className={`fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 ${sharePhase === 'closing' ? 'share-backdrop-closing' : 'share-backdrop'}`}
          >
            <div
              ref={sheetRef}
              onClick={(e) => e.stopPropagation()}
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
              className={`w-full max-w-md bg-black border-t border-gray-800 ${sharePhase === 'closing' ? 'share-sheet-closing' : 'share-sheet'}`}
            >
              <div
                onPointerDown={onHandlePointerDown}
                onPointerMove={onHandlePointerMove}
                onPointerUp={onHandlePointerUp}
                onPointerCancel={onHandlePointerUp}
                className="flex justify-center pt-3 pb-2 touch-none cursor-grab active:cursor-grabbing"
              >
                <span className="h-1 w-10 rounded-full bg-gray-700" aria-hidden="true" />
              </div>
              {canNativeShare && (
                <button
                  type="button"
                  onClick={shareWithSystem}
                  className="flex h-12 w-full items-center gap-3 px-4 text-sm text-gray-100 border-t border-gray-900 active:bg-white/[0.05]"
                >
                  <span className="w-5 flex items-center justify-center text-gray-400"><ShareIcon /></span>
                  <span>Compartir amb el sistema</span>
                </button>
              )}
              {shareTargets.map((t) => (
                <a
                  key={t.name}
                  href={t.href}
                  target={t.name === 'Correu' ? undefined : '_blank'}
                  rel={t.name === 'Correu' ? undefined : 'noopener noreferrer'}
                  onClick={closeShare}
                  className="flex h-12 items-center gap-3 px-4 text-sm text-gray-300 border-t border-gray-900 active:bg-white/[0.05]"
                >
                  <span className="w-5 flex items-center justify-center text-gray-400">{t.icon}</span>
                  <span>{t.name}</span>
                </a>
              ))}
              <button
                type="button"
                onClick={copyShareLinkAndClose}
                className="flex h-12 w-full items-center gap-3 px-4 text-sm text-gray-300 border-t border-gray-900 active:bg-white/[0.05]"
              >
                <span className="w-5 flex items-center justify-center text-gray-400">
                  {copied ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon />}
                </span>
                <span>{copied ? 'Enllaç copiat' : "Copiar l'enllaç"}</span>
              </button>
              <button
                type="button"
                onClick={closeShare}
                className="flex h-12 w-full items-center gap-3 px-4 text-sm text-gray-400 border-t border-gray-800 active:bg-white/[0.05]"
              >
                <span className="w-5 flex items-center justify-center"><CloseIcon /></span>
                <span>Tancar</span>
              </button>
            </div>
          </div>
        )}

        {copied && (
          <div role="status" className="absolute left-1/2 -translate-x-1/2 top-full z-50 bg-black/90 border border-gray-800 px-4 py-2 text-xs text-gray-400 animate-fade-in whitespace-nowrap">
            Enllaç copiat
          </div>
        )}
        <NewsletterPopUp visible={showNewsletter} onDismiss={() => setShowNewsletter(false)} />
      </div>

      {/* Progress bar */}
      {sortedSections.length > 1 && (
        <div
          ref={progressRef}
          className="fixed top-0 left-0 h-[2px] z-[10000] pointer-events-none transition-[width] duration-150 ease-out motion-reduce:transition-none"
          style={{
            width: '0%',
            backgroundColor: 'var(--accent)',
          }}
        />
      )}

      {/* Sections */}
      {sortedSections.map((section, i) => (
        <Fragment key={section.id}>
      {i === 0 ? (
        <div data-section-index={i} id={sectionSlug(i)} className="section-shell">
          <SectionBackground section={section as any} />
          <div className="section-container min-h-[100dvh]">
            <div className="relative z-[3] w-full">
              <PortadaSection section={section as any} sumariEntries={sumariEntries} issueNumber={issue.number} />
            </div>
          </div>
        </div>
      ) : (
        <div data-section-index={i} id={sectionSlug(i)}>
          <SectionRenderer section={section as any} index={i} />
        </div>
      )}

        </Fragment>
      ))}
    </div>
  )
}
