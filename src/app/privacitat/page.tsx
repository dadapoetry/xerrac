import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllSettings } from '@/lib/settings'
import { SawIcon } from '@/components/SawIcon'

export const dynamic = 'force-dynamic'

const UPDATED = '2 d’octubre de 2026'
const FALLBACK_EMAIL = 'contacte@laxerrac.cat'

export const metadata: Metadata = {
  title: 'Política de privacitat',
  description: 'Quina informació personal tracta Xerrac!, amb quina finalitat i quins drets teniu per exercir-los.',
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
  const email = settings.contact_email?.trim() || FALLBACK_EMAIL
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
          (en endavant, «Xerrac!» o «la revista»), per a què la fem servir, qui hi té accés i
          quins drets podeu exercir. L’apliquem d’acord amb el Reglament (UE) 2016/679 del Parlament
          Europeu i del Consell, de 27 d’abril, relatiu a la protecció de les persones PHYSiques
          en el tractament de dades personals i a la lliure circulació d’aquestes dades (RGPD), i
          amb la Llei orgànica 3/2018, de 5 de desembre, de protecció de dades i garantia dels
          drets digitals (LOPDGDD).
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
          Aquest correu és, alhora, la via per exercir els drets descrits a l’apartat 6 i per
          tractar qualsevol consulta o reclamació relacionada amb la revista.
        </P>

        <H>2. Quina informació tractem</H>
        <P>Només tractem la informació que vosaltres decideixu donar-nos, i és:</P>
        <ul className="mb-4">
          <Li>
            <span className="text-white">L’adreça de correu electrònic</span>, quan escriviu el
            vostre correu al formulari del butlletí (a la revista o a la pàgina{' '}
            <Link href="/subscriu" className="underline hover:text-white">/subscriu</Link>).
          </Li>
          <Li>
            <span className="text-white">L’estat de la inscripció</span>: si la subscripció
            s’ha confirmat o encara està pendent.
          </Li>
        </ul>
        <P>
          No emmagatzemem cap data ni hora de la inscripció, ni cap dada que permeti saber quan
          o des d&apos;on heu subscrit. No demanem, i per tant no tractem, cap altra dada
          personal: ni nom ni cognoms, ni adreça postal, ni telèfon, ni targetes de pagament, ni
          documents d&apos;identitat. No fem segmentació d&apos;audiència ni publicitat
          personalitzada, i no traquem la vostra activitat amb eines de mesurament.
        </P>

        <H>3. Per a què la fem servir i amb quina base legal</H>
        <P>
          La finalitat és única: enviar-vos el butlletí de la revista per correu electrònic. La
          base legal és el <span className="text-white">vostre consentiment</span> (article 6.1.a
          del RGPD), que demanem de manera separada i específica per a aquesta finalitat i que
          podeu retirar en qualsevol moment.
        </P>
        <P>
          El consentiment es manifesta en dos passos, perquè ens puguem assurem que és real i
          que el correu és vostre: primer, en introduir l’adreça i prémer «Subscriure’m»; després,
          en prémer el botó de confirmació del correu que us enviem (la{' '}
          <span className="text-white">doble confirmació</span>). Aquest segon pas serveix, entre
          d’autres coses, per descartar inscripcions automatitzades o errors de transcripció.
        </P>

        <H>4. Quant de temps la conservem</H>
        <ul className="mb-4">
          <Li>
            <span className="text-white">Subscripcions confirmades:</span> conservem el correu
            mentre duri la subscripció, és a dir, fins que feu clic a l’enllaç de baixa del
            butlletí o ens demaneu que l’eliminem. A partir d’aquell moment, el registre s’esborra
            de la nostra base de dades.
          </Li>
          <Li>
            <span className="text-white">Subscripcions sense confirmar:</span> el correu només
            serveix per poder enviar-vos el missatge de confirmació. Si no el confirmeu, no
            s’utilitzarà per a cap altra cosa; podeu demanar-nos que l’eliminem quan vulgueu
            escrivint-nos.
          </Li>
        </ul>
        <P>
          No reutilitzem l’adreça per a cap altra finalitat, no la cedim i no la venem a
          tercers. Com que no registrem la data de la inscripció, el termini de conservació
          s’ha de fer servir com a criteri general, no com un compte pendent exacte.
        </P>

        <H>5. Qui hi té accés: proveïdors i transferències internacionals</H>
        <P>
          Per operar el web i enviar-vos el butlletí ens servim de proveïdors externs, que
          tracten les dades en nom nostre i només per a les finalitats que hem descrit:
        </P>
        <ul className="mb-4">
          <Li>
            <span className="text-white">Resend</span> (estats Units): enviament dels correus
            electrònics, inclòs el missatge de confirmació i el butlletí.
          </Li>
          <Li>
            <span className="text-white">Vercel</span> (estats Units): allotjament del web.
          </Li>
          <Li>
            <span className="text-white">Turso</span> (estats Units): base de dades on consta la
            llista de subscriptors.
          </Li>
        </ul>
        <P>
          Aquestes entitats estan situades fora de l’Espai Econòmic Europeu, de manera que el
          tractament comporta una transferència internacional de dades. Cadascun dels proveïdors
          manté amb nosaltres contractes que recullen les garanties que preveu el Capítol V del
          RGPD — concretament, les clàusules contractuals tipus aprovades per la Comissió
          Europea — juntament amb mesures tècniques i organitzatives adeqüades.
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
          indicant quin dret voleu exercir i quin correu afectat. Responderem en el termini
          d’un mes. Si la sol·licitud és complexa i no la podem atendre a temps, us
          avisarem i el termini s’ampliarà fins a dos mesos.
        </P>
        <P>
          Si no quedeu satisfets, podeu presentar una reclamació davant l’autoritat de control
          competent: l’Agència Espanyola de Protecció de Dades (
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-gray-400 transition-colors">
            www.aepd.es
          </a>
          ) o l’Autoritat Catalana de Protecció de Dades (
          <a href="https://www.apdcat.cat" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-gray-400 transition-colors">
            www.apdcat.cat
          </a>
          ). Si ho preferiu, us podem ajudar a presentar-la.
        </P>

        <H>7. Com protegit les dades</H>
        <P>
          El web es serveix amb xifratge HTTPS. L’accés a la base de dades i a l’àrea
          d’administració de la revista està restringit a l’equip editorial, i els missatges
          s’envien sense capfitx ni seguiment. Com tota mesura de seguretat, la protecció no
          pot ser total, però apliquem les mesures raonables que corresponen a la naturalesa i
          al risc del tractament, i en revisem l’efectivitat.
        </P>

        <H>8. Cookies</H>
        <P>
          Aquest web no utilitza cookies publicitàries, de perfilat ni de mesurament
          d’audiència, de manera que no cal cap galeta de consentiment. Les úniques cookies
          són les estrictament necessàries per fer funcionar el lloc: la cookie de sessió de
          l’àrea privada d’administració, que només usa l’equip editorial. Quan tanqueu el
          formulari del butlletí sense subscriure-us, el navegador recorda aquesta decisió
          únicament dins la sessió oberta (memòria del navegador, sense enviar res al
          servidor).
        </P>
        <P>
          Si en el futur hi afegíem analítica, publicitat o altres eines de perfilat,
          actualitzarem aquesta pàgina i, quan calgui, us demanarem el consentiment
          corresponent.
        </P>

        <H>9. Menors d’edat</H>
        <P>
          Aquest web no s’adreça a menors d’edat i no recollim de manera intencionada dades de
          nens i adolescents. Si creieu que un menor ens ha proporcionat un correu
          electrònic, escriviu-nos i l’eliminarem.
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
