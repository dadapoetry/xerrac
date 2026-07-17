import { createClient } from '@libsql/client'
import path from 'path'

async function main() {
  const db = createClient({ url: 'file:./dev.db' })

  const issueResult = await db.execute('SELECT * FROM Issue WHERE number = 1')
  const rawIssue = issueResult.rows[0]
  if (!rawIssue) { console.log('No issue found'); return }

  console.log('Issue:', rawIssue.title)

  const sectionsResult = await db.execute({
    sql: 'SELECT * FROM Section WHERE issueId = ? ORDER BY "order" ASC',
    args: [rawIssue.id],
  })

  const sections = sectionsResult.rows
  let totalContentSize = 0

  for (const s of sections) {
    const cSize = s.content.length
    totalContentSize += cSize
    const hasBase64 = s.content.includes('base64') || s.content.includes('data:image')
    const hasImgTag = s.content.includes('<img')
    const hasDataURI = s.content.includes('data:')

    console.log('---')
    console.log(s.type, `"${s.title}":`)
    console.log('  content:', (cSize / 1024).toFixed(1), 'KB')
    if (hasBase64) console.log('  ⚠️  CONTAINS base64')
    if (hasImgTag) console.log('  ⚠️  CONTAINS <img>')
    if (hasDataURI) console.log('  ⚠️  CONTAINS data: URI')

    if (s.backgroundImage) {
      console.log('  bgImage:', s.backgroundImage)
    }

    try {
      const content = JSON.parse(s.content)
      if (content.body && content.body.length > 0) {
        console.log('  body:', (content.body.length / 1024).toFixed(1), 'KB')
        const imgCount = (content.body.match(/<img/g) || []).length
        if (imgCount > 0) console.log('  ⚠️', imgCount, '<img> tags in body')
      }
      if (content.collages) {
        const images = content.collages.filter((c: any) => c.image)
        console.log('  collages:', content.collages.length, 'total,', images.length, 'with images')
        for (const c of images) {
          const url = c.image
          console.log('    image:', url.substring(0, 120), url.length > 120 ? '...' : '')
        }
      }
      if (content.interviews) {
        for (const iv of content.interviews) {
          if (iv.body && iv.body.includes('data:')) console.log('  ⚠️ interview body has data URI')
        }
      }
      if (content.reviews) {
        for (const rv of content.reviews) {
          if (rv.body && rv.body.includes('data:')) console.log('  ⚠️ review body has data URI')
        }
      }
    } catch (e: any) {
      console.log('  parse error:', e.message)
    }
  }

  console.log('\nTotal content:', (totalContentSize / 1024 / 1024).toFixed(2), 'MB')
  db.close()
}

main()
