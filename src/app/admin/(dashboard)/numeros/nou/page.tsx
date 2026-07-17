import { db } from '@/lib/db'
import { IssueForm } from '@/components/admin/IssueForm'

export default async function NouNumeroPage() {
  const result = await db.execute('SELECT COALESCE(MAX(number), 0) + 1 AS next FROM Issue')
  const nextNumber = Number(result.rows[0]?.next) || 1

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Nou número</h1>
      <p className="text-gray-500 text-sm mb-8">Crea un nou número de Xerrac!</p>
      <IssueForm nextNumber={nextNumber} />
    </div>
  )
}
