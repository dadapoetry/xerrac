import { getLatestIssue } from '@/lib/actions'
import { FanzineViewer } from '@/components/FanzineViewer'
import Link from 'next/link'

export default async function HomePage() {
  const issue = await getLatestIssue()

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">XERRAC!</h1>
          <p className="text-gray-500">Revista d&apos;aclariment cultural</p>
          <p className="text-gray-700 mt-8">Encara no hi ha números publicats.</p>
        </div>
      </div>
    )
  }

  const parsedIssue = {
    ...issue,
    sections: issue.sections.map((s) => ({
      ...s,
      content: JSON.parse(s.content),
    })),
  }

  return (
    <>
      <FanzineViewer issue={parsedIssue as any} />

      <footer className="border-t border-gray-800 py-8 px-4 no-print">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link
            href="/arxiu"
            className="text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-wider"
          >
            ↪ Arxiu
          </Link>
          <div className="flex gap-4 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-400 transition-colors">Instagram</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Twitter / X</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Bluesky</a>
          </div>
          <span className="text-xs text-gray-700">
            ISSN: 2938-2026 (en tràmit)
          </span>
        </div>
      </footer>
    </>
  )
}
