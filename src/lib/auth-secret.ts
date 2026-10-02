const DEV_SECRET = 'xerrac-secret-change-in-production'

export function authSecretIssue(secret: string | undefined = process.env.NEXTAUTH_SECRET): string | null {
  if (!secret) return 'NEXTAUTH_SECRET no està definit'
  if (secret === DEV_SECRET) return 'NEXTAUTH_SECRET és el valor feble per defecte'
  if (secret.length < 32) return 'NEXTAUTH_SECRET és massa curt (es recomanen 32 caràcters o més)'
  return null
}

export function isAuthSecretSecure(): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  return authSecretIssue() === null
}

export function authSecretWarning(): string | null {
  const issue = authSecretIssue()
  if (!issue) return null
  return `CRITICAL: ${issue}. Qualsevol podria falsificar una sessió d'admin. Genera un valor aleatori fort (per exemple "npx auth secret", que el desa a Vercel) i torna a desplegar.`
}
