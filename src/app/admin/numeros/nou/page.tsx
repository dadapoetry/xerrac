import { IssueForm } from '@/components/admin/IssueForm'

export default function NouNumeroPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Nou número</h1>
      <p className="text-gray-500 text-sm mb-8">Crea un nou número de Xerrac!</p>
      <IssueForm />
    </div>
  )
}
