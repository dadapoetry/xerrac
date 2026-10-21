import type { Metadata } from 'next'
import { getAllSettings } from '@/lib/settings'
import { getSiteUrl, ogImageUrl } from '@/lib/site'
import { SECTION_LABELS } from '@/types'
import { SawIcon } from '@/components/SawIcon'
import { AccentScope } from '@/components/AccentScope'
import { FooterMeta } from '@/components/FooterMeta'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'La revista',
  description: "Xerrac! és una revista cultural digital semestral en català. Cada número és un volum monogràfic amb tesi pròpia: una eina de nova cultura que vol aclarir tot allò que continua sense aclarir-se.",
  alternates: { canonical: `${getSiteUrl()}/sobre` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'La revista — Xerrac!',
    description: "Revista cultural digital semestral en català. Una eina de nova cultura que vol aclarir tot allò que continua sense aclarir-se.",
    url: `${getSiteUrl()}/sobre`,
    images: [{ url: ogImageUrl({ title: 'La revista' }), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La revista — Xerrac!',
    description: "Revista cultural digital semestral en català. Una eina de nova cultura que vol aclarir tot allò que continua sense aclarir-se.",
    images: [ogImageUrl({ title: 'La revista' })],
  },
}

// Descripcions de les seccions. Els noms surten de SECTION_LABELS perquè no
// tornin a divergir de la resta del lloc. L'«Assaig Visual» no es descriu aquí.
const SECTIONS: { type: string; desc: string }[] = [
  { type: 'portada', desc: 'el tema del número, en una línia.' },
  { type: 'editorial', desc: 'el manifest que obre el número i n’enuncia la tesi.' },
  { type: 'aclariment_cultural', desc: 'l’argumentació llarga: aclarir allò que continua sense aclarir-se.' },
  { type: 'calaix_sastre', desc: 'crítica i investigació comparada, amb referències i fonts.' },
  { type: 'visita', desc: 'turisme teòric només quan cal.' },
  { type: 'fadu_catala', desc: 'ficció satírica: biografies apòcrifes, ucronies i artefactes.' },
  { type: 'pagines_grogues', desc: 'aforismes i refranys deformats per la temàtica del número.' },
  { type: 'ludita', desc: 'un encreuat fet amb el vocabulari del número.' },
  { type: 'necrologiques', desc: 'obituaris de conceptes, no de persones.' },
  { type: 'full_mural', desc: 'un mural amb material enviat pels lectors.' },
]

export default async function AboutPage() {
  const settings = await getAllSettings()
  const siteUrl = getSiteUrl()
  const issn = settings.footer_issn?.trim() || ''

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'La revista — Xerrac!',
    url: `${siteUrl}/sobre`,
    inLanguage: 'ca',
    mainEntity: {
      '@type': 'Periodical',
      name: 'Xerrac!',
      url: siteUrl,
      description: 'Revista cultural digital semestral en català. Cada número és un volum monogràfic amb tesi pròpia; una eina de nova cultura que vol aclarir tot allò que continua sense aclarir-se.',
      inLanguage: 'ca',
      ...(issn ? { issn } : {}),
    },
  }

  return (
    <AccentScope>
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
      <div className="flex-1 py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[2fr_1fr] gap-10 md:gap-16">
        <article className="min-w-0">
          <div className="flex items-center gap-2 mb-6">
            <span style={{ color: 'var(--accent-text)' }}>
              <SawIcon className="w-4 h-4" />
            </span>
            <span className="text-2xs text-gray-500 font-mono tracking-[0.3em] uppercase">
              Eina de nova cultura
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-6">
            La revista
          </h1>

          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            <strong className="text-white">Xerrac!</strong> és una revista cultural digital en català,
            de periodicitat semestral i amb vocació de revista en paper. Cada número és un{' '}
            <strong className="text-white">volum monogràfic amb una tesi pròpia</strong> —un tema, un
            angle i un to— que travessa totes les seccions i es llegeix en ordre, com un número de
            revista.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            El nom ve de l&rsquo;eina: una fulla d&rsquo;acer d&rsquo;aproximadament un mil·límetre
            de gruix, d&rsquo;una certa rigidesa però alhora amb una mica de flexibilitat.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            Xerrac és una <strong className="text-white">eina de nova cultura</strong>: vol produir
            pensament nou i noves referències, ser el suport que fins ara no hi era i, sobretot,
            aclarir tot allò que continua sense aclarir-se.
          </p>

          <h2 className="text-white text-md md:text-xl font-bold tracking-tight uppercase mt-10 mb-3">
            Què hi trobareu
          </h2>
          <ul className="text-gray-300 text-sm leading-relaxed mb-4">
            {SECTIONS.map((section) => (
              <li key={section.type} className="mb-2 list-disc pl-5 marker:text-gray-600">
                <strong className="text-white">{SECTION_LABELS[section.type]}</strong> — {section.desc}
              </li>
            ))}
          </ul>

        </article>
        <aside className="md:border-l border-gray-800 md:pl-8 pt-10 md:pt-0">
          <FooterMeta />
        </aside>
        </div>
      </div>
    </div>
    </AccentScope>
  )
}
