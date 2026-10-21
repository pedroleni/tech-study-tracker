// Worker del compilador de React (babel-plugin-react-compiler sobre
// @babel/standalone). Recibe { id, tipo: 'compilar', codigo, typescript } y
// responde { id, ok, codigo, eventos } o { id, ok: false, error }.
import { transform } from '@babel/standalone'
import compilador from 'babel-plugin-react-compiler'

// Nombre de la función que empieza en esa línea (el logger del compilador
// solo da el nombre en los éxitos; en los errores, la posición).
const nombreEnLinea = (codigo, linea) => {
  const texto = codigo.split('\n')[linea - 1] || ''
  const m = /function\s+([A-Za-z_$][\w$]*)|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/.exec(texto)
  return m ? m[1] || m[2] : null
}

const resumirEvento = (evento, codigo) => {
  const linea = evento.fnLoc?.start?.line ?? null
  const componente = evento.fnName || (linea ? nombreEnLinea(codigo, linea) : null)
  if (evento.kind === 'CompileSuccess') return { componente, estado: 'compilado', linea }
  if (evento.kind === 'CompileError' || evento.kind === 'CompileDiagnostic') {
    const opciones = evento.detail?.options ?? evento.detail ?? {}
    const motivo = [opciones.reason, opciones.description].filter(Boolean).join(' ')
    return { componente, estado: 'error', linea, motivo: String(motivo).slice(0, 600) }
  }
  if (evento.kind === 'CompileSkip') return { componente, estado: 'omitido', linea, motivo: String(evento.reason ?? '').slice(0, 600) }
  if (evento.kind === 'PipelineError') return { componente, estado: 'error', linea, motivo: String(evento.data ?? '').slice(0, 600) }
  return null
}

self.onmessage = (mensaje) => {
  const { id, tipo, codigo, typescript } = mensaje.data || {}
  if (tipo !== 'compilar' || typeof codigo !== 'string') return
  const eventos = []
  try {
    const resultado = transform(codigo, {
      filename: typescript ? 'App.tsx' : 'App.jsx',
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
    self.postMessage({
      id,
      ok: true,
      codigo: resultado.code,
      eventos: eventos.map((e) => resumirEvento(e, codigo)).filter(Boolean),
    })
  } catch (error) {
    self.postMessage({ id, ok: false, error: String(error?.message ?? error).slice(0, 2000) })
  }
}
