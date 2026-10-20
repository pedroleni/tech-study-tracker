import { VERSION_REACT_EN_VIVO } from './constantes'
import CODIGO_MONTAJE from './runtime/montaje.js?raw'
import CODIGO_PUENTE from './runtime/puente.js?raw'

export type OpcionesDocumentoReact = {
  origen: string
  css: string
  modulos: Record<string, string>
  archivosCss: string[]
  strictMode: boolean
  conPruebas: boolean
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
}: OpcionesDocumentoReact): string {
  // En /vendor/: código de terceros empaquetado, que los escáneres de
  // seguridad del repo tratan como tal (igual que node_modules).
  const runtime = `${origen}/vendor/react-en-vivo/${VERSION_REACT_EN_VIVO}`
  // El código del alumno viaja dentro de este JSON: con < como < no
  // puede cerrar el <script> que lo contiene.
  const configuracion = JSON.stringify({ modulos, archivosCss, strictMode }).replace(
    /</g,
    '\\u003c',
  )
  const pruebas = conPruebas ? `\n    <script src="${runtime}/pruebas.js"></script>` : ''

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
    <div id="root"></div>
    <script>window.__configReactEnVivo = ${configuracion}</script>
    <script>${escaparScript(CODIGO_MONTAJE)}</script>
  </body>
</html>`
}
