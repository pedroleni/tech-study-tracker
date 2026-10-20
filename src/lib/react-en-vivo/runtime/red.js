// API simulada para los ejercicios de React. Se instala después de dejar la
// configuración del documento y antes de evaluar cualquier módulo del alumno,
// de modo que también intercepta los fetch hechos en el nivel del módulo.
// Es una IIFE sin dependencias porque se incrusta como texto en el srcdoc.
;(() => {
  try {
    const configuracion = window.__configReactEnVivo
    if (!configuracion || !configuracion.api) return

    const enviar = (datos) => {
      try {
        window.__enviarReactEnVivo(datos)
      } catch {
        // El registro de red es auxiliar: nunca rompe la petición del alumno.
      }
    }
    const responderJson = (datos, estado = 200) =>
      new Response(JSON.stringify(datos), {
        status: estado,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      })
    const error = (mensaje, estado) => responderJson({ error: mensaje }, estado)
    const tiene = (objeto, clave) => Object.prototype.hasOwnProperty.call(objeto, clave)
    const copiar = (valor) => JSON.parse(JSON.stringify(valor))
    const datos = copiar(configuracion.api)
    const fetchOriginal = window.fetch
    let latencia = 600
    let desordenar = false
    let debeFallar = false
    let numeroPeticion = 0

    const configurar = (opciones) => {
      if (!opciones || !Number.isInteger(opciones.latencia)) return
      if (opciones.latencia < 0 || opciones.latencia > 3000) return
      if (typeof opciones.desordenar !== 'boolean') return
      latencia = opciones.latencia
      desordenar = opciones.desordenar
    }
    configurar(configuracion.red || { latencia: 600, desordenar: false })

    const fallarSiguiente = () => {
      debeFallar = true
    }
    window.__redReactEnVivo = { configurar, fallarSiguiente }

    const normalizar = (valor) =>
      String(valor)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('es')

    const leerCuerpo = async (entrada, opciones) => {
      let cuerpo = opciones && opciones.body
      if (cuerpo === undefined && typeof Request === 'function' && entrada instanceof Request) {
        cuerpo = await entrada.clone().text()
      }
      if (typeof cuerpo !== 'string') throw new SyntaxError('El cuerpo no es JSON')
      const valor = JSON.parse(cuerpo)
      if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
        throw new SyntaxError('El cuerpo no es un objeto JSON')
      }
      return valor
    }

    const buscarColeccion = (nombre) => (tiene(datos, nombre) ? datos[nombre] : null)

    const ejecutar = async (ruta, metodo, entrada, opciones, falloForzado) => {
      if (falloForzado) return error('Error del servidor (simulado)', 500)

      const separador = ruta.indexOf('?')
      const camino = separador === -1 ? ruta : ruta.slice(0, separador)
      const consulta = separador === -1 ? '' : ruta.slice(separador + 1)
      let partes
      try {
        partes = camino
          .slice('/api/'.length)
          .split('/')
          .filter(Boolean)
          .map((parte) => decodeURIComponent(parte))
      } catch {
        return error('Ruta no válida', 404)
      }
      const [nombre, id, ...resto] = partes
      const coleccion = nombre && resto.length === 0 ? buscarColeccion(nombre) : null
      if (!coleccion) return error('Colección no encontrada', 404)

      if (metodo === 'GET' && id === undefined) {
        let resultado = coleccion.map(copiar)
        const parametros = new URLSearchParams(consulta)
        const busqueda = parametros.get('q')
        if (busqueda) {
          const termino = normalizar(busqueda)
          resultado = resultado.filter((registro) =>
            Object.values(registro).some(
              (valor) => typeof valor === 'string' && normalizar(valor).includes(termino),
            ),
          )
        }
        const limiteTexto = parametros.get('_limite')
        if (limiteTexto !== null && /^\d+$/.test(limiteTexto)) {
          resultado = resultado.slice(0, Number(limiteTexto))
        }
        return responderJson(resultado)
      }

      const indice = id === undefined ? -1 : coleccion.findIndex((registro) => String(registro.id) === id)
      if (metodo === 'GET') {
        return indice === -1
          ? error('Registro no encontrado', 404)
          : responderJson(copiar(coleccion[indice]))
      }

      if (metodo === 'POST' && id === undefined) {
        let cuerpo
        try {
          cuerpo = await leerCuerpo(entrada, opciones)
        } catch {
          return error('El cuerpo debe ser JSON válido', 400)
        }
        const idsDeTexto = coleccion.some((registro) => typeof registro.id === 'string')
        const nuevoId = idsDeTexto
          ? window.crypto.randomUUID()
          : coleccion.reduce(
              (mayor, registro) =>
                typeof registro.id === 'number' && registro.id > mayor ? registro.id : mayor,
              0,
            ) + 1
        const nuevo = { ...cuerpo, id: nuevoId }
        coleccion.push(nuevo)
        return responderJson(copiar(nuevo), 201)
      }

      if (indice === -1) return error('Registro no encontrado', 404)

      if (metodo === 'PUT' || metodo === 'PATCH') {
        let cuerpo
        try {
          cuerpo = await leerCuerpo(entrada, opciones)
        } catch {
          return error('El cuerpo debe ser JSON válido', 400)
        }
        const idExistente = coleccion[indice].id
        const siguiente =
          metodo === 'PUT'
            ? { ...cuerpo, id: idExistente }
            : { ...coleccion[indice], ...cuerpo, id: idExistente }
        coleccion[indice] = siguiente
        return responderJson(copiar(siguiente))
      }

      if (metodo === 'DELETE') {
        const [eliminado] = coleccion.splice(indice, 1)
        return responderJson(copiar(eliminado))
      }

      return error('Método no permitido', 405)
    }

    window.fetch = function (entrada, opciones) {
      const ruta =
        typeof entrada === 'string'
          ? entrada
          : entrada && typeof entrada.url === 'string'
            ? entrada.url
            : String(entrada)
      if (!ruta.startsWith('/api/')) return fetchOriginal.apply(this, arguments)

      numeroPeticion += 1
      const id = numeroPeticion
      const metodo = String(
        (opciones && opciones.method) ||
          (entrada && typeof entrada === 'object' && entrada.method) ||
          'GET',
      ).toUpperCase()
      const rutaMensaje = ruta.slice(0, 200)
      const inicio = performance.now()
      const falloForzado = debeFallar
      debeFallar = false
      enviar({ tipo: 'peticion', id, metodo, ruta: rutaMensaje, estado: 'pendiente' })

      const multiplicador = desordenar ? (id % 2 === 1 ? 2 : 0.5) : 1
      const espera = latencia * multiplicador
      const senal = opciones && opciones.signal

      return new Promise((resolver, rechazar) => {
        let temporizador
        let terminada = false
        const limpiar = () => {
          if (temporizador !== undefined) clearTimeout(temporizador)
          if (senal) senal.removeEventListener('abort', cancelar)
        }
        const duracion = () => Math.max(0, Math.round(performance.now() - inicio))
        const cancelar = () => {
          if (terminada) return
          terminada = true
          limpiar()
          enviar({ tipo: 'peticion', id, metodo, ruta: rutaMensaje, estado: 'cancelada', ms: duracion() })
          rechazar(new DOMException('The operation was aborted.', 'AbortError'))
        }

        if (senal && senal.aborted) {
          cancelar()
          return
        }
        if (senal) senal.addEventListener('abort', cancelar, { once: true })
        temporizador = setTimeout(async () => {
          if (terminada) return
          terminada = true
          limpiar()
          let respuesta
          try {
            respuesta = await ejecutar(ruta, metodo, entrada, opciones || {}, falloForzado)
          } catch {
            respuesta = error('Error del servidor (simulado)', 500)
          }
          const estado = respuesta.ok ? 'ok' : 'error'
          enviar({
            tipo: 'peticion',
            id,
            metodo,
            ruta: rutaMensaje,
            estado,
            codigo: respuesta.status,
            ms: duracion(),
          })
          resolver(respuesta)
        }, espera)
      })
    }

    window.addEventListener('message', (evento) => {
      if (evento.source !== parent) return
      const mensaje = evento.data
      if (!mensaje || mensaje.canal !== 'react-en-vivo') return
      if (mensaje.tipo === 'red') configurar(mensaje)
      if (mensaje.tipo === 'fallar-siguiente') fallarSiguiente()
    })
  } catch {
    // Si la API no puede instalarse, el resto de la app del alumno sigue vivo.
  }
})()
