import { SawIcon } from '@/components/SawIcon'

/**
 * Pàgina de càrrega dels números.
 *
 * Els quadrats (koma) d'una pàgina de manga que es componen: cada requadre
 * entra escalonat, com si la pàgina del número s'estigués maquetant sola.
 * La gramàtica és la mateixa que el visor: una portada gran i requadres
 * més petits per a les seccions.
 *
 * Viu aquí i no a `src/app/`, perquè un `loading.tsx` a l'arrel crea una
 * frontera de Suspense per damunt de la portada: el shell surt abans que
 * `permanentRedirect` es resolgui i Next no pot enviar el 308, sinó un 200
 * amb `<meta http-equiv="refresh">`. Aquest fitxer només ha de cobrir les
 * rutes que sí que renderitzen contingut.
 *
 * Cap número de volum: la pàgina de càrrega no sap quin número s'està
 * obrint, i posar-ne un de fix seria mentir.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 md:grid-rows-4 gap-1.5 p-1.5 min-h-[75vh]">
        {/* Portada: requadre gran */}
        <div className="koma-panel md:col-span-2 md:row-span-2 flex flex-col justify-between p-4 sm:p-6" style={{ animationDelay: '0s' }}>
          <div className="h-1 w-16 bg-gray-800" />
          <div>
            <div className="h-3 sm:h-4 w-3/4 bg-gray-800 mb-2.5" />
            <div className="h-3 sm:h-4 w-1/2 bg-gray-800/60 mb-4" />
            <div className="h-px w-10" style={{ background: 'var(--accent)' }} />
          </div>
        </div>

        {/* Secció */}
        <div className="koma-panel p-3 flex flex-col justify-end gap-2" style={{ animationDelay: '0.08s' }}>
          <div className="text-2xs tracking-[0.3em] uppercase font-mono text-gray-700 tabular-nums">02</div>
          <div className="h-2 w-2/3 bg-gray-800" />
        </div>

        {/* Secció */}
        <div className="koma-panel p-3 flex flex-col justify-end gap-2" style={{ animationDelay: '0.16s' }}>
          <div className="text-2xs tracking-[0.3em] uppercase font-mono text-gray-700 tabular-nums">03</div>
          <div className="h-2 w-1/2 bg-gray-800" />
        </div>

        {/* Secció */}
        <div className="koma-panel p-3 flex flex-col justify-end gap-2" style={{ animationDelay: '0.24s' }}>
          <div className="text-2xs tracking-[0.3em] uppercase font-mono text-gray-700 tabular-nums">04</div>
          <div className="h-2 w-3/4 bg-gray-800" />
          <div className="h-2 w-1/3 bg-gray-800/50" />
        </div>

        {/* Secció ample */}
        <div className="koma-panel md:col-span-2 p-3 sm:p-4 flex flex-col justify-end gap-2" style={{ animationDelay: '0.32s' }}>
          <div className="text-2xs tracking-[0.3em] uppercase font-mono text-gray-700 tabular-nums">05</div>
          <div className="h-2.5 w-1/3 bg-gray-800" />
          <div className="h-1.5 w-4/5 bg-gray-800/50" />
        </div>

        {/* Secció ample */}
        <div className="koma-panel md:col-span-2 p-3 sm:p-4 flex flex-col justify-end gap-2" style={{ animationDelay: '0.4s' }}>
          <div className="text-2xs tracking-[0.3em] uppercase font-mono text-gray-700 tabular-nums">06</div>
          <div className="h-2.5 w-1/4 bg-gray-800" />
          <div className="h-1.5 w-2/3 bg-gray-800/50" />
        </div>

        {/* Rengler final: el nom de la revista */}
        <div className="koma-panel md:col-span-4 flex items-center justify-center gap-3" style={{ animationDelay: '0.48s' }}>
          <SawIcon className="w-4 h-4" color="var(--accent)" />
          <span className="text-lg font-black tracking-tighter text-white leading-none">
            XERRAC<span style={{ color: 'var(--accent-text)' }}>!</span>
          </span>
        </div>
      </div>

      {/* Missatge */}
      <div className="text-center py-5 shrink-0">
        <p className="text-2xs text-gray-600 uppercase tracking-[0.25em]">
          Tallant la xerrameca
        </p>
      </div>
    </div>
  )
}
