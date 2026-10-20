// Árbol de renders de react-en-vivo (fase 2): en cada commit resume qué
// componentes se renderizaron y por qué, y qué nodos del DOM cambiaron de
// verdad. Solo va en la vista previa visible de un bloque con mostrarArbol,
// después de #root y antes del montaje; el puente lo llama desde el hook de
// DevTools con la raíz y el número de commit. Se incrusta en el srcdoc como
// texto (documento.ts lo importa con ?raw), nunca como módulo.
//
// Usa internos de React 19.3.1 (fibers), no API pública: arbol.test.ts monta
// un caso conocido con el react.js del sandbox y avisa si una versión nueva
// los cambia. Ver "Alcance de la fase 2" en specs/features/react-en-vivo.md.
;(() => {
  // Etiquetas de fiber (ReactWorkTags).
  const FUNCION = 0
  const CLASE = 1
  const PROVEEDOR = 10
  const FORWARD_REF = 11
  const SUSPENSE = 13
  const MEMO = 14
  const MEMO_SIMPLE = 15
  // Flag que React pone en un componente que se ha ejecutado en este render.
  const PERFORMED_WORK = 1

  const MAX_NODOS = 200
  const MAX_NIVEL = 40
  const MAX_MOTIVOS = 6
  const MAX_VALORES = 12
  const MAX_VALOR = 80
  const MAX_NOMBRE = 60
  const MAX_CLAVE = 40
  const MAX_NOMBRE_PROP = 40
  const DURACION_RESALTADO_MS = 700
  const ID_RESALTADOS = '__resaltados-react-en-vivo'
  const ELEMENTOS_REACT = [Symbol.for('react.transitional.element'), Symbol.for('react.element')]

  // ------------------------------------------------------------ identidad

  // React alterna dos fibers por componente (el actual y su alternate): el id
  // se guarda para los dos, así un componente conserva su id entre commits.
  const ids = new WeakMap()
  let siguienteId = 1
  const idDe = (fiber) => {
    let id = ids.get(fiber)
    if (id === undefined && fiber.alternate) id = ids.get(fiber.alternate)
    if (id === undefined) id = siguienteId++
    ids.set(fiber, id)
    if (fiber.alternate) ids.set(fiber.alternate, id)
    return id
  }
  const renders = new Map()

  const esComponente = (tag) =>
    tag === FUNCION || tag === CLASE || tag === FORWARD_REF || tag === MEMO_SIMPLE
  const seEmite = (fiber) => esComponente(fiber.tag) || fiber.tag === PROVEEDOR || fiber.tag === SUSPENSE

  const recortar = (texto, maximo) =>
    texto.length > maximo ? texto.slice(0, maximo - 1) + '…' : texto

  const nombreDe = (fiber) => {
    const tipo = fiber.type
    let nombre
    if (fiber.tag === PROVEEDOR) {
      nombre = (tipo && (tipo.displayName || (tipo._context && tipo._context.displayName))) || 'Context'
    } else if (fiber.tag === SUSPENSE) {
      nombre = 'Suspense'
    } else if (fiber.tag === FORWARD_REF) {
      nombre = (tipo && (tipo.displayName || (tipo.render && (tipo.render.displayName || tipo.render.name)))) || ''
    } else if (fiber.tag === MEMO_SIMPLE && fiber.elementType && fiber.elementType.displayName) {
      nombre = fiber.elementType.displayName
    } else {
      nombre = (tipo && (tipo.displayName || tipo.name)) || ''
    }
    return recortar(String(nombre) || 'Anónimo', MAX_NOMBRE)
  }

  // ------------------------------------------------------------ valores

  const nombreDeTipo = (tipo) => {
    if (typeof tipo === 'string') return tipo
    if (typeof tipo === 'function') return tipo.displayName || tipo.name || 'Componente'
    if (tipo && typeof tipo === 'object') {
      const interno = tipo.type || tipo.render
      return tipo.displayName || (interno && (interno.displayName || interno.name)) || 'Componente'
    }
    return 'Fragment'
  }

  const leer = (objeto, clave) => {
    try {
      return { ok: true, valor: objeto[clave] }
    } catch {
      return { ok: false }
    }
  }

  // Texto corto de cualquier valor, sin lanzar nunca: ciclos, getters que
  // lanzan, Symbol, elementos de React...
  const textoDe = (valor, profundidad, vistos) => {
    if (typeof valor === 'string') return JSON.stringify(valor)
    if (typeof valor === 'number' || typeof valor === 'boolean') return String(valor)
    if (typeof valor === 'bigint') return String(valor) + 'n'
    if (valor === null) return 'null'
    if (valor === undefined) return 'undefined'
    if (typeof valor === 'symbol') return valor.toString()
    if (typeof valor === 'function') return 'ƒ ' + (valor.name || '') + '()'
    if (ELEMENTOS_REACT.includes(valor.$$typeof)) return '<' + nombreDeTipo(valor.type) + ' />'
    if (vistos.has(valor)) return '[Circular]'
    if (Array.isArray(valor)) {
      if (profundidad >= 2) return '[…]'
      vistos.add(valor)
      const partes = []
      for (let i = 0; i < valor.length && i < 20; i += 1) partes.push(textoDe(valor[i], profundidad + 1, vistos))
      vistos.delete(valor)
      return '[' + partes.join(',') + (valor.length > 20 ? ',…' : '') + ']'
    }
    const prototipo = Object.getPrototypeOf(valor)
    if (prototipo !== Object.prototype && prototipo !== null) {
      if (valor instanceof Map || valor instanceof Set) return valor.constructor.name + '(' + valor.size + ')'
      if (valor instanceof Date) return 'Date(' + (isNaN(valor) ? 'inválida' : valor.toISOString()) + ')'
      return (valor.constructor && valor.constructor.name) || 'Object'
    }
    if (profundidad >= 2) return '{…}'
    vistos.add(valor)
    const partes = []
    for (const clave of Object.keys(valor).slice(0, 20)) {
      const leido = leer(valor, clave)
      partes.push(JSON.stringify(clave) + ':' + (leido.ok ? textoDe(leido.valor, profundidad + 1, vistos) : '‹error›'))
    }
    vistos.delete(valor)
    return '{' + partes.join(',') + '}'
  }

  const vista = (valor) => {
    let texto
    try {
      texto = textoDe(valor, 0, new Set())
    } catch {
      texto = '‹no se puede mostrar›'
    }
    // Un array que no cabe entero se resume por su tamaño.
    if (Array.isArray(valor) && (valor.length > 20 || texto.length > MAX_VALOR)) {
      return '[' + valor.length + (valor.length === 1 ? ' elemento]' : ' elementos]')
    }
    return recortar(texto, MAX_VALOR)
  }

  // ------------------------------------------------------------ estado y motivos

  // Los ganchos de un componente de función están encadenados por `next` en
  // memoizedState; los de estado (useState, useReducer) son los que tienen
  // una cola con dispatch y lastRenderedReducer.
  const valoresEstado = (fiber) => {
    if (fiber.tag === CLASE) return fiber.memoizedState == null ? [] : [fiber.memoizedState]
    if (!esComponente(fiber.tag)) return []
    const valores = []
    let gancho = fiber.memoizedState
    for (let vueltas = 0; gancho && typeof gancho === 'object' && 'next' in gancho && vueltas < 200; vueltas += 1) {
      const cola = gancho.queue
      if (cola && typeof cola.dispatch === 'function' && 'lastRenderedReducer' in cola) {
        valores.push(gancho.memoizedState)
      }
      gancho = gancho.next
    }
    return valores
  }

  const contextosDe = (fiber) => {
    const lista = []
    let dependencia = fiber.dependencies && fiber.dependencies.firstContext
    for (let vueltas = 0; dependencia && vueltas < 100; vueltas += 1) {
      lista.push(dependencia)
      dependencia = dependencia.next
    }
    return lista
  }

  const detalleDe = (antes, ahora) => {
    if (typeof antes === 'function' && typeof ahora === 'function') return 'funcion-nueva'
    if (Array.isArray(antes) && Array.isArray(ahora)) return 'array-nuevo'
    if (antes && ahora && typeof antes === 'object' && typeof ahora === 'object') return 'objeto-nuevo'
    return undefined
  }

  const motivosDe = (siguiente, previo) => {
    const motivos = []
    const vistos = new Set()
    const anadir = (motivo, clave) => {
      if (motivos.length >= MAX_MOTIVOS || vistos.has(clave)) return
      vistos.add(clave)
      motivos.push(motivo)
    }

    const antes = valoresEstado(previo)
    valoresEstado(siguiente).forEach((valor, i) => {
      if (i >= antes.length || !Object.is(valor, antes[i])) anadir({ tipo: 'estado', indice: i + 1 }, 'estado' + i)
    })

    const propsAntes = previo.memoizedProps
    const propsAhora = siguiente.memoizedProps
    if (propsAntes !== propsAhora && propsAntes && propsAhora && typeof propsAhora === 'object') {
      const claves = new Set([...Object.keys(propsAntes), ...Object.keys(propsAhora)])
      for (const clave of claves) {
        const a = leer(propsAntes, clave)
        const b = leer(propsAhora, clave)
        if (a.ok && b.ok && Object.is(a.valor, b.valor)) continue
        const motivo = { tipo: 'prop', nombre: recortar(clave, MAX_NOMBRE_PROP) }
        const detalle = a.ok && b.ok ? detalleDe(a.valor, b.valor) : undefined
        if (detalle) motivo.detalle = detalle
        anadir(motivo, 'prop:' + clave)
      }
    }

    // Con StrictMode, un mismo contexto puede salir dos veces en la lista.
    const valoresAntes = new Map(contextosDe(previo).map((d) => [d.context, d.memoizedValue]))
    for (const dependencia of contextosDe(siguiente)) {
      if (valoresAntes.has(dependencia.context) && Object.is(valoresAntes.get(dependencia.context), dependencia.memoizedValue)) {
        continue
      }
      const contexto = dependencia.context
      const nombre = recortar(String((contexto && contexto.displayName) || 'Context'), MAX_NOMBRE)
      anadir({ tipo: 'contexto', nombre }, contexto)
    }

    if (motivos.length === 0) motivos.push({ tipo: 'padre' })
    return motivos
  }

  const propsDe = (fiber) => {
    const props = fiber.memoizedProps
    if (!props || typeof props !== 'object') return []
    return Object.keys(props)
      .slice(0, MAX_VALORES)
      .map((clave) => {
        const leido = leer(props, clave)
        return { nombre: recortar(clave, MAX_NOMBRE_PROP), valor: leido.ok ? vista(leido.valor) : '‹error›' }
      })
  }

  // ------------------------------------------------------------ recorrido

  const seRenderizo = (siguiente, previo) =>
    esComponente(siguiente.tag)
      ? (siguiente.flags & PERFORMED_WORK) !== 0
      : siguiente.memoizedProps !== previo.memoizedProps

  // Devuelve los nodos raíz (con sus hijos anidados) del árbol de componentes.
  const construir = (raiz) => {
    const raices = []
    const visitar = (siguiente, previo, padre, saltado, dentroDeMemo) => {
      let contenedor = padre
      if (seEmite(siguiente)) {
        const id = idDe(siguiente)
        let estado
        if (saltado) estado = 'sin-cambios'
        else if (!previo) estado = 'montado'
        else if (seRenderizo(siguiente, previo)) estado = 'renderizado'
        else estado = 'sin-cambios'
        if (estado !== 'sin-cambios') renders.set(id, (renders.get(id) || 0) + 1)
        const nodo = {
          id,
          nombre: nombreDe(siguiente),
          estado,
          renders: renders.get(id) || 0,
          motivos: estado === 'renderizado' ? motivosDe(siguiente, previo) : [],
          props: propsDe(siguiente),
          estados: valoresEstado(siguiente).slice(0, MAX_VALORES).map((valor) => ({ valor: vista(valor) })),
          hijos: [],
        }
        if (siguiente.key !== null && siguiente.key !== undefined) nodo.clave = recortar(String(siguiente.key), MAX_CLAVE)
        if (siguiente.tag === PROVEEDOR) nodo.marca = 'proveedor'
        else if (siguiente.tag === SUSPENSE) nodo.marca = 'suspense'
        else if (siguiente.tag === MEMO_SIMPLE || dentroDeMemo) nodo.marca = 'memo'
        ;(padre ? padre.hijos : raices).push(nodo)
        contenedor = nodo
      }
      // Si el puntero child es el mismo objeto que en el commit anterior,
      // React se saltó todo el subárbol: sus flags pueden ser de un render
      // antiguo y no se miran.
      const hijosSaltados = saltado || (previo !== null && siguiente.child === previo.child)
      // De un memo con comparador (14) se emite su hijo, marcado como memo.
      const hijoDeMemo = siguiente.tag === MEMO
      for (let hijo = siguiente.child; hijo; hijo = hijo.sibling) {
        visitar(hijo, hijosSaltados ? hijo : hijo.alternate || null, contenedor, hijosSaltados, hijoDeMemo)
      }
    }
    if (raiz && raiz.current) visitar(raiz.current, raiz.current.alternate || null, null, false, false)
    return raices
  }

  // Lista en preorden con el padre de cada nodo: lo que se recuerda del
  // commit anterior para saber qué se desmontó y dónde estaba.
  let anteriores = []
  const aplanar = (raices) => {
    const lista = []
    const visitar = (nodos, padre) => {
      for (const nodo of nodos) {
        lista.push({ nodo, padre })
        visitar(nodo.hijos, nodo.id)
      }
    }
    visitar(raices, null)
    return lista
  }

  // Los desmontados se insertan, una sola vez, donde estaban: detrás de su
  // hermano anterior si sigue ahí, o los primeros entre los hijos de su padre.
  const insertarDesmontados = (raices, actuales) => {
    const porId = new Map(actuales.map(({ nodo }) => [nodo.id, nodo]))
    anteriores.forEach(({ nodo, padre }, posicion) => {
      if (porId.has(nodo.id)) return
      const desmontado = { ...nodo, estado: 'desmontado', motivos: [], hijos: [] }
      const hermanos = padre === null ? raices : porId.has(padre) ? porId.get(padre).hijos : null
      if (!hermanos) return
      let hermanoAnterior = null
      for (let i = posicion - 1; i >= 0; i -= 1) {
        if (anteriores[i].padre === padre) {
          hermanoAnterior = porId.get(anteriores[i].nodo.id) || null
          break
        }
      }
      const indice = hermanoAnterior ? hermanos.indexOf(hermanoAnterior) + 1 : 0
      hermanos.splice(indice, 0, desmontado)
      porId.set(nodo.id, desmontado)
    })
  }

  const serializar = (raices) => {
    const nodos = []
    let truncado = false
    const visitar = (lista, nivel) => {
      for (const nodo of lista) {
        if (nodos.length >= MAX_NODOS) {
          truncado = true
          return
        }
        const { hijos, ...datos } = nodo
        nodos.push({ ...datos, nivel: Math.min(nivel, MAX_NIVEL) })
        visitar(hijos, nivel + 1)
      }
    }
    visitar(raices, 0)
    return { nodos, truncado }
  }

  // ------------------------------------------------------------ cambios en el DOM

  const raizDom = document.getElementById('root')
  const observador =
    raizDom && typeof MutationObserver === 'function' ? new MutationObserver(() => {}) : null
  if (observador) {
    observador.observe(raizDom, { childList: true, characterData: true, attributes: true, subtree: true })
  }
  let primerCommit = true

  const nodosAfectados = () => {
    const afectados = new Set()
    if (!observador) return afectados
    for (const registro of observador.takeRecords()) {
      if (registro.type === 'characterData') {
        afectados.add(registro.target.parentElement || registro.target)
      } else if (registro.type === 'attributes') {
        afectados.add(registro.target)
      } else {
        registro.addedNodes.forEach((nodo) =>
          afectados.add(nodo.nodeType === Node.ELEMENT_NODE ? nodo : nodo.parentElement || registro.target),
        )
        if (registro.removedNodes.length > 0) afectados.add(registro.target)
      }
    }
    return afectados
  }

  const contenedorResaltados = () => {
    let contenedor = document.getElementById(ID_RESALTADOS)
    if (!contenedor) {
      contenedor = document.createElement('div')
      contenedor.id = ID_RESALTADOS
      contenedor.setAttribute('aria-hidden', 'true')
      Object.assign(contenedor.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '0',
        height: '0',
        pointerEvents: 'none',
        zIndex: '2147483646',
      })
      document.body.append(contenedor)
    }
    return contenedor
  }

  const resaltar = (afectados) => {
    const sinMovimiento =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const contenedor = contenedorResaltados()
    for (const elemento of afectados) {
      if (!elemento || elemento.nodeType !== Node.ELEMENT_NODE || !elemento.isConnected) continue
      const caja = elemento.getBoundingClientRect()
      const marco = document.createElement('div')
      Object.assign(marco.style, {
        position: 'absolute',
        left: caja.left + window.scrollX - 2 + 'px',
        top: caja.top + window.scrollY - 2 + 'px',
        width: caja.width + 4 + 'px',
        height: caja.height + 4 + 'px',
        border: '2px solid #f59e0b',
        borderRadius: '4px',
        boxSizing: 'border-box',
        opacity: '1',
        transition: sinMovimiento ? 'none' : 'opacity ' + DURACION_RESALTADO_MS + 'ms ease-out',
      })
      contenedor.append(marco)
      if (!sinMovimiento) {
        const desvanecer = () => {
          marco.style.opacity = '0'
        }
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(desvanecer)
        else setTimeout(desvanecer, 16)
      }
      setTimeout(() => marco.remove(), DURACION_RESALTADO_MS)
    }
  }

  // ------------------------------------------------------------ cada commit

  window.__arbolReactEnVivo = (raiz, commit) => {
    const afectados = nodosAfectados()
    if (!primerCommit) resaltar(afectados)
    primerCommit = false

    const raices = construir(raiz)
    const actuales = aplanar(raices)
    insertarDesmontados(raices, actuales)
    anteriores = actuales
    const { nodos, truncado } = serializar(raices)
    window.__enviarReactEnVivo({
      tipo: 'arbol',
      commit: typeof commit === 'number' ? commit : 0,
      nodos,
      truncado,
      cambiosDom: afectados.size,
    })
  }
})()
