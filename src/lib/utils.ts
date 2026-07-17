export function safeParse(str: string, fallback: any = {}) {
  try { return JSON.parse(str) } catch { return fallback }
}

export function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
