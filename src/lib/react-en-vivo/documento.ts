import { VERSION_REACT_EN_VIVO } from './constantes'
import CODIGO_ARBOL from './runtime/arbol.js?raw'
import CODIGO_MONTAJE from './runtime/montaje.js?raw'
import CODIGO_PUENTE from './runtime/puente.js?raw'
import CODIGO_RED from './runtime/red.js?raw'

export type OpcionesDocumentoReact = {
  origen: string
  css: string
  modulos: Record<string, string>
  archivosCss: string[]
  strictMode: boolean
  conPruebas: boolean
  // Árbol de renders (fase 2): solo en la vista previa visible, nunca en el
  // iframe de las comprobaciones.
  conArbol?: boolean
  api?: Record<string, unknown[]>
  red?: { latencia: number; desordenar: boolean }
}

// Un </script> o </style> dentro del código cerraría la etiqueta antes de tiempo.
function escaparScript(codigo: string) {
  return codigo.replace(/<\/script/gi, '<\\/script')
}

function escaparEstilo(css: string) {
  return css.replace(/<\/style/gi, '<\\/style')
}

export function construirDocumentoReact({
  origen,
  css,
  modulos,
  archivosCss,
  strictMode,
  conPruebas,
  conArbol = false,
  api,
  red,
}: OpcionesDocumentoReact): string {
  // En /vendor/: código de terceros empaquetado, que los escáneres de
  // seguridad del repo tratan como tal (igual que node_modules).
  const runtime = `${origen}/vendor/react-en-vivo/${VERSION_REACT_EN_VIVO}`
  // El código del alumno viaja dentro de este JSON: con < como < no
  // puede cerrar el <script> que lo contiene.
  const redDelDocumento = conPruebas
    ? { latencia: red?.latencia ?? 0, desordenar: false }
    : red ?? { latencia: 600, desordenar: false }
  const configuracion = JSON.stringify({
    modulos,
    archivosCss,
    strictMode,
    ...(api ? { api, red: redDelDocumento } : {}),
  }).replace(/</g, '\\u003c')
  const pruebas = conPruebas ? `\n    <script src="${runtime}/pruebas.js"></script>` : ''
  // Después de #root (observa sus cambios) y antes del montaje (ve el primer commit).
  const arbol = conArbol && !conPruebas ? `\n    <script>${escaparScript(CODIGO_ARBOL)}</script>` : ''
  // La API tiene que existir antes de evaluar App.jsx: un módulo puede llamar
  // a fetch en su nivel superior, antes incluso del primer render.
  const codigoRed = api ? `\n    <script>${escaparScript(CODIGO_RED)}</script>` : ''

  return `<!doctype html>
<html lang="es">
  <head>
    <base href="about:srcdoc" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${escaparEstilo(css)}</style>
    <script>${escaparScript(CODIGO_PUENTE)}</script>
    <script src="${runtime}/react.js"></script>${pruebas}
  </head>
  <body>
    <div id="root"></div>${arbol}
    <script>window.__configReactEnVivo = ${configuracion}</script>${codigoRed}
    <script>${escaparScript(CODIGO_MONTAJE)}</script>
  </body>
</html>`
}
