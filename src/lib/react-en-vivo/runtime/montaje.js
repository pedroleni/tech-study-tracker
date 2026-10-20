// Monta el código del alumno dentro del iframe aislado de react-en-vivo:
// registro de módulos tipo CommonJS, montaje con createRoot y ejecutor de
// comprobaciones. Lee la configuración que deja la lección en
// window.__configReactEnVivo = { modulos, archivosCss, strictMode, api?, red? }.
// Se incrusta en el srcdoc como texto (documento.ts lo importa con ?raw).
// Ver specs/features/react-en-vivo.md.
;(() => {
  const R = window.__reactEnVivo
  const enviar = window.__enviarReactEnVivo
  const { modulos, archivosCss, strictMode } = window.__configReactEnVivo

  // Si react.js no llegó (red caída, versión retirada), se dice, y las
  // comprobaciones contestan en vez de dejar al comprobador esperando.
  if (!R) {
    const motivo = 'No se pudo cargar React en la vista previa. Recarga la página para intentarlo de nuevo.'
    enviar({ tipo: 'error-render', texto: motivo })
    window.__comprobarReactEnVivo = async (comprobaciones) =>
      comprobaciones.map((comprobacion) => ({ descripcion: comprobacion.descripcion, ok: false, motivo }))
    window.addEventListener('message', async (evento) => {
      if (evento.source !== window.parent) return
      const datos = evento.data
      if (!datos || datos.canal !== 'react-en-vivo' || datos.tipo !== 'comprobar') return
      if (!Array.isArray(datos.comprobaciones)) return
      enviar({ tipo: 'resultado-comprobaciones', resultados: await window.__comprobarReactEnVivo(datos.comprobaciones) })
    })
    enviar({ tipo: 'montado', version: 'sin React' })
    return
  }
  // new Function añade dos líneas antes del código de cada módulo.
  const DESFASE_LINEAS = 2
  const ESPERA_MS = 1500
  const EXTERNOS = {
    react: R.React,
    'react-dom': R.ReactDOM,
    'react-dom/client': R.ReactDOMClient,
    'react/jsx-runtime': R.JsxRuntime,
    'react/jsx-dev-runtime': R.JsxDevRuntime,
  }
  // hasOwnProperty y no `in`: un import de "constructor" no debe encontrar
  // nada en el prototipo de Object.
  const tiene = (objeto, clave) => Object.prototype.hasOwnProperty.call(objeto, clave)

  let cache = Object.create(null)
  let raiz = null
  let ultimoError = null

  const resolver = (peticion) => {
    if (tiene(EXTERNOS, peticion)) return peticion
    if (!peticion.startsWith('./')) {
      throw new Error(
        'En este editor solo se puede importar React y tus propios archivos: «' +
          peticion +
          '» no está disponible.',
      )
    }
    if (peticion.endsWith('.css')) {
      if (archivosCss.includes(peticion)) return peticion
    } else {
      for (const candidata of [peticion, peticion + '.jsx']) {
        if (tiene(modulos, candidata)) return candidata
      }
    }
    throw new Error('No encuentro el archivo «' + peticion + '»')
  }

  const requerir = (ruta) => {
    if (tiene(EXTERNOS, ruta)) return EXTERNOS[ruta]
    if (ruta.endsWith('.css')) return {}
    if (ruta in cache) return cache[ruta].exports
    const modulo = { exports: {} }
    cache[ruta] = modulo
    const fabrica = new Function(
      'require',
      'module',
      'exports',
      modulos[ruta] + '\n//# sourceURL=' + ruta.slice(2),
    )
    fabrica((peticion) => requerir(resolver(peticion)), modulo, modulo.exports)
    return modulo.exports
  }

  const ubicar = (error) => {
    const texto = String(error && error.message !== undefined ? error.message : error).slice(0, 2000)
    const coincidencia = /([A-Za-z][A-Za-z0-9-]*\.jsx):(\d+):\d+/.exec(String((error && error.stack) || ''))
    if (!coincidencia) return { texto }
    return {
      texto,
      archivo: coincidencia[1],
      linea: Math.max(1, Number(coincidencia[2]) - DESFASE_LINEAS),
    }
  }

  const desmontar = () => {
    if (!raiz) return
    const anterior = raiz
    raiz = null
    anterior.unmount()
  }

  const montar = () => {
    desmontar()
    const App = requerir('./App.jsx').default
    const esComponente =
      typeof App === 'function' || (typeof App === 'object' && App !== null && '$$typeof' in App)
    if (!esComponente) {
      throw new Error(
        'App.jsx tiene que exportar un componente por defecto: export default function App() { … }',
      )
    }
    raiz = R.ReactDOMClient.createRoot(document.getElementById('root'), {
      onUncaughtError: (error) => {
        ultimoError = ubicar(error)
        enviar({ tipo: 'error-render', ...ultimoError })
      },
    })
    const elemento = R.React.createElement(App)
    raiz.render(strictMode ? R.React.createElement(R.React.StrictMode, null, elemento) : elemento)
  }

  try {
    montar()
  } catch (error) {
    enviar({ tipo: 'error-render', ...ubicar(error) })
  }
  enviar({ tipo: 'montado', version: R.React.version })

  // ---------------------------------------------------------- comprobaciones

  class FalloComprobacion extends Error {}

  const ROLES = {
    button: ['m', 'botón'],
    link: ['m', 'enlace'],
    heading: ['m', 'título'],
    textbox: ['m', 'campo de texto'],
    searchbox: ['m', 'buscador'],
    checkbox: ['f', 'casilla'],
    radio: ['f', 'opción de radio'],
    listitem: ['m', 'elemento de lista'],
    list: ['f', 'lista'],
    dialog: ['m', 'diálogo'],
    img: ['f', 'imagen'],
    option: ['f', 'opción'],
    tab: ['f', 'pestaña'],
    alert: ['f', 'alerta'],
    status: ['m', 'mensaje de estado'],
    table: ['f', 'tabla'],
    row: ['f', 'fila'],
    cell: ['f', 'celda'],
  }

  // "ningún botón llamado «Añadir»" cuando falta; "un botón llamado «Añadir»"
  // cuando sobra. El texto suelto no cambia: "el texto «Leer»".
  const describir = (consulta, faltante) => {
    if (consulta.rol === undefined && consulta.etiqueta === undefined) {
      return 'el texto «' + consulta.texto + '»'
    }
    if (consulta.etiqueta !== undefined) {
      return (faltante ? 'ningún' : 'un') + ' campo con la etiqueta «' + consulta.etiqueta + '»'
    }
    const [genero, sustantivo] = tiene(ROLES, consulta.rol)
      ? ROLES[consulta.rol]
      : ['m', 'elemento con el rol «' + consulta.rol + '»']
    const femenino = genero === 'f'
    let frase = (faltante ? (femenino ? 'ninguna' : 'ningún') : femenino ? 'una' : 'un') + ' ' + sustantivo
    if (consulta.nombre !== undefined) frase += (femenino ? ' llamada «' : ' llamado «') + consulta.nombre + '»'
    if (consulta.texto !== undefined) frase += ' con el texto «' + consulta.texto + '»'
    return frase
  }

  const normalizar = (texto) => texto.replace(/\s+/g, ' ').trim()

  const buscarTodos = (pantalla, consulta) => {
    if (consulta.rol !== undefined) {
      const candidatos = pantalla.queryAllByRole(
        consulta.rol,
        consulta.nombre !== undefined ? { name: consulta.nombre } : {},
      )
      if (consulta.texto === undefined) return candidatos
      return candidatos.filter((elemento) => normalizar(elemento.textContent || '').includes(consulta.texto))
    }
    if (consulta.etiqueta !== undefined) return pantalla.queryAllByLabelText(consulta.etiqueta)
    return pantalla.queryAllByText(consulta.texto)
  }

  // user-event lee "{" y "[" como teclas especiales ({Enter}, [ShiftLeft]):
  // doblarlas las escribe tal cual.
  const escaparTeclas = (texto) => texto.replace(/[{[]/g, '$&$&')

  const campoPorEtiqueta = (pantalla, etiqueta) => {
    const [campo] = pantalla.queryAllByLabelText(etiqueta)
    if (!campo) throw new FalloComprobacion('No encuentro ' + describir({ etiqueta }, true) + '.')
    return campo
  }

  const ejecutarPaso = async (pantalla, usuario, paso) => {
    if (paso.red === 'fallar-siguiente') {
      if (window.__redReactEnVivo) window.__redReactEnVivo.fallarSiguiente()
      return
    }
    if (paso.escribir) {
      const campo = campoPorEtiqueta(pantalla, paso.escribir.etiqueta)
      await usuario.clear(campo)
      if (paso.escribir.texto) await usuario.type(campo, escaparTeclas(paso.escribir.texto))
      return
    }
    if (paso.pulsar) {
      const [elemento] = buscarTodos(pantalla, paso.pulsar)
      if (!elemento) throw new FalloComprobacion('No encuentro ' + describir(paso.pulsar, true) + '.')
      await usuario.click(elemento)
      return
    }
    if (paso.teclear !== undefined) {
      await usuario.keyboard(paso.teclear)
      return
    }
    if (paso.seleccionar) {
      const campo = campoPorEtiqueta(pantalla, paso.seleccionar.etiqueta)
      try {
        await usuario.selectOptions(campo, paso.seleccionar.opcion)
      } catch {
        throw new FalloComprobacion(
          'No encuentro la opción «' +
            paso.seleccionar.opcion +
            '» en el campo «' +
            paso.seleccionar.etiqueta +
            '».',
        )
      }
    }
  }

  // null si se cumple; si no, el motivo en español.
  const motivoDeEspera = (pantalla, espera) => {
    if (espera.ausente) {
      return buscarTodos(pantalla, espera.ausente).length > 0
        ? 'Después de los pasos, todavía aparece ' + describir(espera.ausente, false) + '.'
        : null
    }
    if (espera.valor !== undefined) {
      const [campo] = pantalla.queryAllByLabelText(espera.etiqueta)
      if (!campo) return 'Después de los pasos, no aparece ' + describir({ etiqueta: espera.etiqueta }, true) + '.'
      const actual = campo.value ?? ''
      if (actual === espera.valor) return null
      return (
        'El campo «' +
        espera.etiqueta +
        '» contiene «' +
        actual +
        '» y debería ' +
        (espera.valor === '' ? 'estar vacío.' : 'contener «' + espera.valor + '».')
      )
    }
    return buscarTodos(pantalla, espera).length === 0
      ? 'Después de los pasos, no aparece ' + describir(espera, true) + '.'
      : null
  }

  const fallo = (comprobacion, motivo) => ({
    descripcion: comprobacion.descripcion,
    ok: false,
    motivo: motivo.slice(0, 300),
  })

  window.__comprobarReactEnVivo = async (comprobaciones) => {
    const P = window.__pruebasEnVivo
    if (!P) {
      const motivo =
        'No se pudieron cargar las herramientas de comprobación. Recarga la página para intentarlo de nuevo.'
      return comprobaciones.map((comprobacion) => fallo(comprobacion, motivo))
    }
    const resultados = []
    for (const comprobacion of comprobaciones) {
      // Cada comprobación empieza de cero, también el estado a nivel de módulo.
      cache = Object.create(null)
      ultimoError = null
      desmontar()
      try {
        R.ReactDOM.flushSync(montar)
      } catch (error) {
        ultimoError = ubicar(error)
      }
      if (ultimoError) {
        resultados.push(fallo(comprobacion, 'La app no llegó a mostrarse: ' + ultimoError.texto))
        enviar({ tipo: 'progreso-comprobaciones', resultado: resultados[resultados.length - 1] })
        continue
      }
      // within(document.body) ahora, no `screen`: screen se ata al body que
      // había al cargar pruebas.js, y en <head> todavía no existía.
      const pantalla = P.within(document.body)
      const usuario = P.userEvent.setup({ document })
      try {
        for (const paso of comprobacion.pasos || []) await ejecutarPaso(pantalla, usuario, paso)
        await P.waitFor(
          () => {
            // Si la app ya reventó no hay nada que esperar: se sale en el
            // acto en vez de agotar los 1500 ms (waitFor reintenta todo error).
            if (ultimoError) return
            const motivo = motivoDeEspera(pantalla, comprobacion.espera)
            if (motivo) throw new FalloComprobacion(motivo)
          },
          // Sin onTimeout, Testing Library pega el DOM entero al mensaje.
          { timeout: ESPERA_MS, onTimeout: (error) => error },
        )
        if (ultimoError) {
          throw new FalloComprobacion('Al hacer los pasos, la app falló: ' + ultimoError.texto)
        }
        resultados.push({ descripcion: comprobacion.descripcion, ok: true })
      } catch (error) {
        resultados.push(
          fallo(
            comprobacion,
            error instanceof FalloComprobacion
              ? error.message
              : 'Al hacer los pasos, la app falló: ' + ubicar(error).texto,
          ),
        )
      }
      enviar({ tipo: 'progreso-comprobaciones', resultado: resultados[resultados.length - 1] })
    }
    return resultados
  }

  window.addEventListener('message', async (evento) => {
    if (evento.source !== window.parent) return
    const datos = evento.data
    if (!datos || datos.canal !== 'react-en-vivo' || datos.tipo !== 'comprobar') return
    if (!Array.isArray(datos.comprobaciones)) return
    const resultados = await window.__comprobarReactEnVivo(datos.comprobaciones)
    enviar({ tipo: 'resultado-comprobaciones', resultados })
  })
})()
