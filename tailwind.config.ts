import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'Courier New', 'monospace'],
        serif: ['var(--font-serif)', 'Georgia', 'Times New Roman', 'serif'],
      },
      // Una sola escala tipogràfica de 8 passos: 11 · 12 · 14 · 17 · 20 · 30 · 48 · 72.
      // Els graons que Tailwind ja portava de sèrie es queden amb el seu nom
      // (xs 12, sm 14, xl 20, 3xl 30, 5xl 48, 7xl 72); aquí només s'hi afegeixen
      // els dos que faltaven i la xifra de secció, que és un clamp perquè la
      // mida no depengui d'un viewport exacte.
      // Així una classe absent no pot escurçar res per accident: si algú se
      // n'oblida una, es queda amb la mida de Tailwind, no amb una d'inventada.
      fontSize: {
        '2xs': '0.6875rem',   // 11 px — etiquetes mono en majúscules (abans 8/9/10/11)
        md: '1.0625rem',      // 17 px — cos editorial (abans 16)
        'section-num': 'clamp(140px, 16vw, 220px)', // xifra de secció
        masthead: 'clamp(3.5rem, 8.5vw, 5rem)',     // capçalera XERRAC: 56 → 80 px
      },
      colors: {
        xerrac: {
          black: '#0a0a0a',
          white: '#f5f5f5',
          red: '#dc2626',
          yellow: '#eab308',
          gray: '#a3a3a3',
          darkgray: '#262626',
        },
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(0,0,0,1)',
        'brutal-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease-out',
        'slide-right': 'slide-right 0.2s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
}
export default config
