import { CircleCheck, Keyboard, RotateCcw, TriangleAlert, Wand2 } from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'

import { CodigoResaltado, EditorCodigo } from '@/components/codigo'

/**
 * Variante V5: el laboratorio como BLOQUE INCRUSTADO.
 *
 * No es una pantalla, es un párrafo más: una celda autocontenida —código
 * editable arriba, resultado abajo— pensada para caer en medio de una columna
 * de lectura de unos 700 px y poder repetirse varias veces en la misma ficha
 * sin cansar. Todo el fichero es un único ejemplo de uso: la prosa que lo
 * rodea es la demostración de cómo queda en su contexto real.
 */

/** Lo que el navegador mete en el recorrido del tabulador sin que nadie se lo pida. */
const ENFOCABLES =
  'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'

const EJEMPLO_INICIAL = `<form>
  <label>
    Tu correo
    <input type="email" placeholder="tu@correo.com">
  </label>

  <!-- Parece un botón. No es un botón. -->
  <div class="boton" onclick="suscribir()">Suscribirme</div>

  <button class="secundario" type="button">Ahora no</button>
</form>`

const A_MANO = `<div class="boton"
     role="button"
     tabindex="0"
     onclick="suscribir()"
     onkeydown="if (event.key === 'Enter' || event.key === ' ') suscribir()">
  Suscribirme
</div>`

const CON_ETIQUETA = `<button class="boton" type="submit">Suscribirme</button>`

// El intercambio conserva el texto del botón y la clase, para que el aspecto
// dentro de la vista previa no cambie: lo único que cambia es la etiqueta.
const DIV_DISFRAZADO = /<div\s+class="boton"[^>]*>([\s\S]*?)<\/div>/i
const BOTON_REAL = /<button\s+class="boton"[^>]*>([\s\S]*?)<\/button>/i

type EstadoBoton = 'div' | 'boton' | 'perdido'

function estadoDelBoton(codigo: string): EstadoBoton {
  if (DIV_DISFRAZADO.test(codigo)) return 'div'
  if (BOTON_REAL.test(codigo)) return 'boton'
  return 'perdido'
}

function alternarBoton(codigo: string, estado: EstadoBoton): string {
  if (estado === 'div') {
    return codigo.replace(DIV_DISFRAZADO, '<button class="boton" type="submit">$1</button>')
  }
  if (estado === 'boton') {
    return codigo.replace(BOTON_REAL, '<div class="boton" onclick="suscribir()">$1</div>')
  }
  return EJEMPLO_INICIAL
}

// ---------------------------------------------------------------- análisis

type Control = { etiqueta: string; texto: string }

type Analisis = {
  recorrido: Control[]
  trampas: Control[]
}

function describir(elemento: Element): Control {
  return {
    etiqueta: elemento.tagName.toLowerCase(),
    texto:
      elemento.getAttribute('placeholder') ||
      elemento.textContent?.trim() ||
      elemento.getAttribute('aria-label') ||
      '(sin texto)',
  }
}

/** DOMParser es inerte por diseño: analiza el HTML sin ejecutar absolutamente nada. */
function analizar(html: string): Analisis {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  return {
    recorrido: [...doc.querySelectorAll(ENFOCABLES)].map(describir),
    // Se anuncia como pulsable pero el navegador no lo mete en el recorrido.
    trampas: [...doc.querySelectorAll('[onclick], [role="button"]')]
      .filter((elemento) => !elemento.matches(ENFOCABLES))
      .map(describir),
  }
}

// ---------------------------------------------------------------- vista previa

type Paleta = {
  fondo: string
  texto: string
  suave: string
  campo: string
  borde: string
  marca: string
  marcaTexto: string
  peligro: string
  peligroTexto: string
}

/**
 * La página de ejemplo tiene su propia paleta en color crudo —es contenido de
 * demostración dentro del iframe, no interfaz de la aplicación— pero sigue al
 * tema para no abrir un agujero blanco en mitad de un texto en modo oscuro.
 */
const PALETA_CLARA: Paleta = {
  fondo: '#ffffff',
  texto: '#1f2328',
  suave: '#5b6570',
  campo: '#ffffff',
  borde: '#d5d9e0',
  marca: '#1d4ed8',
  marcaTexto: '#ffffff',
  peligro: '#b42318',
  peligroTexto: '#ffffff',
}

const PALETA_OSCURA: Paleta = {
  fondo: '#17181c',
  texto: '#e7e8ea',
  suave: '#a1a5ad',
  campo: '#1f2126',
  borde: '#3a3d45',
  marca: '#7aa2ff',
  marcaTexto: '#10131a',
  peligro: '#ff9a8f',
  peligroTexto: '#2a0d0a',
}

function estilosBase(paleta: Paleta) {
  return `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0; padding: 18px 16px;
    font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
    background: ${paleta.fondo}; color: ${paleta.texto};
  }
  form { display: grid; gap: 12px; max-width: 250px; }
  label { display: grid; gap: 4px; font-size: 12px; color: ${paleta.suave}; }
  input {
    font: inherit; font-size: 13px; padding: 7px 9px;
    border: 1px solid ${paleta.borde}; border-radius: 6px;
    background: ${paleta.campo}; color: ${paleta.texto};
  }
  .boton {
    display: inline-block; text-align: center;
    font: inherit; font-size: 13px; font-weight: 600;
    padding: 8px 14px; border: 0; border-radius: 6px; cursor: pointer;
    background: ${paleta.marca}; color: ${paleta.marcaTexto};
  }
  .secundario {
    font: inherit; font-size: 13px; padding: 8px 14px;
    border: 1px solid ${paleta.borde}; border-radius: 6px; cursor: pointer;
    background: transparent; color: ${paleta.texto};
  }`
}

function capaRecorrido(paleta: Paleta) {
  const insignia = `
    position: absolute; top: -9px; left: -9px;
    min-width: 17px; height: 17px; border-radius: 999px;
    background: ${paleta.marca}; color: ${paleta.marcaTexto};
    font: 700 11px/17px system-ui; text-align: center;`

  return `
  body { counter-reset: orden; }
  ${ENFOCABLES} {
    counter-increment: orden;
    outline: 2px solid ${paleta.marca};
    outline-offset: 3px;
  }
  a[href], button, select, textarea { position: relative; }
  a[href]::after, button::after, select::after, textarea::after {
    content: counter(orden);${insignia}
  }
  /* Un <input> no admite pseudoelementos: el número lo pinta la etiqueta que lo
     envuelve, que en el árbol va después del contador que el propio input sube. */
  label:has(input:not([type="hidden"])) { position: relative; }
  label:has(input:not([type="hidden"]))::after {
    content: counter(orden);${insignia}
  }
  [onclick]:not(${ENFOCABLES}), [role="button"]:not(${ENFOCABLES}) {
    position: relative;
    outline: 2px dashed ${paleta.peligro};
    outline-offset: 3px;
  }
  [onclick]:not(${ENFOCABLES})::after, [role="button"]:not(${ENFOCABLES})::after {
    content: "el tabulador no llega";
    position: absolute; top: -9px; left: 50%; transform: translateX(-50%);
    white-space: nowrap; padding: 0 7px; border-radius: 999px;
    background: ${paleta.peligro}; color: ${paleta.peligroTexto};
    font: 700 10px/16px system-ui;
  }`
}

function construirDocumento(codigo: string, marcado: boolean, oscuro: boolean) {
  const paleta = oscuro ? PALETA_OSCURA : PALETA_CLARA

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="color-scheme" content="${oscuro ? 'dark' : 'light'}">
<style>${estilosBase(paleta)}${marcado ? capaRecorrido(paleta) : ''}</style>
</head>
<body>${codigo}</body>
</html>`
}

/** El tema vive en una clase del <html>; el iframe necesita enterarse de los cambios. */
function useModoOscuro() {
  const [oscuro, setOscuro] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const raiz = document.documentElement
    const sincronizar = () => setOscuro(raiz.classList.contains('dark'))

    sincronizar()
    const observador = new MutationObserver(sincronizar)
    observador.observe(raiz, { attributes: true, attributeFilter: ['class'] })
    return () => observador.disconnect()
  }, [])

  return oscuro
}

// ---------------------------------------------------------------- el bloque

const MARCO_BLOQUE = 'my-8 min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm'
const BARRA_BLOQUE = 'flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-muted/40 px-3 py-2'
const ETIQUETA_CAMPO = 'mb-1.5 text-xs font-medium text-muted-foreground'

function EtiquetaLenguaje({ lenguaje }: { lenguaje: string }) {
  return (
    <span className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
      {lenguaje}
    </span>
  )
}

function BloqueRecorrido() {
  const [codigo, setCodigo] = useState(EJEMPLO_INICIAL)
  const [marcarRecorrido, setMarcarRecorrido] = useState(true)
  const oscuro = useModoOscuro()
  const idTitulo = useId()

  const analisis = useMemo(() => analizar(codigo), [codigo])
  const estado = useMemo(() => estadoDelBoton(codigo), [codigo])

  // La línea del botón se resalta esté donde esté: sigue a quien edita.
  const lineaDelBoton = useMemo(() => {
    const indice = codigo.split('\n').findIndex((linea) => linea.includes('class="boton"'))
    return indice === -1 ? [] : [indice + 1]
  }, [codigo])

  const documento = useMemo(
    () => construirDocumento(codigo, marcarRecorrido, oscuro),
    [codigo, marcarRecorrido, oscuro]
  )

  const total = analisis.recorrido.length + analisis.trampas.length
  const hayTrampas = analisis.trampas.length > 0
  const veredicto =
    total === 0
      ? 'Este ejemplo no tiene ningún control'
      : `${analisis.recorrido.length} de ${total} ${total === 1 ? 'control' : 'controles'} al alcance del teclado`

  const accion =
    estado === 'div'
      ? { texto: 'Cambiarlo por un <button>', Icono: Wand2, principal: true }
      : estado === 'boton'
        ? { texto: 'Volver al <div>', Icono: RotateCcw, principal: false }
        : { texto: 'Restablecer el ejemplo', Icono: RotateCcw, principal: false }

  return (
    <section aria-labelledby={idTitulo} className={MARCO_BLOQUE}>
      <div className={BARRA_BLOQUE}>
        <div className="flex min-w-0 items-center gap-2">
          <EtiquetaLenguaje lenguaje="html" />
          <h2 id={idTitulo} className="truncate text-sm font-semibold">
            Formulario de suscripción
          </h2>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <label className="inline-flex min-h-11 cursor-pointer touch-manipulation items-center gap-1.5 text-xs whitespace-nowrap">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={marcarRecorrido}
              onChange={(evento) => setMarcarRecorrido(evento.target.checked)}
            />
            Marcar el recorrido
          </label>

          <button
            type="button"
            onClick={() => setCodigo(alternarBoton(codigo, estado))}
            className={`inline-flex min-h-11 touch-manipulation items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              accion.principal
                ? 'border-transparent bg-primary text-primary-foreground hover:opacity-90'
                : 'hover:bg-muted'
            }`}
          >
            <accion.Icono aria-hidden="true" className="size-3.5" />
            {accion.texto}
          </button>
        </div>
      </div>

      <div className="p-3">
        <p className={ETIQUETA_CAMPO}>Puedes editarlo</p>
        <EditorCodigo
          valor={codigo}
          alCambiar={setCodigo}
          etiqueta="HTML del formulario de suscripción, editable"
          lenguaje="html"
          numerarLineas
          lineasDestacadas={lineaDelBoton}
          className="h-72 sm:h-[15rem]"
        />

        <p className={`mt-3 ${ETIQUETA_CAMPO}`}>Resultado</p>
        <iframe
          className="block h-52 w-full max-w-full rounded-lg border bg-card sm:h-[11.5rem]"
          sandbox=""
          srcDoc={documento}
          title="Vista previa del formulario de suscripción"
        />

        <div className="mt-3 flex items-start gap-2">
          {hayTrampas ? (
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
          ) : (
            <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p
              aria-live="polite"
              className={`text-xs font-medium ${hayTrampas ? 'text-destructive' : ''}`}
            >
              {veredicto}
            </p>

            <ol className="mt-2 flex flex-wrap items-center gap-1.5">
              {analisis.recorrido.map((paso, indice) => (
                <li
                  key={`${paso.etiqueta}-${indice}`}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-muted px-2 py-1 text-xs"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                  >
                    {indice + 1}
                  </span>
                  <span className="truncate">{paso.texto}</span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    &lt;{paso.etiqueta}&gt;
                  </span>
                </li>
              ))}

              {analisis.trampas.map((trampa, indice) => (
                <li
                  key={`trampa-${indice}`}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-destructive/50 bg-destructive/10 px-2 py-1 text-xs"
                >
                  <TriangleAlert aria-hidden="true" className="size-3.5 shrink-0 text-destructive" />
                  <span className="truncate">{trampa.texto}</span>
                  <span className="shrink-0">se queda fuera</span>
                </li>
              ))}
            </ol>

            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Keyboard aria-hidden="true" className="size-3.5 shrink-0" />
              El orden es el de la tecla Tab, y sale del propio HTML: no lo decide el CSS.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function BloqueComparacion() {
  const idTitulo = useId()

  return (
    <section aria-labelledby={idTitulo} className={MARCO_BLOQUE}>
      <div className={BARRA_BLOQUE}>
        <EtiquetaLenguaje lenguaje="html" />
        <h2 id={idTitulo} className="truncate text-sm font-semibold">
          Lo mismo, escrito de dos maneras
        </h2>
      </div>

      <div className="p-3">
        <p className={ETIQUETA_CAMPO}>A mano, sobre un div: cinco cosas que recordar</p>
        <CodigoResaltado codigo={A_MANO} lenguaje="html" etiqueta="Botón reconstruido sobre un div" />

        <p className={`mt-3 ${ETIQUETA_CAMPO}`}>Con la etiqueta que ya existe</p>
        <CodigoResaltado
          codigo={CON_ETIQUETA}
          lenguaje="html"
          etiqueta="El mismo botón con la etiqueta button"
        />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- la ficha

export function LaboratorioV5Bloque() {
  return (
    <article className="mx-auto min-w-0 max-w-[44rem]">
      <p className="text-sm font-medium text-muted-foreground">HTML · Formularios</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">El botón que no era un botón</h1>

      <p className="mt-5 leading-7">
        Un <code className="font-mono text-[0.9em]">&lt;button&gt;</code> llega de fábrica con
        cosas que casi nadie se acuerda de escribir a mano: entra en el recorrido del tabulador, se
        activa con Enter y con la barra espaciadora, se anuncia como «botón» a un lector de pantalla
        y, dentro de un formulario, lo envía. Un{' '}
        <code className="font-mono text-[0.9em]">&lt;div&gt;</code> con un{' '}
        <code className="font-mono text-[0.9em]">onclick</code> no trae nada de eso: solo se parece.
      </p>

      <p className="mt-4 leading-7">
        Y el parecido es perfecto. Con las mismas quince líneas de CSS, un div y un button son
        idénticos píxel a píxel, así que la diferencia no aparece mirando la pantalla. Aparece al
        soltar el ratón.
      </p>

      <BloqueRecorrido />

      <p className="mt-4 leading-7">
        Fíjate en el orden. El botón secundario, «Ahora no», sí recibe el foco; el principal, no.
        Quien navegue con el teclado puede rechazar la suscripción pero no completarla, y nada en la
        pantalla lo avisa. Cambia la etiqueta y el número que faltaba aparece solo.
      </p>

      <p className="mt-4 leading-7">
        No hemos añadido <code className="font-mono text-[0.9em]">tabindex</code>, ni{' '}
        <code className="font-mono text-[0.9em]">role</code>, ni un manejador para la tecla Enter:
        eso ya estaba escrito dentro del navegador y solo había que pedirlo con la etiqueta correcta.
        Reconstruirlo a mano se puede, y es el mismo comportamiento con cuatro sitios más donde
        equivocarse.
      </p>

      <BloqueComparacion />

      <p className="mt-4 leading-7">
        La regla práctica cabe en una línea: si al pulsarlo pasa algo, es un{' '}
        <code className="font-mono text-[0.9em]">&lt;button&gt;</code>; si al pulsarlo se va a otro
        sitio, es un <code className="font-mono text-[0.9em]">&lt;a href&gt;</code>. El div se queda
        para lo que siempre fue: colocar cajas.
      </p>
    </article>
  )
}
