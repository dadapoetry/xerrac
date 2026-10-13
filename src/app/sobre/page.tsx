import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllSettings } from '@/lib/settings'
import { getSiteUrl, DEFAULT_CONTACT_EMAIL, hreflang } from '@/lib/site'
import { SawIcon } from '@/components/SawIcon'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Qui som',
  description: "Xerrac! és una revista cultural digital semestral en català. Cada número és un volum monogràfic amb una tesi pròpia, amb seccions de crítica, traducció, ficció i jocs de llengua.",
  alternates: { canonical: '/sobre', languages: hreflang() },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Qui som — Xerrac!',
    description: "Revista cultural digital semestral en català. Cada número, un volum monogràfic amb tesi pròpia.",
    url: `${getSiteUrl()}/sobre`,
  },
}

const SECTIONS: { name: string; desc: string }[] = [
  { name: 'Portada', desc: 'el tema del número, en una línia.' },
  { name: 'Editorial', desc: 'el manifest que obre el número i n’enuncia la tesi.' },
  { name: 'Aclariment Cultural', desc: 'l’argumentació llarga: aclarir allò que continua sense aclarir-se.' },
  { name: 'Calaix de Sastre', desc: 'crítica i investigació comparada, amb referències i fonts.' },
  { name: 'Visita', desc: 'la traducció d’un text fundador, presentada com a citació a gran.' },
  { name: 'Fàdu Català', desc: 'ficció satírica: biografies apòcrifes, ucronies i artefactes.' },
  { name: 'Pàgines Grogues', desc: 'aforismes i refranys deformats per la temàtica del número.' },
  { name: 'Ludita', desc: 'un encreuat fet amb el vocabulari del número.' },
  { name: 'Assaig visual', desc: 'un relat en imatges que avança amb el desplaçament.' },
  { name: 'Necrològiques conceptuals', desc: 'obituaris de conceptes, no de persones.' },
  { name: 'Full Mural', desc: 'un mural amb material enviat pels lectors.' },
]

export default async function AboutPage() {
  const settings = await getAllSettings()
  const siteUrl = getSiteUrl()
  const email = settings.contact_email?.trim() || DEFAULT_CONTACT_EMAIL
  const issn = settings.footer_issn?.trim() || ''
  const periodicity = settings.footer_periodicity?.trim() || ''
  const address = settings.footer_address?.trim() || ''
  const license = settings.footer_license?.trim() || ''

  let socialLinks: { name: string; url: string }[] = []
  try {
    const parsed = JSON.parse(settings.footer_social_links || '[]')
    if (Array.isArray(parsed)) socialLinks = parsed.filter((l: any) => l?.url)
  } catch {
    socialLinks = []
  }

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Qui som — Xerrac!',
    url: `${siteUrl}/sobre`,
    inLanguage: 'ca',
    mainEntity: {
      '@type': 'Periodical',
      name: 'Xerrac!',
      url: siteUrl,
      description: 'Revista cultural digital semestral en català. Cada número és un volum monogràfic amb una tesi pròpia.',
      inLanguage: 'ca',
      ...(issn ? { issn } : {}),
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
      <div className="flex-1 py-16 md:py-24 px-4">
        <article className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <span style={{ color: 'var(--accent)' }}>
              <SawIcon className="w-4 h-4" />
            </span>
            <span className="text-[10px] text-gray-500 font-mono tracking-[0.3em] uppercase">
              La publicació
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase leading-none mb-6">
            Qui som
          </h1>

          <p className="text-gray-300 text-[15px] leading-relaxed mb-4">
            <strong className="text-white">Xerrac!</strong> és una revista cultural digital en català,
            de periodicitat semestral i amb vocació de revista en paper. Cada número és un{' '}
            <strong className="text-white">volum monogràfic amb una tesi pròpia</strong> —un tema, un
            angle i un to— que travessa totes les seccions i es llegeix en ordre, com un número de
            revista.
          </p>
          <p className="text-gray-300 text-[15px] leading-relaxed mb-6">
            El nom ve de l&rsquo;eina: una fulla d&rsquo;acer d&rsquo;un mil·límetre, rígida i alhora
            una mica flexible. No és un receptari de materials coneguts ni una revista de crítica a
            l&rsquo;ús. Torna a posar en conversa autors, textos i conceptes —sovint per primera
            vegada— per veure què en surt quan es posen l&rsquo;un al costat de l&rsquo;altre.
          </p>

          <h2 className="text-white text-base md:text-lg font-bold tracking-tight uppercase mt-10 mb-3">
            Què hi trobareu
          </h2>
          <ul className="text-gray-300 text-[15px] leading-relaxed mb-4">
            {SECTIONS.map((section) => (
              <li key={section.name} className="mb-2 list-disc pl-5 marker:text-gray-600">
                <strong className="text-white">{section.name}</strong> — {section.desc}
              </li>
            ))}
          </ul>

          <h2 className="text-white text-base md:text-lg font-bold tracking-tight uppercase mt-10 mb-3">
            Dades de la publicació
          </h2>
          <ul className="text-gray-300 text-[15px] leading-relaxed mb-4 space-y-1">
            {issn && <li>ISSN: {issn}</li>}
            {periodicity && <li>Periodicitat: {periodicity}</li>}
            {address && <li>{address}</li>}
            {license && <li>{license}</li>}
          </ul>

          <h2 className="text-white text-base md:text-lg font-bold tracking-tight uppercase mt-10 mb-3">
            Contacte
          </h2>
          <p className="text-gray-300 text-[15px] leading-relaxed mb-4">
            Podeu escriure&rsquo;ns a{' '}
            <a href={`mailto:${email}`} className="text-white hover:text-gray-400 underline underline-offset-4">
              {email}
            </a>
            .
          </p>
          {socialLinks.length > 0 && (
            <ul className="text-gray-300 text-[15px] leading-relaxed mb-4">
              {socialLinks.map((l) => (
                <li key={l.name} className="mb-2 list-disc pl-5 marker:text-gray-600">
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    {l.name}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-gray-800 text-[11px] uppercase tracking-wider">
            <Link href="/arxiu" className="text-gray-400 hover:text-white transition-colors">
              Arxiu d&rsquo;aclariments
            </Link>
            <Link href="/subscriu" className="text-gray-400 hover:text-white transition-colors">
              Subscriu-te
            </Link>
            <Link href="/privacitat" className="text-gray-400 hover:text-white transition-colors">
              Privacitat
            </Link>
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              ← Tornar a la revista
            </Link>
          </div>
        </article>
      </div>
      <Footer />
    </div>
  )
}
