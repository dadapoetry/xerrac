# Configuració completa de laxerrac.cat

## Ordre d'operacions

### 1. Registrar el domini a SW Hosting

- Compra `laxerrac.cat` a SW Hosting (o transfereix-lo si ja el tens).
- No configuris res més. No toquis DNS. No toquis res.
- Només necessites que el domini existeixi i sigui teu.

### 2. Crear compte a Cloudflare i afegir el domini

- Ves a https://dash.cloudflare.com
- Afegeix `laxerrac.cat`
- Cloudflare escanejarà els registres DNS actuals. No cal que importis res.
- Et donarà **dos nameservers** (ex: `maisie.ns.cloudflare.com` i `pete.ns.cloudflare.com`).

### 3. Canviar nameservers a SW Hosting

- Ves al panell de SW Hosting → Gestió de dominis → `laxerrac.cat` → Nameservers.
- Substitueix els actuals pels dos de Cloudflare.
- Pot trigar **fins a 48h** en propagar-se, però normalment són unes hores.

### 4. Configurar DNS a Cloudflare

Un cop propagat, a Cloudflare → DNS → Records, afegeix:

| Tipus | Nom | Valor | Proxy |
|-------|-----|-------|-------|
| A | `@` | `76.76.21.21` (IP de Vercel) | Proxy (taronja) |
| AAAA | `@` | `2a06:98c1:3121::` (IP Vercel IPv6) | Proxy (taronja) |
| CNAME | `www` | `cname.vercel-dns.com` | Proxy (taronja) |

**Nota:** Quan el domini estigui connectat a Vercel (pas 6), ell et dirà exactament quins registres posar. Pots saltar aquest pas i posar directament els que Vercel et doni.

### 5. Configurar Email Routing (Cloudflare)

- A Cloudflare → Email → Email Routing (gratis).
- **Habilita'l** (botó "Get started").
- A **Routing rules** → Catch-all:
  - Action: `Send to email`
  - Destination: el teu correu personal (Gmail, proton, etc.)
- A **Email addresses** → afegeix:
  - `contacte@laxerrac.cat` → el teu correu personal
  - (opcional) `admin@laxerrac.cat` → el teu correu personal
- Cloudflare crearà automàticament els registres MX necessaris.

Ara qualsevol correu a `*@laxerrac.cat` et vindrà al teu Gmail. Pots respondre des del Gmail configurant "Send mail as" amb l'adreça de laxerrac.

### 6. Connectar domini a Vercel

- Ves a Vercel → Projecte Xerrac! → Settings → Domains.
- Afegeix `laxerrac.cat`.
- Vercel et mostrarà quins registres DNS cal posar a Cloudflare.
- Ves a Cloudflare → DNS i afegeix (o actualitza) els registres que Vercel indica.
- Espera que Vercel verifiqui (normalment 1-2 minuts).
- Repeteix per `www.laxerrac.cat` (redirecció a `laxerrac.cat`).

### 7. Actualitzar variables d'entorn a Vercel

- Ves a Vercel → Projecte → Settings → Environment Variables.
- Afegeix/actualitza:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_URL` | `https://laxerrac.cat` |
| `NEXTAUTH_URL` | `https://laxerrac.cat` |
| `NEXTAUTH_SECRET` | Genera un amb: `openssl rand -base64 32` |
| `TURSO_DATABASE_URL` | (la que ja tens) |
| `TURSO_AUTH_TOKEN` | (el que ja tens) |
| `RESEND_API_KEY` | (el que ja tens) |
| `NEWSLETTER_FROM` | `Xerrac! <contacte@laxerrac.cat>` |

### 8. Configurar SSL a Cloudflare

- A Cloudflare → SSL/TLS → Overview:
  - **Full (strict)** — el més segur. Vercel ja té certificat.
- A Cloudflare → SSL/TLS → Edge Certificates:
  - **Always Use HTTPS**: ON
  - **Automatic HTTPS Rewrites**: ON

### 9. Configurar Vercel per producció

- A Vercel → Projecte → Settings → Git → Production Branch: `main`.
- Fes un push a `main` per fer un deploy.
- Verifica que `https://laxerrac.cat` funcioni.

### 10. Actualitzar Instagram

- Bio: `Ha quedat clar? 👇 laxerrac.cat`
- Verifica que l'enllaç funcioni.

## Resum de serveis i costos

| Servei | Què fa | Cost |
|--------|--------|------|
| SW Hosting | Registrador del domini `.cat` | ~15€/any |
| Cloudflare | DNS + Email Routing + CDN | Gratis |
| Vercel | Hosting del web | Gratis (fins a cert límit) |
| Turso | Base de dades | Gratis (fins a cert límit) |
| Resend | Newsletters | Gratis (fins a cert límit) |
| GitHub | Codi font | Gratis |

**Total: ~15€/any** (només el domini).
