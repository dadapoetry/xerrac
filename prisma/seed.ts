import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashed = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@xerrac.cat' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@xerrac.cat',
      password: hashed,
    },
  })

  const issue1 = await prisma.issue.upsert({
    where: { number: 1 },
    update: {},
    create: {
      number: 1,
      title: 'Número 1 - El soroll del silenci',
      date: new Date('2026-06-01'),
      published: true,
    },
  })

  const sections = [
    {
      issueId: issue1.id,
      type: 'portada',
      order: 0,
      title: 'Xerrac!',
      content: JSON.stringify({
        subtitle: 'Revista d\'aclariment cultural',
        topic: 'El soroll del silenci',
      }),
      backgroundImage: '',
    },
    {
      issueId: issue1.id,
      type: 'editorial',
      order: 1,
      title: 'Editorial',
      content: JSON.stringify({
        body: '<p>Benvinguts al primer número de <strong>Xerrac!</strong>, una revista d\'aclariment cultural que vol ser eina i no ornament, serra i no martell.</p><p>Vivim temps de soroll. El silenci s\'ha convertit en un luxe, gairebé en una provocació. Aquest espai vol ser una escletxa, un lloc on aturar-se a pensar sense pressa, on la cultura no sigui un producte sinó un procés.</p><p>No venim a explicar el món. Venim a serrar-lo. A veure què passa quan les fibres cedeixen, quan la fusta cruixa i el polsim s\'escampa. Cada secció és una dent de la serra: esmolada, directa, incòmoda.</p><p>Que comenci el soroll.</p>',
      }),
      backgroundImage: '',
    },
    {
      issueId: issue1.id,
      type: 'expansio_critica',
      order: 2,
      title: 'Expansió Crítica',
      content: JSON.stringify({
        body: '<p>Secció dedicada a l\'aclariment cultural. Aquí desfem malentesos, desmuntem llocs comuns i intentem veure què hi ha darrere les paraules que fem servir cada dia.</p><p>En aquest número: <em>El concepte de "cultura popular" a l\'era de la reproducció digital</em>. Què vol dir avui "popular"? Què vol dir "cultura"? I per què hauríem de seguir fent-nos aquestes preguntes?</p>',
      }),
      backgroundImage: '',
    },
    {
      issueId: issue1.id,
      type: 'fadu_catala',
      order: 3,
      title: 'Fadu Català',
      content: JSON.stringify({
        entries: [
          {
            type: 'biography',
            title: 'Ernest Fàbregas i Vidal (1923-1999)',
            body: '<p>Fill d\'una família de fabricants de taps de suro de Cassà de la Selva, Ernest Fàbregas va ser inventor, poeta i desinventor professional. Va patentar el 1954 un dispositiu per fer dormir els gats que consistia en un metrònom submergit en llet tèbia. El 1963 va perdre la patent en no poder demostrar que els gats eren realment gats i no una al·lucinació col·lectiva.</p><p>La seva obra poètica completa (17.000 sonets, tots sobre el mateix tema: el número 23) va ser publicada pòstumament sota el títol <em>Vint-i-tres</em>. Ningú no la va llegir, però tothom en va parlar.</p>',
          },
          {
            type: 'ucronia',
            title: 'Ucronia: Si la megafonia del metro hagués parlat en català des de 1975',
            body: '<p>El 12 de març de 1975, un tècnic de megafonia de l\'estació de Diagonal, en un acte de rebel·lia silenciosa, canvia la cinta d\'anuncis per una gravació en català. Ningú no ho nota. Els usuaris segueixen ignorant els anuncis en qualsevol idioma. Però la cinta es reprodueix cada dia durant dotze anys, fins que el 1987 algú diu: "Escolta, això és en català, oi?" El tècnic, ja jubilat, somriu des de la seva casa a Calella.</p>',
          },
        ],
      }),
      backgroundImage: '',
    },
    {
      issueId: issue1.id,
      type: 'pagines_grogues',
      order: 4,
      title: 'Pàgines Groguess',
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
      issueId: issue1.id,
      type: 'calaix_sastre',
      order: 5,
      title: 'Calaix de Sastre',
      content: JSON.stringify({
        interviews: [
          {
            subject: 'Entrevista amb un llibreter de barri',
            body: '<p>Entrevistem a Joan, llibreter del carrer del Carme, que porta 40 anys venent llibres i escoltant històries. "El negoci va malament, però la gent segueix comprant llibres. El que ja no compra són llibres que no coneguin. Abans venia qualsevol cosa. Ara només venc el que puc recomanar."</p>',
          },
        ],
        reviews: [
          {
            title: 'Crítica: "El buit" de K. B. Rotella',
            body: '<p>Un llibre que parla del no-res durant 300 pàgines. La paradoxa és que ho fa molt bé. Rotella aconsegueix que el lector es pregunti si realment està llegint alguna cosa o si el llibre és un mirall que reflecteix els seus propis pensaments. Recomanat per a insomnes i filòsofs aficionats.</p>',
          },
        ],
      }),
      backgroundImage: '',
    },
    {
      issueId: issue1.id,
      type: 'visita',
      order: 6,
      title: 'Visita',
      content: JSON.stringify({
        source: 'Traduït de Georges Perec, "Espèces d\'espaces"',
        body: '<p>L\'espai comença així: un terra, unes parets, un sostre. Després hi ha les coses que hi posem a dins. I després hi ha el que passa entre les coses. L\'espai no és buit: és ple d\'absències. Cada objecte ocupa un lloc que abans era un no-lloc. I cada no-lloc espera un objecte que potser no arribarà mai.</p><p>Viure és ocupar espai. Escriure és intentar omplir-lo de sentit. O buidar-lo, segons com es miri.</p>',
      }),
      backgroundImage: '',
    },
    {
      issueId: issue1.id,
      type: 'full_mural',
      order: 7,
      title: 'Full Mural',
      content: JSON.stringify({
        collages: [
          { image: '', description: 'Collage enviat per M. R. a partir de retalls del Diari de Girona (1978) i una foto de carnet' },
          { image: '', description: 'Dibuix trobat a la contraportada d\'un llibre de text de l\'any 1983' },
        ],
      }),
      backgroundImage: '',
    },
    {
      issueId: issue1.id,
      type: 'ludita',
      order: 8,
      title: 'Ludita - Mots Encreuats',
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
    await prisma.section.upsert({
      where: { id: section.type + '_' + issue1.id },
      update: {},
      create: section,
    })
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
