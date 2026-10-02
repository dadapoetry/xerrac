import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllSettings } from '@/lib/settings'
import { DEFAULT_CONTACT_EMAIL } from '@/lib/site'
import { SawIcon } from '@/components/SawIcon'

export const dynamic = 'force-dynamic'

const UPDATED = '2 d’octubre de 2026'

export const metadata: Metadata = {
  title: 'Política de privacitat',
  description: 'Quina informació personal tracta Xerrac!, amb quina finalitat, qui hi té accés i quins drets podeu exercir.',
  alternates: { canonical: '/privacitat' },
  robots: { index: true, follow: true },
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-white text-base md:text-lg font-bold tracking-tight uppercase mt-10 mb-3">
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-300 text-[15px] leading-relaxed mb-4">{children}</p>
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="text-gray-300 text-[15px] leading-relaxed mb-2 list-disc pl-5 marker:text-gray-600">
      {children}
    </li>
  )
}

export default async function PrivacyPage() {
  const settings = await getAllSettings()
  const email = settings.contact_email?.trim() || DEFAULT_CONTACT_EMAIL
  const issn = settings.footer_issn?.trim() || ''

  return (
    <div className="py-16 md:py-24 px-4">
      <article className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <span style={{ color: 'var(--accent)' }}>
            <SawIcon className="w-4 h-4" />
          </span>
          <span className="text-[10px] text-gray-500 font-mono tracking-[0.3em] uppercase">
            Dades personals
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase leading-none mb-2">
          Política de
        </h1>
        <p className="text-3xl md:text-4xl font-black tracking-tight leading-none mb-4" style={{ color: 'var(--accent)' }}>
          privacitat
        </p>
        <p className="text-xs text-gray-600 mb-10">
          Darrera actualització: {UPDATED}
        </p>

        <P>
          Aquesta política explica quina informació personal tracta{' '}
          <span className="text-white">Xerrac! — Revista d’aclariment cultural</span>{' '}
          (en endavant, «Xerrac!» o «la revista»), amb quina finalitat la fem servir, qui hi té
          accés i quins drets podeu exercir. L’apliquem d’acord amb el Reglament (UE) 2016/679
          del Parlament Europeu i del Consell, de 27 d’abril, relatiu a la protecció de les
          persones física en el tractament de dades personals i a la lliure circulació
          d’aquestes dades (RGPD), i amb la Llei orgànica 3/2018, de 5 de desembre, de protecció
          de dades i garantia dels drets digitals (LOPDGDD).
        </P>

        <H>1. Responsable del tractament</H>
        <P>
          El responsable del tractament és l’equip editorial de Xerrac! — Revista
          d’aclariment cultural.
        </P>
        <ul className="mb-4 text-[15px] leading-relaxed text-gray-300">
          <li className="mb-1">
            <span className="text-gray-500">Correu de contacte:</span>{' '}
            <a href={`mailto:${email}`} className="text-white underline hover:text-gray-400 transition-colors">
              {email}
            </a>
          </li>
          {issn && (
            <li>
              <span className="text-gray-500">ISSN:</span> {issn}
            </li>
          )}
        </ul>
        <P>
          Aquesta adreça és, alhora, la via per exercir els drets que s’exposen a l’apartat 6 i
          per fer-nos qualsevol consulta o reclamació relacionada amb la revista.
        </P>

        <H>2. Quina informació personal tractem</H>
        <P>Només tractem la informació que vosaltres decideixu-nos lliurar:</P>
        <ul className="mb-4">
          <Li>
            <span className="text-white">L’adreça de correu electrònic</span>, quan l’escriu al
            formulari de subscripció al butlletí (a la revista o a la pàgina{' '}
            <Link href="/subscriu" className="underline hover:text-white">/subscriu</Link>).
          </Li>
          <Li>
            <span className="text-white">L’estat de la subscripció</span>: si s’ha confirmat o si
            continua pendent.
          </Li>
          <Li>
            <span className="text-white">Un codi intern de verificació</span>, generat de manera
            aleatòria i associat només a la vostra adreça. Ens permet confirmar la subscripció i
            oferir-vos la baixa amb un sol clic. No conté cap informació personal i el
            substituïm quan confirmeu la subscripció.
          </Li>
        </ul>
        <P>
          No emmagatzemem la data ni l’hora de la subscripció, ni cap altra dada que permeti saber
          quan heu subscrit o des de quina adreça electrònica ho heu fet. No demanem, i per tant
          no tractem, cap altra dada personal: ni nom ni cognoms, ni adreça postal, ni telèfon, ni
          targetes de pagament, ni documents d&apos;identitat. No fem segmentació
          d&apos;audiència ni publicitat personalitzada, i no mesurem la vostra activitat amb
          eines de mesurament d&apos;audiència.
        </P>

        <H>3. Per a què la fem servir i amb quina base legal</H>
        <P>
          La finalitat és única: enviar-vos el butlletí de la revista per correu electrònic. La
          base legal és el <span className="text-white">vostre consentiment</span> (article 6.1.a
          del RGPD), demanat de manera separada i específica per a aquesta finalitat, que podeu
          retirar en qualsevol moment.
        </P>
        <P>
          El consentiment es formalitza en dos passos, per confirmar que la subscripció és real i
          que el correu és vostre: primer, introduïu l’adreça al formulari i premeu
          «Subscriure’m»; segonament, obriu l’enllaç del correu de confirmació que us enviem i
          premeu el botó de confirmació (la{' '}
          <span className="text-white">doble confirmació</span>). Aquest segon pas ens permet,
          entre d’altres coses, descartar subscripcions automatitzades i errors de transcripció.
        </P>

        <H>4. Per quant de temps conservem les dades</H>
        <ul className="mb-4">
          <Li>
            <span className="text-white">Subscripcions confirmades:</span> conservem l’adreça
            mentre la subscripció estigui activa, és a dir, fins que premeu l’enllaç de baixa del
            butlletí o ens demaneu que l’eliminem. A partir d’aquell moment, el registre s’esborra
            de la nostra base de dades.
          </Li>
          <Li>
            <span className="text-white">Subscripcions sense confirmar:</span> l’adreça només
            serveix per enviar-vos el missatge de confirmació. Si no la confirmeu, no
            s’utilitzarà per a cap altra finalitat i podeu demanar-nos que l’eliminem quan
            vulgueu, escrivint-nos.
          </Li>
        </ul>
        <P>
          No reutilitzem l’adreça per a cap altra finalitat, no la cedim i no la venem a tercers.
          Com que no en registrem la data, no apliquem cap termini de caducitat: el que determina
          quan s’elimina l’adreça és l’estat de la subscripció, no el temps transcorregut.
        </P>
        <P>
          Per protegir els formularis contra l’abús automatitzat, quan escriviu una adreça hi desem
          temporalment un registre amb aquesta adreça i l’instant de l’intent. Aquest registre
          s’elimina automàticament en menys de 24 hores i també s’esborra immediatament si
          premeu l’enllaç de baixa.
        </P>

        <H>5. Qui hi té accés: proveïdors i transferències internacionals</H>
        <P>
          Per operar el web i enviar-vos el butlletí ens servim de proveïdors externs que actuen
          com acessorsors, és a dir, que tracten les dades en nom nostre i només per a les
          finalitats descrites en aquesta política:
        </P>
        <ul className="mb-4">
          <Li>
            <span className="text-white">Turso</span> (estats Units): allotjament de la base de
            dades on consta permanentment la llista de subscriptors. És l’únic lloc on la vostra
            adreça es desa de manera permanent.
          </Li>
          <Li>
            <span className="text-white">Resend</span> (estats Units): enviament dels correus
            electrònics, tant el missatge de confirmació com el butlletí. Rep i conserva
            temporalment les dades necessàries per enviar-los.
          </Li>
          <Li>
            <span className="text-white">Vercel</span> (estats Units): allotjament i execució del
            web. Pot processar dades de manera transitòria com a part de la infraestructura del
            servidor —per exemple, en els registres d’accés i de les funcions—, sense
            utilitzar-les per a cap finalitat pròpia.
          </Li>
        </ul>
        <P>
          No incloem la vostra adreça en cap adreça web (URL) ni la retornem al navegador de les
          persones subscrites: només viatja dins de la petició que processa el servidor. La llista
          de subscriptors només és accessible per l’equip editorial.
        </P>
        <P>
          Aquestes entitats estan situades fora de l’Espai Econòmic Europeu, de manera que el
          tractament implica una transferència internacional de dades. Els acords que mantenim
          amb cada proveïdor recullen les garanties que preveu el Capítol V del RGPD —concretament,
          les clàusules contractuals tipus aprovades per la Comissió Europea—, juntament amb
          mesures tècniques i organitzatives adeqüades.
        </P>

        <H>6. Els vostres drets</H>
        <P>
          Podeu exercir en qualsevol moment els drets d’accés, rectificació, supressió, limitació
          del tractament, oposició, portabilitat i retirada del consentiment.
        </P>
        <P>
          Per exercir-los, escriviu-nos a{' '}
          <a href={`mailto:${email}`} className="text-white underline hover:text-gray-400 transition-colors">
            {email}
          </a>{' '}
          indicant quin dret voleu exercir i a quina adreça es refereix. Us respondrem en el
          termini d’un mes. Si la sol·licitud és complexa i no la podem atendre a temps, us ho
          comunicarem i el termini es podrà ampliar fins a dos mesos.
        </P>
        <P>
          Si no considereu satisfactòria la nostra resposta, podeu presentar una reclamació davant
          l’autoritat de control competent: l’Agència Espanyola de Protecció de Dades (
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-gray-400 transition-colors">
            www.aepd.es
          </a>
          ) o l’Autoritat Catalana de Protecció de Dades (
          <a href="https://www.apdcat.cat" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-gray-400 transition-colors">
            www.apdcat.cat
          </a>
          ). Si ho preferiu, us podem ajudar a presentar-la.
        </P>

        <H>7. Com protegim les dades</H>
        <P>
          El web es serveix sobre HTTPS, amb xifratge del trànsit. L’accés a la base de dades i a
          l’àrea d’administració de la revista està restringit a l’equip editorial, les
          contrasenyes s’emmagatzemen xifrades i els missatges s’envien sense capfitx ni
          seguiment. Cap mesura de seguretat no ofereix una garantia absoluta, però apliquem les
          mesures raonables que corresponen a la naturalesa i al risc del tractament i en revisem
          l’efectivitat.
        </P>

        <H>8. Galetes (cookies)</H>
        <P>
          Aquest web no utilitza galetes publicitàries, de perfilat ni de mesurament
          d&apos;audiència, de manera que no cal cap galeta de consentiment. Les úniques galetes
          són les estrictament necessàries per fer funcionar el lloc: la galeta de sessió de
          l’àrea privada d’administració, que només utilitza l’equip editorial. Quan tanqueu el
          formulari del butlletí sense subscriure-us, el navegador recorda aquesta decisió
          únicament dins de la sessió oberta (memòria del navegador, sense enviar res al
          servidor).
        </P>
        <P>
          Si en el futur hi afegíem analítica, publicitat o altres eines de perfilat,
          actualitzarem aquesta pàgina i, quan calgui, us demanarem el consentiment
          corresponent.
        </P>

        <H>9. Menors d’edat</H>
        <P>
          Aquest web no s’adreça a menors d’edat i no recollim de manera deliberada dades de
          nens i adolescents. Si creieu que un menor ens ha proporcionat una adreça de correu
          electrònic, escriviu-nos i l’eliminem.
        </P>

        <H>10. Modificacions d’aquesta política</H>
        <P>
          Si fem canvis substancials en la manera de tractar les dades, actualitzarem aquesta
          pàgina i hi indicarem la nova data d’actualització. La versió vigent és sempre la que
          trobareu en aquesta adreça.
        </P>

        <div className="mt-14 pt-8 border-t border-gray-800 flex flex-wrap gap-6 text-xs uppercase tracking-wider">
          <Link href="/subscriu" className="text-gray-400 hover:text-white transition-colors">
            Subscriure&apos;t al butlletí
          </Link>
          <Link href="/" className="text-gray-500 hover:text-white transition-colors">
            ← Torna a la revista
          </Link>
        </div>
      </article>
    </div>
  )
}
