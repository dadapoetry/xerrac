# Xerrac! — Contracte de disseny

> Document de referència per a qualsevol agent de disseny (OpenDesign o humà).
> Descriu **què és** Xerrac!, **com es compon** la portada i cada secció, i
> **quins tokens visuals** són intocables. No és una lliçó de gust: és la marca
> real, extreta del codi (`src/`). Si una proposta s'allunya d'aquí, no és Xerrac.

---

## 1. Què és Xerrac!

**Xerrac! — Revista d'aclariment cultural.** Revista cultural digital
**semestral**, en **català**, amb **vocació de revista en paper**: cada número és
un **volum monogràfic** amb ordre de lectura, portada pròpia i **un color
d'accent per número**.

To editorial: **aclaridor i satíric**, sec, culte i juganer. La maquetació ha de
semblar una revista impresa endreçada, no una landing page de producte.

**No és:** un blog, un diari, una app de notícies ni un SaaS. Ni tan sols és
"una web de revista": és **un número que es llegeix d'una tirada**.

Restriccions de producte que el disseny ha de respectar sempre:

- Tot el text visible és **en català**. Mai no s'usen signes d'obertura d'interrogació ni d'admiració.
- El domini publicat és **`laxerrac.cat`**.
- El lector fa servir `Courier New` per a metadades i xifres; el cos és `Inter`.
- Els títols de secció són **lliures i formen part del pla editorial**, no són
  etiquetes automàtiques (p. ex. `calaix_sastre` es titula «Calaix Desastre»).

---

## 2. Com es desplega la portada (el lector del número)

La portada **no és una pàgina de màrqueting**: en publicar-se un número, la home
redirigeix (`permanentRedirect`) a `/{numero}` i renderitza el **visor de revista
sencer**. `getLatestIssue()` decideix el número actiu.

Rutes:

| Ruta | Què renderitza |
|---|---|
| `/` | Redirigeix al darrer número publicat; si encara no n'hi ha cap, mostra la **portada buida** (§2.4) |
| `/{numero}` (`/numeros/[number]`) | El **visor complet** de la revista (totes les seccions d'una tirada) |
| `/{numero}/{seccio}` | **Article solt** (una secció), amb capçalera mínima i peu |
| `/arxiu` | Biblioteca de tots els números publicats |
| `/sobre` | «La revista» (presentació) |
| `/privacitat` | Text legal |

### 2.1 Ordre de composició del visor (`IssueView` → `FanzineViewer`)

```
├─ (scripts JSON-LD: PublicationIssue + Breadcrumb)
├─ <FanzineViewer>                       ← la revista
│   ├─ CAPÇALERA STICKY (top-0, z-10)
│   │   ├─ Logo compacte «Xerrac!»
│   │   ├─ Icona serra (opacitat 0,20 a portada · 0,60 després; oscil·la als 4 s d'inactivitat)
│   │   ├─ NAV de seccions (scroll horitzontal, sense barra): 10 px majúscules,
│   │   │     secció activa en color d'accent + subratllat que es dibuixa
│   │   └─ Compartir (peça única segmentada: WhatsApp · X · Facebook · Bluesky · Correu · Copiar · ×)
│   ├─ BARRA DE PROGRÉS (fixed, top-0, 2 px, ample = secció activa / total, color d'accent, z-10000)
│   ├─ SECCIÓ 0 · PORTADA  (section-container min-h-[100dvh], imatge de fons + vel fosc)
│   ├─ SECCIÓ 1..n         (SectionRenderer: .section-container + fons + vel)
│   │      · «assaig» i «necrologiques» no fan servir .section-container: són full-bleed
│   ├─ NEWSLETTER POP-UP (apareix en arribar a la secció 2)
│   └─ (fi del visor)
├─ <Afterthought>    → «Ha quedat clar?» centrat, py-16
└─ <Footer>          → següent número, dades legals, xarxes, navegació de números, ISSN, contacte
```

### 2.2 Navegació i lectura

- Cada secció és un `<div data-section-index={i} id="s-i">` apilat verticalment.
  L'ordre ve de `section.order`.
- Un `IntersectionObserver` (rootMargin `-50% 0px -50% 0px`) marca la **secció
  activa** quan el seu centre creua el centre de la finestra; també sincronitza
  `?section=N` a la URL (`replaceState`) i fa aparèixer el pop-up de subscripció
  a partir de la secció 2.
- **Fletxes** (Esquerra/Amunt i Dreta/Avall) salten de secció en secció, excepte
  quan el focus és en un camp, un botó o un encreuat.
- La nav horitzontal centra automàticament la secció activa.
- En carregar amb `?section=N`, s'hi desplaça suaument.

### 2.3 Anatomia d'una secció (`SectionHeader` + contingut)

Cada secció de contingut comença amb un **capçal tipogràfic** idèntic:

```
   NN                                   ← número gegant de fons (accent, opacitat 0,04)
   ▚  NN  ─────────────────────────  ~N min   ← serra · número mono · filet · temps de lectura
   TÍTOL DE LA SECCIÓ EN MAJÚSCULES
   Subtítol opcional en majúscules
   ▬                                        ← regla d'accent 12×2 px (es dibuixa)
```

- El contenidor universal és `.section-container`: `padding: 5rem 1.5rem`
  (mòbil `4rem 1rem`), centrat, `overflow: hidden`.
- L'amplada del contingut **depèn de la secció** (§4).
- Entrada **esglaonada**: el número apareix, els elements pugen i el filet es
  desplega, amb retards 80 / 176 / 291 / 429 / 595 ms.
- Els fons de secció són **imatges** amb un **vel fosc** a sobre
  (`from-black/75 via-black/55 to-black/75`) perquè el text sempre es llegeixi.
  La imatge de mòbil es tria per viewport.

### 2.4 Portada buida (`EmptyHome`)

Abans del primer número: pantalla centrada, `Logo` gran, una frase, el
`SubscribeForm` i una nav mínima («La revista», «Privacitat»). **Sense peu i
sense enllaç a l'arxiu**: encara no hi ha res a arxivar.

---

## 3. Tokens visuals

### 3.1 Color

| Token | Valor | Ús |
|---|---|---|
| Fons (tinta) | `#0a0a0a` | `body` |
| Negre pur | `#000000` | Barra sticky, fons de secció full-bleed |
| Blanc text | `#fafafa` | `--white`, text base |
| Blanc títol | `#ffffff` | `text-white` (titulars) |
| Cos de text | `#d4d4d4` | `text-gray-300` (prosa) |
| **Accent** | `#ef4444` (per defecte) | `--accent`; **cada número pot sobreescriure'l** (`issue.accentColor`) |
| Accent translúcid | `rgba(var(--accent-rgb), α)` | Fons, vores i ombres de la marca |
| Groc | `#fde047` | **Només** Pàgines Grogues (`--grogues`) |
| Grisos | `#171717` · `#404040` · `#737373` · `#a3a3a3` | Estructura i metadades |
| Vores | `#262626` (`gray-800`), `rgba(255,255,255,.07)`, `rgba(255,255,255,.10)` | Filets i requadres |

Notes de color:

- El **color d'accent s'hereta per CSS variables** (`--accent`, `--accent-rgb`)
  des de l'arrel del visor. Qualsevol element de marca ha de fer servir
  `var(--accent)`, mai un vermell fix.
- Sobre fons negre, `gray-600` i `gray-700` de Tailwind no arriben a contrast
  AA: el lloc els puja a `#a3a3a3` i `#8a8a8a`. **No hi afegim grisos més foscos.**
- **Gra de paper:** `body::before` pinta un soroll fractal fix a `opacity: 0.035`.
  És una signatura de la marca (textura d'impressió). No el traguis.

### 3.2 Tipografia

| Rol | Família | Com |
|---|---|---|
| Cos | **Inter** (`next/font`, `antialiased`) | Prosa i interfície |
| Metadades / xifres | **Courier New** (mono) | Etiquetes, números, temps de lectura, cites, encreuats |
| Titulars de secció | Inter `font-black`, **majúscules**, `tracking-tight`, `leading-[0.95]` | 3xl → 5xl |
| Serra / deco | `Impact` (definit al tema) | Ús puntual |
| Cita de proverbi / Visita | **Georgia** (serif) | Proverbis en groc, cometes grans de Visita |

- Cos editorial (`.editorial-body`): `clamp(0.9375rem, 1vw + 0.25rem, 1.125rem)`,
  `line-height: 1.8`, `letter-spacing: 0.01em`; mòbil `1rem / 1.7`.
- Etiquetes de marca: **10 px**, `uppercase`, `tracking-wider` a `tracking-[0.3em]`.
- Totes les xifres són **tabulars** (`tabular-nums`).
- Les negretes dins la prosa són **accent + weight 700**.
- Números de secció: `text-[140px] md:text-[220px]`, `font-black`, opacitat **0,04**.

### 3.3 Forma, espai i ombres

- **Cantonades rectes** per sistema. Radi permès: `0` (per defecte), `3–4 px`
  (imatges dins text, marca de negreta del scrolly), `rounded-sm` (fons de hover).
- **Sense ombres suaus.** L'única "ombra" és text sobre fotografia:
  `drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]` (titulars `0_2px_8px`).
- Ritme: `py-12` per secció de contingut, `.section-container` `5rem 1rem/1.5rem`,
  capçal amb `mb-12 md:mb-16`.
- Amplades de contingut (per tipus): `prose` · `2xl` · `3xl` · `4xl` · `5xl` (§4).

### 3.4 Moviment

| Nom | Què fa |
|---|---|
| `stagger-item` / `stagger-number` / `stagger-rule` | Entrada del capçal en cruzar-se al viewport (0,45–0,55 s) |
| `animate-fade-in` | Aparició del contingut (`backwards`, no `both`) |
| `blade-sway` | La serra oscil·la suaument quan el lector està inactiu |
| `share-item-in` / `share-item-out` / `share-toggle-in` | La peça de compartir es desplega i es plega esglaonadament |
| `check-pop` | El check de «copiat» fa pop |
| Scrolly | Les escenes del text entren amb desplaçament i retard; la imatge de fons fa un zoom lent |

Sempre que sigui possible, respecta `prefers-reduced-motion` (ja es fa al
capçal i al scrolly). La velocitat és **ràpida i continguda**: mai superior
a ~0,5 s excepte el scrolly, que és narratiu.

### 3.5 Focus i accessibilitat

- `:focus-visible` → `outline: 2px solid #ef4444; outline-offset: 2px`
  (dins una secció, el color d'accent).
- A la peça de compartir, l'offset és **negatiu** (`-2px`) perquè l'anell quedi
  dins la tira amb scroll.
- Contrast: el lloc és fosc; tota metadada ha de superar AA sobre negre.

---

## 4. Catàleg de seccions

| `type` | Etiqueta | Contenidor | Signatura visual |
|---|---|---|---|
| `portada` | Portada | `min-h-[100dvh]` | Logo gran + tema + sumari numerat + «Nº NN» + «Desplaça» |
| `editorial` | Editorial | `max-w-prose` | Capçal + prosa justificada; cites de pull-quote |
| `aclariment_cultural` | Aclariment Cultural | `max-w-prose` | Columna amb **vora esquerra** `rgba(accent,.3)` i citacions en cursiva |
| `fadu_catala` | Fadu Català | `max-w-4xl` | Targetes d'entrada: etiqueta + `#01` + títol + cos |
| `pagines_grogues` | Pàgines Grogues | `max-w-5xl` (intern 4xl) | Graella 2 col. de proverbis **serif en groc**, numerats, amb tint a l'hover |
| `calaix_sastre` | Calaix Desastre | `max-w-5xl` | Grups «Entrevistes» (caixes), «Crítiques» (2 col.), «Investigació» |
| `visita` | Visita | `max-w-2xl` | Font en cursiva, cometes gegants serif « », vora esquerra d'accent |
| `full_mural` | Full Mural | `max-w-5xl` | Graella de collages + línia «Participa-hi — envia…» |
| `ludita` | Ludita | `max-w-3xl` | Encreuat (graella interactiva, mono, majúscules) |
| `assaig` | Assaig Visual | **Full-bleed** | Scrollytelling: imatge clavada a pantalla, text per sobre en escenes |
| `necrologiques` | Necrològiques Conceptuals | **Full-bleed** + `prose` | Fons opcional + vel, filet d'accent, obituaris (nom · †anys · epitafi) |

> Els noms canònics viuen a `src/types/index.ts` (`SECTION_LABELS`). L'admin,
> l'arxiu, la imatge OG i `/sobre` els importen d'allà. **No els dupliquis.**

Particularitats que el disseny ha de preservar:

- **Assaig Visual** i **Necrològiques** no porten `.section-container`: ocupen
  tota l'amplada i tenen el seu propi tractament de fons.
- **Assaig Visual** no apareix a `/sobre` (decisió de producte).
- A l'Assaig, la negreta sobre fotografia usa **accent sobre un fons fosc
  semitransparent** (estil retolador), no vermell pla.

---

## 5. Components de marca

- **Logo** (`Logo.tsx`): «XERRAC» + «**!**» d'accent amb halo i un filet
  d'accent a sota; subtítol «Revista d'aclariment cultural» (10 px, majúscules,
  `tracking-[0.25em]`). Versió compacta a la capçalera sticky.
- **Serra** (`SawIcon.tsx`): silueta de xerrac, sempre en color d'accent.
- **Requadres i filets**: `border-gray-800` i `bg-white/10` — fins, mai gruixuts.
- **Compartir** (`FanzineViewer`): peça única segmentada de 32 px d'alçada amb
  divisors; en desplegar-se/plegar-se ho fa amb micro-animació. Manté WhatsApp, X,
  Facebook, Bluesky, Correu i Copiar, més el botó de tancar ×.
- **Subscripció** (`SubscribeForm` + `PrivacyNote`): caixa amb vora `gray-800`,
  fons `gray-950`; nota de privacitat **en un sol paràgraf**.
- **Peu** (`Footer.tsx`): targeta de «Número següent» amb portada, dades legals,
  xarxes, navegació anterior/següent i enllaços (Arxiu, La revista, Privacitat, RSS).
- **Arxiu** (`/arxiu`): biblioteca amb **5 tractaments alterns** de número
  (hero, split esquerra, split dreta, tipogràfic, galeria), número gegant
  d'opacitat 0,07, accents per número.

---

## 6. Decideix així (regles per a l'agent de disseny)

**Fes-ho:**

- Partir sempre del **color d'accent del número** i de les variables CSS.
- Mantenir el **to de paper imprès**: tipografia, filets, números grans de fons,
  textura de gra, negre profund.
- Prioritzar **llegibilitat editorial**: prosa justificada, cos còmode, contrast.
- Respectar la **composició per ordre de secció** i el caràcter monogràfic.
- Pensar en **mòbil primer**: nav amb scroll, portada 100dvh, full-bleed.

**No ho facis:**

- No converteixis el visor en una landing amb *hero*, targetes de features,
  preus o CTA comercials.
- No introdueixis cantonades arrodonides grans, ombres toves, gradients
  cridaners, glassmorphism ni colors de marca aliens a l'accent del número.
- No afegeixis signes d'obertura d'interrogació ni d'admiració, ni canviïs el to lingüístic (és català, sec i culte).
- No toquis decisions de producte tancades: noms canònics de secció, «mots
  comodí», slugs derivats del tipus, llegenda fora de la pàgina pública,
  el peu de la portada buida, ni la nota de privacitat duplicada.
- No canviïs `laxerrac.cat`.
- No posis cares ni il·lustracions genèriques: la marca és tipogràfica i
  fotogràfica.

---

## 7. Fitxers font (si cal verificar res)

| Tema | Fitxer |
|---|---|
| Tokens, animacions, prosa, impressió | `src/app/globals.css` |
| Famílies i colors base | `tailwind.config.ts` |
| Tipus i noms de secció | `src/types/index.ts` |
| Visor de la revista | `src/components/FanzineViewer.tsx` |
| Composició del número | `src/components/IssueView.tsx` |
| Capçal de secció | `src/components/SectionHeader.tsx` |
| Seccions | `src/components/sections/*.tsx` |
| Arxiu | `src/app/arxiu/page.tsx` |
| Portada / redirecció | `src/app/page.tsx` |

---

*Xerrac! — Revista d'aclariment cultural · `laxerrac.cat`*
