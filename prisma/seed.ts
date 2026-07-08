import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'

async function main() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'
  const authToken = process.env.TURSO_AUTH_TOKEN

  const db = createClient({ url, ...(authToken ? { authToken } : {}) })

  const hashed = await bcrypt.hash('Xerrac!2026-admin', 12)

  const existingUser = await db.execute({
    sql: 'SELECT id FROM User WHERE email = ?',
    args: ['admin@xerrac.cat'],
  })

  if (existingUser.rows.length === 0) {
    await db.execute({
      sql: 'INSERT INTO User (id, name, email, password) VALUES (?, ?, ?, ?)',
      args: [uuid(), 'Admin', 'admin@xerrac.cat', hashed],
    })
  }

  const existingIssue = await db.execute({
    sql: 'SELECT id FROM Issue WHERE number = ?',
    args: [1],
  })

  let issueId: string

  if (existingIssue.rows.length === 0) {
    issueId = uuid()
    await db.execute({
      sql: 'INSERT INTO Issue (id, number, title, date, published) VALUES (?, ?, ?, ?, ?)',
      args: [issueId, 1, 'Número 1 - El soroll del silenci', '2026-06-01', 1],
    })
  } else {
    issueId = existingIssue.rows[0].id as string
  }

  const existingSections = await db.execute({
    sql: 'SELECT id FROM Section WHERE issueId = ?',
    args: [issueId],
  })

  if (existingSections.rows.length > 0) {
    console.log('Seed already applied, skipping sections.')
    db.close()
    return
  }

  const sections = [
    {
      id: uuid(), issueId, type: 'portada', order: 0,
      title: 'Xerrac!',
      content: JSON.stringify({ subtitle: 'Revista d\'aclariment cultural', topic: 'El soroll del silenci' }),
      backgroundImage: '',
    },
    {
      id: uuid(), issueId, type: 'editorial', order: 1,
      title: 'Editorial',
      content: JSON.stringify({
        body: '<p>Benvinguts al primer número de <strong>Xerrac!</strong>, una revista d\'aclariment cultural que vol ser eina i no ornament, serra i no martell.</p><p>Vivim temps de soroll. El silenci s\'ha convertit en un luxe, gairebé en una provocació. Aquest espai vol ser una escletxa, un lloc on aturar-se a pensar sense pressa, on la cultura no sigui un producte sinó un procés.</p><p>No venim a explicar el món. Venim a serrar-lo. A veure què passa quan les fibres cedeixen, quan la fusta cruixa i el polsim s\'escampa. Cada secció és una dent de la serra: esmolada, directa, incòmoda.</p><p>Que comenci el soroll.</p>',
      }),
      backgroundImage: '',
    },
    {
      id: uuid(), issueId, type: 'aclariment_cultural', order: 2,
      title: 'Aclariment cultural',
      content: JSON.stringify({
        body: '<p>Secció dedicada a l\'aclariment cultural. Aquí desfem malentesos, desmuntem llocs comuns i intentem veure què hi ha darrere les paraules que fem servir cada dia.</p><p>En aquest número: <em>El concepte de "cultura popular" a l\'era de la reproducció digital</em>. Què vol dir avui "popular"? Què vol dir "cultura"? I per què hauríem de seguir fent-nos aquestes preguntes?</p>',
      }),
      backgroundImage: '',
    },
    {
      id: uuid(), issueId, type: 'fadu_catala', order: 3,
      title: 'Fadu Català',
      content: JSON.stringify({
        entries: [
          { type: 'biography', title: 'Ernest Fàbregas i Vidal (1923-1999)', body: '<p>Fill d\'una família de fabricants de taps de suro de Cassà de la Selva, Ernest Fàbregas va ser inventor, poeta i desinventor professional. Va patentar el 1954 un dispositiu per fer dormir els gats que consistia en un metrònom submergit en llet tèbia.</p>' },
          { type: 'ucronia', title: 'Ucronia: Si la megafonia del metro hagués parlat en català des de 1975', body: '<p>El 12 de març de 1975, un tècnic de megafonia canvia la cinta d\'anuncis per una gravació en català. Ningú no ho nota. Però la cinta es reprodueix cada dia durant dotze anys.</p>' },
        ],
      }),
      backgroundImage: '',
    },
    {
      id: uuid(), issueId, type: 'pagines_grogues', order: 4,
      title: 'Pàgines Grogues',
      content: JSON.stringify({
        proverbs: [
          { text: 'La cultura és com la xocolata: millor si és negra i amarga.', author: 'Inspirat en Cioran' },
          { text: 'L\'avantguarda és el que fas mentre esperes que arribi el下一秒.', author: 'Llegint Vila-Matas' },
          { text: 'No hi ha pitjor sord que el que no vol pagar el lloguer.', author: 'Adaptat de Perec' },
          { text: 'Els clàssics són aquells llibres que tothom cita i ningú llegeix.', author: 'Remix de Mark Twain' },
          { text: 'La ironia és la cortesia de la desesperació.', author: 'Deixat caure per Deleuze' },
        ],
      }),
      backgroundImage: '',
    },
    {
      id: uuid(), issueId, type: 'calaix_sastre', order: 5,
      title: 'Calaix de Sastre',
      content: JSON.stringify({
        interviews: [{ subject: 'Entrevista amb un llibreter de barri', body: '<p>Entrevistem a Joan, llibreter del carrer del Carme, que porta 40 anys venent llibres.</p>' }],
        reviews: [{ title: 'Crítica: "El buit" de K. B. Rotella', body: '<p>Un llibre que parla del no-res durant 300 pàgines. Recomanat per a insomnes i filòsofs aficionats.</p>' }],
      }),
      backgroundImage: '',
    },
    {
      id: uuid(), issueId, type: 'visita', order: 6,
      title: 'Visita',
      content: JSON.stringify({
        source: 'Traduït de Georges Perec, "Espèces d\'espaces"',
        body: '<p>L\'espai comença així: un terra, unes parets, un sostre. Després hi ha les coses que hi posem a dins.</p>',
      }),
      backgroundImage: '',
    },
    {
      id: uuid(), issueId, type: 'full_mural', order: 7,
      title: 'Full Mural',
      content: JSON.stringify({
        collages: [
          { image: '', description: 'Collage enviat per M. R. a partir de retalls del Diari de Girona (1978)' },
          { image: '', description: 'Dibuix trobat a la contraportada d\'un llibre de text de l\'any 1983' },
        ],
      }),
      backgroundImage: '',
    },
    {
      id: uuid(), issueId, type: 'ludita', order: 8,
      title: 'Ludita',
      content: JSON.stringify({
        crossword: {
          gridSize: 11,
          clues: {
            across: {
              1: { clue: 'Moviment que rebutja les màquines (5)', answer: 'LUDITA', row: 0, col: 0 },
              6: { clue: 'Filosofia de la sospita (9)', answer: 'NIETZSCHE', row: 2, col: 0 },
              7: { clue: 'Instrument de tall (5)', answer: 'SERRA', row: 3, col: 0 },
              8: { clue: 'Concepte clau de la teoria crítica (11)', answer: 'HEGEMONIA', row: 5, col: 0 },
              9: { clue: 'Gènere literari no normatiu (7)', answer: 'UCRONIA', row: 7, col: 0 },
              10: { clue: 'Art de l\'engany filosòfic (7)', answer: 'IRONIA', row: 9, col: 0 },
            },
            down: {
              1: { clue: 'Nou ordre cultural (5)', answer: 'HUMOR', row: 0, col: 0 },
              2: { clue: 'Borgès el va inventar (9)', answer: 'LABERINT', row: 0, col: 2 },
              3: { clue: 'Capital de l\'esperit (5)', answer: 'ATENES', row: 0, col: 4 },
              4: { clue: 'Categoria estètica (11)', answer: 'SURREALIS', row: 0, col: 6 },
              5: { clue: 'Eina del xerracaire (7)', answer: 'SERRALL', row: 0, col: 8 },
            },
          },
        },
      }),
      backgroundImage: '',
    },
  ]

  for (const section of sections) {
    await db.execute({
      sql: 'INSERT INTO Section (id, issueId, type, "order", title, content, backgroundImage) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [section.id, section.issueId, section.type, section.order, section.title, section.content, section.backgroundImage],
    })
  }

  // Default settings
  const defaultSettings: { key: string; value: string }[] = [
    { key: 'footer_copyright', value: '© 2025 Xerrac!' },
    { key: 'footer_issn', value: 'ISSN 2938-2026 (en tràmit)' },
    { key: 'footer_social_links', value: JSON.stringify([
      { name: 'Instagram', url: 'https://instagram.com/xerrac' },
      { name: 'Twitter / X', url: 'https://x.com/xerrac' },
      { name: 'Bluesky', url: 'https://bsky.app/profile/xerrac.bsky.social' },
    ]) },
  ]

  for (const s of defaultSettings) {
    const existing = await db.execute({
      sql: 'SELECT key FROM Settings WHERE key = ?',
      args: [s.key],
    })
    if (existing.rows.length === 0) {
      await db.execute({
        sql: 'INSERT INTO Settings (key, value) VALUES (?, ?)',
        args: [s.key, s.value],
      })
    }
  }

  console.log('Seed completed!')
  db.close()
}

main().catch(console.error)
