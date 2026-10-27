// Registra las operaciones de los routers de datos con la API pública de
// instrumentación de React Router. Se carga antes de router.js y solo en la
// vista previa visible cuando el bloque pide mostrarRouter.
;(() => {
  const LIBRERIA = window.__reactRouterEnVivo
  if (!LIBRERIA || !LIBRERIA.ReactRouter) return

  const ReactRouter = LIBRERIA.ReactRouter
  const enviar = window.__enviarReactEnVivo
  const marca = ReactRouter.createContext(null)
  const registros = new Set()
  const porRouter = new Map()
  let siguienteId = 1
  let operacionesEnCarga = 0
  let avisadoLleno = false

  const ahora = () => Date.now()
  const ms = (valor) => Math.max(0, Math.min(600_000, Math.round(valor)))
  const recortar = (valor, limite) => String(valor ?? '').slice(0, limite)
  const codificar = (valor, limite) => {
    try {
      return encodeURI(String(valor ?? ''))
        .replace(/%25([0-9a-f]{2})/gi, '%$1')
        .slice(0, limite)
    } catch {
      return recortar(valor, limite)
    }
  }
  const urlDeRequest = (request) => {
    try {
      const url = new URL(request.url)
      return codificar(url.pathname + url.search + url.hash, 200)
    } catch {
      return codificar(request.url, 200)
    }
  }
  const nombreError = (error) => {
    if (error instanceof Error) return recortar(`${error.name}: ${error.message}`, 200)
    return recortar(String(error), 200)
  }
  const nombreRuta = (ruta) => {
    const id = recortar(ruta && ruta.id, 60)
    if (id && !/^\d+(?:-\d+)*$/.test(id)) return id
    if (ruta && ruta.path) return recortar(ruta.path, 60)
    if (ruta && ruta.index) return 'índice'
    return id || 'ruta'
  }

  const mensajeDe = (operacion) => ({
    tipo: 'router-operacion',
    id: operacion.id,
    clase: operacion.clase,
    metodo: operacion.metodo,
    destino: operacion.destino,
    ...(operacion.fetcher ? { fetcher: operacion.fetcher } : {}),
    estado: operacion.estado,
    ...(operacion.canceladaPor ? { canceladaPor: operacion.canceladaPor } : {}),
    ...(operacion.duracion !== undefined ? { duracion: operacion.duracion } : {}),
    ...(operacion.urlFinal !== undefined ? { urlFinal: operacion.urlFinal } : {}),
    pasos: operacion.pasos.slice(0, 40).map((paso) => ({ ...paso })),
    truncado: operacion.pasos.length > 40,
    ...(operacion.sinEjecutar ? { sinEjecutar: operacion.sinEjecutar } : {}),
    ...(operacion.errores ? { errores: operacion.errores } : {}),
  })

  const publicar = (operacion, inmediato = false) => {
    try {
      const registro = operacion.registro
      if (!registro.activo) return
      const tiempo = ahora()
      const transcurrido = tiempo - operacion.ultimaPublicacion
      if (inmediato || transcurrido >= 50) {
        if (operacion.temporizador !== null) {
          clearTimeout(operacion.temporizador)
          operacion.temporizador = null
        }
        operacion.ultimaPublicacion = tiempo
        enviar(mensajeDe(operacion))
        return
      }
      if (operacion.temporizador !== null) return
      operacion.temporizador = setTimeout(() => {
        operacion.temporizador = null
        publicar(operacion, true)
      }, 50 - transcurrido)
    } catch {
      // El registro nunca debe romper la aplicación del alumno.
    }
  }

  const avisarLleno = () => {
    if (avisadoLleno) return
    avisadoLleno = true
    try {
      enviar({ tipo: 'router-lleno' })
    } catch {
      // Ayuda visual opcional.
    }
  }

  const abrir = (registro, datos, sintetica = false) => {
    try {
      if (operacionesEnCarga >= 200 || siguienteId > 100_000) {
        avisarLleno()
        return null
      }
      operacionesEnCarga += 1
      const operacion = {
        registro,
        id: siguienteId++,
        clase: datos.clase,
        metodo: recortar(datos.metodo || 'GET', 10).toUpperCase(),
        destino: codificar(datos.destino || '', 200),
        ...(datos.fetcher ? { fetcher: recortar(datos.fetcher, 60) } : {}),
        estado: 'en-curso',
        pasos: [],
        inicioAbsoluto: ahora(),
        pendientes: 0,
        // Las sintéticas (sin navigate ni fetch instrumentado) no tienen llamada
        // que termine: las cierra cerrarSinteticas cuando el router vuelve al
        // reposo, que es cuando ya están confirmados la URL final y los errores.
        llamadaTerminada: false,
        sintetica,
        ejecutados: new Set(),
        ultimaPublicacion: 0,
        temporizador: null,
        cerrada: false,
      }
      registro.operaciones.push(operacion)
      publicar(operacion)
      return operacion
    } catch {
      return null
    }
  }

  const textoErrorRuta = (error) => {
    try {
      if (ReactRouter.isRouteErrorResponse(error)) {
        const dato =
          typeof error.data === 'string' ? error.data : JSON.stringify(error.data) || String(error.data)
        return recortar(`${error.status} ${dato}`, 200)
      }
      if (error instanceof Error) return recortar(error.message, 200)
      return recortar(String(error), 200)
    } catch {
      return 'Error desconocido'
    }
  }

  const completarDatosFinales = (operacion) => {
    const router = operacion.registro.router
    if (!router || operacion.estado === 'cancelada') return
    try {
      operacion.urlFinal = codificar(ReactRouter.createPath(router.state.location), 200)
      const errores = Object.entries(router.state.errors || {})
        .slice(0, 8)
        .map(([id, error]) => {
          const match = (router.state.matches || []).find((actual) => actual.route.id === id)
          return {
            ruta: match ? nombreRuta(match.route) : recortar(id, 60) || 'ruta',
            texto: textoErrorRuta(error),
          }
        })
      if (errores.length > 0) {
        operacion.errores = errores
        // Tras un error, un loader ausente puede haberse omitido por el corte del
        // flujo y no por shouldRevalidate; no lo presentamos como «no revalidado».
        return
      }
      if (operacion.clase === 'fetcher-carga') return
      const sinEjecutar = (router.state.matches || [])
        .filter((match) => typeof match.route.loader === 'function')
        .map((match) => nombreRuta(match.route))
        .filter((ruta) => !operacion.ejecutados.has(ruta))
        .slice(0, 16)
      if (sinEjecutar.length > 0) operacion.sinEjecutar = sinEjecutar
    } catch {
      // El estado final es informativo; la operación igualmente se cierra.
    }
  }

  const cerrar = (operacion) => {
    try {
      if (operacion.cerrada || !operacion.llamadaTerminada || operacion.pendientes !== 0) return
      operacion.cerrada = true
      operacion.duracion = ms(ahora() - operacion.inicioAbsoluto)
      if (operacion.estado !== 'cancelada') operacion.estado = 'terminada'
      completarDatosFinales(operacion)
      publicar(operacion, true)
    } catch {
      // Nunca interfiere con el router.
    }
  }

  const cancelar = (operacion, idNueva) => {
    try {
      if (operacion.cerrada || operacion.estado === 'cancelada') return
      operacion.estado = 'cancelada'
      operacion.canceladaPor = idNueva
      operacion.duracion = ms(ahora() - operacion.inicioAbsoluto)
      publicar(operacion, true)
      cerrar(operacion)
    } catch {
      // Nunca interfiere con el router.
    }
  }

  const sacarEspera = (registro, operacion) => {
    const indice = registro.esperando.indexOf(operacion)
    if (indice >= 0) registro.esperando.splice(indice, 1)
  }

  const operacionRecienteAbierta = (registro) => {
    for (let indice = registro.operaciones.length - 1; indice >= 0; indice -= 1) {
      if (!registro.operaciones[indice].cerrada) return registro.operaciones[indice]
    }
    return null
  }

  const envolverOperacionRouter = (registro, claseDe, esFetcher) => async (llamar, info) => {
    let operacion = null
    let llamando = false
    try {
      const metodo = recortar(info.formMethod || 'GET', 10).toUpperCase()
      const datos = esFetcher
        ? {
            clase: metodo === 'GET' ? 'fetcher-carga' : 'fetcher-envio',
            metodo,
            destino: info.href,
            fetcher: info.fetcherKey,
          }
        : {
            clase: claseDe(info, metodo),
            metodo,
            destino: typeof info.to === 'string' ? info.to : '',
          }
      operacion = abrir(registro, datos)
      if (operacion) {
        for (const anterior of registro.operaciones) {
          if (anterior === operacion || anterior.cerrada) continue
          const cancelarNavegacion =
            !esFetcher && !['fetcher-carga', 'fetcher-envio'].includes(anterior.clase)
          const cancelarFetcher =
            esFetcher &&
            anterior.fetcher === operacion.fetcher &&
            ['fetcher-carga', 'fetcher-envio'].includes(anterior.clase)
          if (cancelarNavegacion || cancelarFetcher) cancelar(anterior, operacion.id)
        }
        registro.esperando.push(operacion)
      }
      llamando = true
      await llamar()
    } catch {
      if (!llamando) {
        try {
          await llamar()
        } catch {
          // React Router conserva el resultado real de la llamada.
        }
      }
    } finally {
      if (operacion) {
        sacarEspera(registro, operacion)
        operacion.llamadaTerminada = true
        cerrar(operacion)
      }
    }
  }

  const envolverPaso = (registro, ruta, tipo) => async (llamar, info) => {
    let paso = null
    let operacion = null
    let llamando = false
    try {
      let referencia = null
      let fase = 'carga'
      if (info && info.context && typeof info.context.get === 'function') {
        referencia = info.context.get(marca)
      } else {
        operacion = operacionRecienteAbierta(registro)
        referencia = operacion ? { operacion, fase: 'carga' } : null
      }
      operacion = referencia && referencia.operacion
      if (!operacion) {
        llamando = true
        await llamar()
        return
      }
      fase = referencia.fase || fase
      if (info && info.request) {
        if (!operacion.destino) operacion.destino = urlDeRequest(info.request)
        if (String(info.request.method).toUpperCase() !== 'GET') fase = 'envio'
      }
      paso = {
        tipo,
        ruta: nombreRuta(ruta),
        fase,
        inicio: ms(ahora() - operacion.inicioAbsoluto),
        estado: 'en-curso',
      }
      operacion.pasos.push(paso)
      operacion.pendientes += 1
      publicar(operacion)
      llamando = true
      const resultado = await llamar()
      paso.duracion = ms(ahora() - operacion.inicioAbsoluto - paso.inicio)
      if (resultado && resultado.status === 'error') {
        paso.estado = 'error'
        paso.error = nombreError(resultado.error)
      } else paso.estado = 'ok'
    } catch {
      if (!llamando) {
        try {
          await llamar()
        } catch {
          // El registro nunca sustituye el resultado real.
        }
      }
    } finally {
      if (paso && operacion) {
        if (paso.duracion === undefined) paso.duracion = ms(ahora() - operacion.inicioAbsoluto - paso.inicio)
        if (paso.estado === 'en-curso') paso.estado = 'ok'
        if (operacion.estado === 'cancelada') paso.tarde = true
        if (tipo === 'loader') operacion.ejecutados.add(paso.ruta)
        operacion.pendientes = Math.max(0, operacion.pendientes - 1)
        publicar(operacion)
        cerrar(operacion)
      }
    }
  }

  const instrumentacion = (registro) => ({
    router(router) {
      try {
        router.instrument({
          navigate: envolverOperacionRouter(
            registro,
            (info, metodo) =>
              info.to === -1
                ? 'atras'
                : info.to === 1
                  ? 'adelante'
                  : metodo !== 'GET'
                    ? 'envio'
                    : 'navegacion',
            false,
          ),
          fetch: envolverOperacionRouter(registro, () => 'fetcher-carga', true),
        })
      } catch {
        // Instrumentación opcional.
      }
    },
    route(route) {
      try {
        route.instrument({
          middleware: envolverPaso(registro, route, 'middleware'),
          loader: envolverPaso(registro, route, 'loader'),
          action: envolverPaso(registro, route, 'action'),
          lazy: envolverPaso(registro, route, 'lazy'),
        })
      } catch {
        // Instrumentación opcional.
      }
    },
  })

  const cerrarSinteticas = (registro, estado) => {
    try {
      if (!estado || !estado.initialized) return
      if (estado.navigation.state !== 'idle' || estado.revalidation !== 'idle') return
      for (const operacion of registro.operaciones) {
        if (!operacion.sintetica || operacion.cerrada) continue
        operacion.llamadaTerminada = true
        cerrar(operacion)
      }
    } catch {
      // Ayuda visual opcional.
    }
  }

  // Sin navigate instrumentado (carga inicial, revalidate(), seguir tras
  // useBlocker), la clase sale del estado del router en ese momento.
  const claseSintetica = (registro) => {
    const estado = registro.router && registro.router.state
    if (!estado || !estado.initialized) return 'carga-inicial'
    if (estado.revalidation === 'loading') return 'revalidacion'
    return 'navegacion'
  }

  const destinoSintetico = (registro) => {
    try {
      const navegacion = registro.router && registro.router.state.navigation
      return navegacion && navegacion.location ? ReactRouter.createPath(navegacion.location) : ''
    } catch {
      return ''
    }
  }

  const prepararOpciones = (opciones = {}) => {
    const registro = { router: null, activo: false, operaciones: [], esperando: [] }
    registros.add(registro)
    const original = opciones.getContext
    const instrumentations = Array.isArray(opciones.instrumentations)
      ? opciones.instrumentations
      : []
    const finales = {
      ...opciones,
      instrumentations: [instrumentacion(registro), ...instrumentations],
      getContext: async () => {
        let operacion = null
        let fase = 'carga'
        try {
          operacion = registro.esperando.shift() || null
          if (operacion) fase = operacion.metodo === 'GET' ? 'carga' : 'revalidacion'
          if (!operacion) {
            operacion = [...registro.operaciones]
              .reverse()
              .find((actual) => !actual.llamadaTerminada && !actual.cerrada)
            if (operacion) fase = 'redireccion'
          }
          if (!operacion) {
            operacion = abrir(
              registro,
              { clase: claseSintetica(registro), metodo: 'GET', destino: destinoSintetico(registro) },
              true,
            )
            if (operacion && operacion.clase === 'revalidacion') fase = 'revalidacion'
          }
        } catch {
          operacion = null
        }
        let contexto
        try {
          contexto = original ? await original() : new ReactRouter.RouterContextProvider()
        } catch (error) {
          // El error del getContext del alumno sigue su camino, como sin registro.
          if (operacion && operacion.sintetica) {
            operacion.llamadaTerminada = true
            cerrar(operacion)
          }
          throw error
        }
        try {
          if (operacion && contexto && typeof contexto.set === 'function') {
            contexto.set(marca, { operacion, fase })
          }
        } catch {
          // Sin marca, sus pasos no se registran; la app sigue igual.
        }
        return contexto
      },
    }
    return {
      opciones: finales,
      conectar(router) {
        try {
          registro.router = router
          porRouter.set(router, registro)
          registro.desuscribir = router.subscribe((estado) => cerrarSinteticas(registro, estado))
          cerrarSinteticas(registro, router.state)
        } catch {
          // Ayuda visual opcional.
        }
      },
    }
  }

  const activar = (router) => {
    try {
      const registro = porRouter.get(router)
      if (!registro) return
      registro.activo = true
      for (const operacion of registro.operaciones) publicar(operacion, true)
    } catch {
      // Ayuda visual opcional.
    }
  }
  const desactivar = (router) => {
    try {
      const registro = porRouter.get(router)
      if (registro) registro.activo = false
    } catch {
      // Ayuda visual opcional.
    }
  }
  const descartarRegistro = (registro) => {
    registro.activo = false
    try {
      if (registro.desuscribir) registro.desuscribir()
    } catch {
      // Ayuda visual opcional.
    }
    for (const operacion of registro.operaciones) {
      if (operacion.temporizador !== null) clearTimeout(operacion.temporizador)
    }
    registros.delete(registro)
    if (registro.router) porRouter.delete(registro.router)
  }
  const descartar = (router) => {
    try {
      const registro = porRouter.get(router)
      if (registro) descartarRegistro(registro)
    } catch {
      // Ayuda visual opcional.
    }
  }
  const reiniciar = () => {
    try {
      for (const registro of [...registros]) descartarRegistro(registro)
      operacionesEnCarga = 0
      avisadoLleno = false
    } catch {
      // Ayuda visual opcional.
    }
  }

  window.__registroRouterEnVivo = {
    prepararOpciones,
    activar,
    desactivar,
    descartar,
    reiniciar,
  }
})()
