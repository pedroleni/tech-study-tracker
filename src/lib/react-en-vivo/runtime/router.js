// Adapta React Router al iframe opaco de react-en-vivo. El historial real del
// navegador no funciona en srcdoc, así que todos los routers usan memoria y
// exponen su ubicación a la barra de la página.
;(() => {
  if (window.__routerEnVivo && window.__routerEnVivo.desmontar) {
    window.__routerEnVivo.desmontar()
  }
  const LIBRERIA = window.__reactRouterEnVivo
  const R = window.__reactEnVivo
  const ERROR_CARGA =
    'No se pudo cargar React Router en la vista previa. Recarga la página para intentarlo de nuevo.'

  if (!LIBRERIA || !R) {
    window.__routerEnVivo = { error: ERROR_CARGA }
    return
  }

  const ReactRouter = LIBRERIA.ReactRouter
  const ReactRouterDom = LIBRERIA.ReactRouterDom
  const enviar = window.__enviarReactEnVivo
  const routersDatos = new Set()
  const navegadoresDatos = new Map()
  const avisados = new Set()
  let navegadorActivo = null
  let cargaPendiente = window.__configReactEnVivo.urlInicial ?? null
  let ultimaUrlCargada = window.__configReactEnVivo.urlInicial ?? '/'
  let ultimoMensaje = ''

  const crearUrl = (entrada) =>
    typeof entrada === 'string' ? entrada : ReactRouter.createPath(entrada)

  const crearHistorial = (entradas, initialIndex) => {
    const lista = (entradas && entradas.length ? entradas : ['/']).map((entrada) => ({
      clave: null,
      url: crearUrl(entrada),
    }))
    let indice = Number.isInteger(initialIndex)
      ? Math.min(Math.max(initialIndex, 0), lista.length - 1)
      : lista.length - 1

    return {
      actualizar(ubicacion, accion) {
        const clave = ubicacion.key || null
        const url = ReactRouter.createPath(ubicacion)
        if (lista[indice] && lista[indice].clave === null) {
          lista[indice] = { clave, url }
          return
        }
        if (clave && lista[indice] && lista[indice].clave === clave) {
          lista[indice].url = url
          return
        }
        if (accion === 'PUSH') {
          lista.splice(indice + 1)
          lista.push({ clave, url })
          indice = lista.length - 1
          return
        }
        if (accion === 'REPLACE') {
          lista[indice] = { clave, url }
          return
        }
        let siguiente = clave ? lista.findIndex((entrada) => entrada.clave === clave) : -1
        if (siguiente === -1 && indice > 0 && lista[indice - 1].url === url) siguiente = indice - 1
        if (siguiente === -1 && indice + 1 < lista.length && lista[indice + 1].url === url) siguiente = indice + 1
        if (siguiente === -1) lista[indice] = { clave, url }
        else {
          indice = siguiente
          lista[indice] = { clave, url }
        }
      },
      puedeAtras: () => indice > 0,
      puedeAdelante: () => indice < lista.length - 1,
      capturarCarga(accion, url) {
        const entradas = lista.map((entrada) => entrada.url)
        let nuevoIndice = indice
        if (accion === 'ir') {
          entradas.splice(indice + 1)
          entradas.push(url)
          nuevoIndice = entradas.length - 1
        } else {
          entradas[indice] = url
        }
        return { url, entradas, indice: nuevoIndice }
      },
    }
  }

  const resolverCarga = (entradas, initialIndex) => {
    if (
      cargaPendiente &&
      typeof cargaPendiente === 'object' &&
      Array.isArray(cargaPendiente.entradas)
    ) {
      return {
        entradas: cargaPendiente.entradas,
        indice: cargaPendiente.indice,
      }
    }
    if (typeof cargaPendiente === 'string') {
      return { entradas: [cargaPendiente], indice: 0 }
    }
    return { entradas, indice: initialIndex }
  }

  const avisarAlias = (origen) => {
    if (avisados.has(origen)) return
    avisados.add(origen)
    if (origen === 'createBrowserRouter' || origen === 'BrowserRouter') {
      console.info(
        origen +
          ' usa aquí un historial en memoria: la vista previa no puede cambiar la dirección de verdad. En tu proyecto usará la del navegador.',
      )
    }
    if (origen === 'createHashRouter' || origen === 'HashRouter') {
      console.info(
        origen +
          ' usa aquí un historial en memoria: la vista previa no puede cambiar la dirección de verdad. En tu proyecto guardará la ruta detrás de la #.',
      )
    }
  }

  const publicarUbicacion = () => {
    if (!navegadorActivo) return
    const mensaje = {
      tipo: 'ubicacion',
      url: encodeURI(navegadorActivo.ubicacion()).slice(0, 500),
      puedeAtras: navegadorActivo.puedeAtras(),
      puedeAdelante: navegadorActivo.puedeAdelante(),
      origen: navegadorActivo.origen,
    }
    const firma = JSON.stringify(mensaje)
    if (firma === ultimoMensaje) return
    ultimoMensaje = firma
    enviar(mensaje)
  }

  const registrarRouterDatos = (router, origen, entradas, initialIndex) => {
    const historial = crearHistorial(entradas, initialIndex)
    const actualizar = (estado) => {
      historial.actualizar(estado.location, estado.historyAction)
      const navegador = navegadoresDatos.get(router)
      if (navegadorActivo === navegador) {
        ultimaUrlCargada = navegador.ubicacion()
        publicarUbicacion()
      }
    }
    const cancelar = router.subscribe(actualizar)
    const disposeOriginal = router.dispose.bind(router)
    let dispuesto = false
    router.dispose = () => {
      if (dispuesto) return
      dispuesto = true
      try {
        window.__registroRouterEnVivo?.descartar(router)
      } catch {
        // El registro es una ayuda visual y nunca bloquea dispose().
      }
      cancelar()
      routersDatos.delete(router)
      const navegador = navegadoresDatos.get(router)
      navegadoresDatos.delete(router)
      if (navegadorActivo === navegador) navegadorActivo = null
      disposeOriginal()
    }
    routersDatos.add(router)
    const navegador = {
      origen,
      navegar: (destino) => router.navigate(destino),
      ubicacion: () => ReactRouter.createPath(router.state.location),
      ocupado: () =>
        router.state.navigation.state !== 'idle' || router.state.revalidation !== 'idle',
      puedeAtras: historial.puedeAtras,
      puedeAdelante: historial.puedeAdelante,
      capturarCarga: historial.capturarCarga,
    }
    navegadoresDatos.set(router, navegador)
    historial.actualizar(router.state.location, router.state.historyAction)
    return router
  }

  const activarRouterDatos = (router) => {
    const navegador = navegadoresDatos.get(router)
    if (!navegador) return null
    navegadorActivo = navegador
    ultimaUrlCargada = navegador.ubicacion()
    avisarAlias(navegador.origen)
    publicarUbicacion()
    return navegador
  }

  const createMemoryRouter = (rutas, opciones = {}) => {
    const carga = resolverCarga(opciones.initialEntries || ['/'], opciones.initialIndex)
    const opcionesFinales = cargaPendiente
      ? { ...opciones, initialEntries: carga.entradas, initialIndex: carga.indice }
      : opciones
    const preparado = window.__registroRouterEnVivo?.prepararOpciones(opcionesFinales)
    const router = ReactRouter.createMemoryRouter(rutas, preparado?.opciones ?? opcionesFinales)
    preparado?.conectar(router)
    const entradas = opcionesFinales.initialEntries || ['/']
    return registrarRouterDatos(router, 'createMemoryRouter', entradas, opcionesFinales.initialIndex)
  }

  const crearRouterAlias = (origen) => (rutas, opciones = {}) => {
    const { window: _windowIgnorada, ...resto } = opciones
    const carga = resolverCarga(['/'], 0)
    const finales = { ...resto, initialEntries: carga.entradas, initialIndex: carga.indice }
    const preparado = window.__registroRouterEnVivo?.prepararOpciones(finales)
    const router = ReactRouter.createMemoryRouter(rutas, preparado?.opciones ?? finales)
    preparado?.conectar(router)
    return registrarRouterDatos(router, origen, finales.initialEntries, finales.initialIndex)
  }

  function SensorDeUbicacion({ control, origen }) {
    const ubicacion = ReactRouter.useLocation()
    const accion = ReactRouter.useNavigationType()
    const navegar = ReactRouter.useNavigate()
    control.historial.actualizar(ubicacion, accion)
    ultimaUrlCargada = ReactRouter.createPath(ubicacion)
    R.React.useLayoutEffect(() => {
      navegadorActivo = {
        origen,
        navegar,
        ubicacion: () => ReactRouter.createPath(ubicacion),
        ocupado: () => false,
        puedeAtras: control.historial.puedeAtras,
        puedeAdelante: control.historial.puedeAdelante,
        capturarCarga: control.historial.capturarCarga,
      }
      avisarAlias(origen)
      publicarUbicacion()
    }, [accion, control, navegar, origen, ubicacion])
    return null
  }

  const crearRouterDeclarativo = (origen) =>
    function RouterDeclarativo(propiedades) {
      const { basename, children } = propiedades
      const carga = resolverCarga(
        origen === 'MemoryRouter' ? propiedades.initialEntries || ['/'] : ['/'],
        origen === 'MemoryRouter' ? propiedades.initialIndex : undefined,
      )
      const initialEntries = carga.entradas
      const initialIndex = carga.indice
      const controlRef = R.React.useRef(null)
      if (!controlRef.current) {
        controlRef.current = { historial: crearHistorial(initialEntries, initialIndex) }
      }
      return R.React.createElement(
        ReactRouter.MemoryRouter,
        { basename, initialEntries, initialIndex },
        R.React.createElement(SensorDeUbicacion, { control: controlRef.current, origen }),
        children,
      )
    }

  const createBrowserRouter = crearRouterAlias('createBrowserRouter')
  const createHashRouter = crearRouterAlias('createHashRouter')
  const MemoryRouter = crearRouterDeclarativo('MemoryRouter')
  const BrowserRouter = crearRouterDeclarativo('BrowserRouter')
  const HashRouter = crearRouterDeclarativo('HashRouter')

  const crearRouterProvider = (Original) =>
    function RouterProviderEnVivo(propiedades) {
      const router = propiedades.router
      R.React.useLayoutEffect(() => {
        const navegador = activarRouterDatos(router)
        window.__registroRouterEnVivo?.activar(router)
        return () => {
          window.__registroRouterEnVivo?.desactivar(router)
          if (navegadorActivo === navegador) navegadorActivo = null
        }
      }, [router])
      return R.React.createElement(Original, propiedades)
    }

  const RouterProvider = crearRouterProvider(ReactRouter.RouterProvider)
  const RouterProviderDom = crearRouterProvider(ReactRouterDom.RouterProvider)

  const espacios = {
    'react-router': Object.freeze({
      ...ReactRouter,
      createMemoryRouter,
      createBrowserRouter,
      createHashRouter,
      MemoryRouter,
      BrowserRouter,
      HashRouter,
      RouterProvider,
    }),
    'react-router/dom': Object.freeze({ ...ReactRouterDom, RouterProvider: RouterProviderDom }),
  }

  const prepararCarga = (carga) => {
    cargaPendiente = carga
    if (typeof carga === 'string') ultimaUrlCargada = carga
    else if (carga && typeof carga.url === 'string') ultimaUrlCargada = carga.url
  }
  const capturarCarga = (accion, url) => {
    if (navegadorActivo && navegadorActivo.capturarCarga) {
      return navegadorActivo.capturarCarga(accion, url)
    }
    if (
      cargaPendiente &&
      typeof cargaPendiente === 'object' &&
      Array.isArray(cargaPendiente.entradas)
    ) {
      const entradas = [...cargaPendiente.entradas]
      let indice = cargaPendiente.indice
      if (accion === 'ir') {
        entradas.splice(indice + 1)
        entradas.push(url)
        indice = entradas.length - 1
      } else {
        entradas[indice] = url
      }
      return { url, entradas, indice }
    }
    return { url, entradas: [url], indice: 0 }
  }
  const reiniciar = () => {
    window.__registroRouterEnVivo?.reiniciar()
    for (const router of [...routersDatos]) router.dispose()
    routersDatos.clear()
    navegadoresDatos.clear()
    navegadorActivo = null
    ultimoMensaje = ''
    avisados.clear()
  }

  const recibirMensaje = (evento) => {
    if (evento.source !== parent) return
    const mensaje = evento.data
    if (!mensaje || mensaje.canal !== 'react-en-vivo' || mensaje.tipo !== 'navegador') return
    if (mensaje.accion === 'atras') {
      if (navegadorActivo && navegadorActivo.puedeAtras()) navegadorActivo.navegar(-1)
      return
    }
    if (mensaje.accion === 'adelante') {
      if (navegadorActivo && navegadorActivo.puedeAdelante()) navegadorActivo.navegar(1)
      return
    }
    if (mensaje.accion === 'recargar') {
      window.__recargarAppReactEnVivo(ultimaUrlCargada, 'recargar')
      return
    }
    if (
      mensaje.accion === 'ir' &&
      typeof mensaje.url === 'string' &&
      mensaje.url.length <= 200 &&
      /^\/(?!\/)\S*$/.test(mensaje.url)
    ) {
      window.__recargarAppReactEnVivo(mensaje.url, 'ir')
    }
  }

  window.__routerEnVivo = {
    espacios,
    prepararCarga,
    capturarCarga,
    reiniciar,
    desmontar: () => {
      reiniciar()
      window.removeEventListener('message', recibirMensaje)
    },
    navegador: () => navegadorActivo,
  }

  window.addEventListener('message', recibirMensaje)
})()
