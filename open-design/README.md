# `open-design/` — Recursos per a OpenDesign

Aquesta carpeta no forma part de l'aplicació Next.js: és material perquè
**OpenDesign** entengui el disseny de Xerrac i no proposi coses allunyades.

## `xerrac/` — paquet de sistema de disseny

És un paquet portable en el format d'OpenDesign
(`od-design-system-project/v1`):

```
xerrac/
├── manifest.json   ← metadades de descobriment
├── DESIGN.md       ← la prosa de disseny (contracte de marca i composició)
└── tokens.css      ← els tokens semàntics (mirall de src/app/globals.css)
```

`DESIGN.md` és una **còpia** de `../../DESIGN.md` (l'arrel del repo), que és la
font de la veritat. Si canvies el contracte, actualitza tots dos.

## Com instal·lar-lo a OpenDesign

Amb el daemon d'OpenDesign en marxa:

```bash
# Des del repo
od design-systems import-local open-design/xerrac

# Comprova que hi és
od design-systems list
```

Si `od` no és al PATH, es pot cridar el CLI del daemon directament:

```bash
"/c/Program Files/nodejs/node" \
  "$LOCALAPPDATA/Programs/Open Design/resources/app/prebundled/daemon/daemon-cli.mjs" \
  design-systems import-local open-design/xerrac
```

Després, a l'app: **Design System → refresca** i tria **Xerrac!**.
