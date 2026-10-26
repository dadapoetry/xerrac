import { redirect } from 'next/navigation'

export default async function SeccionsPage({ params }: { params: Promise<{ issueId: string }> }) {
  const { issueId } = await params
  redirect(`/admin/numeros/${issueId}`)
}
