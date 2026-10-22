// Worker del compilador de React (babel-plugin-react-compiler sobre
// @babel/standalone). Recibe { id, tipo: 'compilar', codigo, typescript?,
// nombre? } y responde { id, ok, codigo, eventos } o { id, ok: false, error }.
// Los límites de tamaño son los del esquema de la página (cliente.ts): si se
// superan, la página descartaría la respuesta entera, así que se recortan aquí.
import { transform } from '@babel/standalone'
import compilador from 'babel-plugin-react-compiler'

const MAX_EVENTOS = 200
const MAX_NOMBRE = 200
const MAX_MOTIVO = 600

const limitar = (texto, maximo) => (texto == null ? texto : String(texto).slice(0, maximo))

// Nombre de la función que empieza en esa línea (el logger del compilador
// solo da el nombre en los éxitos; en los errores, la posición).
const nombreEnLinea = (codigo, linea) => {
  const texto = codigo.split('\n')[linea - 1] || ''
  const m = /function\s+([A-Za-z_$][\w$]*)|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/.exec(texto)
  return m ? m[1] || m[2] : null
}

// reason y description suelen ser dos frases: se unen con un punto.
const unirMotivo = (...partes) =>
  partes
    .filter((parte) => typeof parte === 'string' && parte.trim())
    .map((parte) => parte.trim().replace(/[.\s]+$/, ''))
    .join('. ')

const resumirEvento = (evento, codigo) => {
  const linea = evento.fnLoc?.start?.line ?? null
  const componente = limitar(evento.fnName || (linea ? nombreEnLinea(codigo, linea) : null), MAX_NOMBRE)
  if (evento.kind === 'CompileSuccess') return { componente, estado: 'compilado', linea }
  if (evento.kind === 'CompileError' || evento.kind === 'CompileDiagnostic') {
    const opciones = evento.detail?.options ?? evento.detail ?? {}
    return { componente, estado: 'error', linea, motivo: limitar(unirMotivo(opciones.reason, opciones.description), MAX_MOTIVO) }
  }
  if (evento.kind === 'CompileSkip') {
    // Con una directiva de exclusión, reason trae el objeto de la directiva
    // («[object Object]» si se convierte a texto): se nombra la directiva.
    const directiva = evento.loc && typeof evento.reason === 'string' && /directive/i.test(evento.reason)
      ? 'Excluido con la directiva "use no memo"'
      : typeof evento.reason === 'string' ? evento.reason : 'Excluido del compilador'
    return { componente, estado: 'omitido', linea, motivo: limitar(directiva.replace("'[object Object]'", '"use no memo"'), MAX_MOTIVO) }
  }
  if (evento.kind === 'PipelineError') return { componente, estado: 'error', linea, motivo: limitar(String(evento.data ?? ''), MAX_MOTIVO) }
  return null
}

// Un error repetido en el mismo componente (varias lecturas de una ref, por
// ejemplo) se enseña una sola vez.
const sinRepetidos = (eventos) => {
  const vistos = new Set()
  return eventos.filter((evento) => {
    const clave = [evento.componente, evento.estado, evento.motivo].join('|')
    if (vistos.has(clave)) return false
    vistos.add(clave)
    return true
  })
}

// 'use no memo' al principio del archivo: el compilador avisa de éxito en
// cada función pero no transforma nada. Se dice tal cual.
const excluidoEnElArchivo = (codigo) => /^\s*(?:\/\/[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)*['"]use no memo['"]/.test(codigo)

self.onmessage = (mensaje) => {
  const { id, tipo, codigo, typescript, nombre } = mensaje.data || {}
  if (tipo !== 'compilar' || typeof codigo !== 'string') return
  const eventos = []
  const archivo = typeof nombre === 'string' && /^[A-Za-z][A-Za-z0-9-]*\.(jsx|tsx)$/.test(nombre)
    ? nombre
    : typescript ? 'App.tsx' : 'App.jsx'
  try {
    const resultado = transform(codigo, {
      filename: archivo,
      parserOpts: { plugins: typescript ? ['jsx', 'typescript'] : ['jsx'] },
      plugins: [
        [
          compilador,
          {
            target: '19',
            // Comprobación de React Native: llama a require.resolve, que no
            // existe en el navegador.
            enableReanimatedCheck: false,
            panicThreshold: 'none',
            logger: { logEvent: (_archivo, evento) => eventos.push(evento) },
          },
        ],
      ],
    })
    let resumen = sinRepetidos(eventos.map((e) => resumirEvento(e, codigo)).filter(Boolean))
    if (excluidoEnElArchivo(codigo) && !/react\/compiler-runtime/.test(resultado.code)) {
      resumen = resumen.map((evento) =>
        evento.estado === 'compilado'
          ? { ...evento, estado: 'omitido', motivo: 'Excluido: el archivo empieza con la directiva "use no memo"' }
          : evento,
      )
    }
    self.postMessage({ id, ok: true, codigo: resultado.code, eventos: resumen.slice(0, MAX_EVENTOS) })
  } catch (error) {
    self.postMessage({ id, ok: false, error: String(error?.message ?? error).slice(0, 2000) })
  }
}
