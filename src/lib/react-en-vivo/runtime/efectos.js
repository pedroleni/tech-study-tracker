// Registro de useEffect, useLayoutEffect y useInsertionEffect para los
// ejercicios. Es una IIFE sin dependencias porque se incrusta como texto en
// el srcdoc. El registro es auxiliar: si falla, los efectos reales continúan.
;(() => {
  const enviar = (datos) => {
    try {
      window.__enviarReactEnVivo(datos)
    } catch {
      // Un panel roto nunca impide que React ejecute el efecto del alumno.
    }
  }

  const numeroCommit = () => {
    try {
      const numero = window.__numeroCommitReactEnVivo()
      return Number.isInteger(numero) && numero >= 0 ? numero : 0
    } catch {
      return 0
    }
  }

  const cola = []
  let vaciadoProgramado = false

  const vaciar = () => {
    vaciadoProgramado = false
    const tanda = cola.splice(0)
    try {
      const efectosPosteriores = new Set()
      for (let indice = tanda.length - 1; indice >= 0; indice -= 1) {
        const entrada = tanda[indice]
        if (entrada.mensaje.accion === 'efecto') efectosPosteriores.add(entrada.estado)
        else if (!efectosPosteriores.has(entrada.estado)) entrada.mensaje.motivo = 'desmontaje'
      }
      for (const entrada of tanda) enviar(entrada.mensaje)
    } catch {
      // Un fallo al preparar el registro tampoco alcanza los efectos reales.
    }
  }

  const encolar = (estado, mensaje) => {
    try {
      cola.push({ estado, mensaje })
      if (vaciadoProgramado) return
      vaciadoProgramado = true
      if (typeof queueMicrotask === 'function') queueMicrotask(vaciar)
      else Promise.resolve().then(vaciar)
    } catch {
      vaciadoProgramado = false
    }
  }

  const limitar = (valor, maximo) => String(valor).slice(0, maximo)

  const valorCorto = (valor) => {
    let texto
    try {
      if (typeof valor === 'string') texto = JSON.stringify(valor)
      else if (typeof valor === 'bigint') texto = String(valor) + 'n'
      else if (typeof valor === 'symbol') texto = String(valor)
      else if (typeof valor === 'function') texto = 'ƒ ' + (valor.name || 'anónima') + '()'
      else texto = JSON.stringify(valor)
    } catch {
      try {
        texto = String(valor)
      } catch {
        texto = '[valor]'
      }
    }
    if (texto === undefined) texto = String(valor)
    return limitar(texto, 80)
  }

  const nombreDeMarco = (nombre) => {
    if (!nombre) return undefined
    const limpio = nombre.replace(/^async\s+/, '').replace(/\s+\[as [^\]]+\]$/, '')
    return limpio.split('.').at(-1)
  }

  const marcosDelAlumno = (pila, modulos) => {
    const marcos = []
    for (const linea of String(pila || '').split('\n')) {
      let coincidencia = /^\s*at\s+(.+?)\s+\((.+\.jsx):(\d+):(\d+)\)\s*$/.exec(linea)
      if (!coincidencia) {
        const anonimo = /^\s*at\s+(.+\.jsx):(\d+):(\d+)\s*$/.exec(linea)
        if (anonimo) coincidencia = ['', '', anonimo[1], anonimo[2], anonimo[3]]
      }
      if (!coincidencia) {
        const firefox = /^(.*?)@(.+\.jsx):(\d+):(\d+)\s*$/.exec(linea)
        if (firefox) coincidencia = ['', firefox[1], firefox[2], firefox[3], firefox[4]]
      }
      if (!coincidencia) continue
      const archivo = coincidencia[2].split('/').at(-1)
      if (!archivo || !Object.prototype.hasOwnProperty.call(modulos, './' + archivo)) continue
      marcos.push({
        nombre: nombreDeMarco(coincidencia[1]),
        archivo,
        linea: Math.max(1, Number(coincidencia[3]) - 2),
      })
    }
    return marcos
  }

  const dividirNivelSuperior = (codigo) => {
    const partes = []
    let inicio = 0
    let parentesis = 0
    let corchetes = 0
    let llaves = 0
    let cadena = null
    let escape = false
    let comentarioLinea = false
    let comentarioBloque = false

    for (let indice = 0; indice < codigo.length; indice += 1) {
      const caracter = codigo[indice]
      const siguiente = codigo[indice + 1]
      if (comentarioLinea) {
        if (caracter === '\n') comentarioLinea = false
        continue
      }
      if (comentarioBloque) {
        if (caracter === '*' && siguiente === '/') {
          comentarioBloque = false
          indice += 1
        }
        continue
      }
      if (cadena) {
        if (escape) escape = false
        else if (caracter === '\\') escape = true
        else if (caracter === cadena) cadena = null
        continue
      }
      if (caracter === '/' && siguiente === '/') {
        comentarioLinea = true
        indice += 1
        continue
      }
      if (caracter === '/' && siguiente === '*') {
        comentarioBloque = true
        indice += 1
        continue
      }
      if (caracter === '"' || caracter === "'" || caracter === '`') {
        cadena = caracter
        continue
      }
      if (caracter === '(') parentesis += 1
      else if (caracter === ')') parentesis -= 1
      else if (caracter === '[') corchetes += 1
      else if (caracter === ']') corchetes -= 1
      else if (caracter === '{') llaves += 1
      else if (caracter === '}') llaves -= 1
      else if (caracter === ',' && parentesis === 0 && corchetes === 0 && llaves === 0) {
        partes.push(codigo.slice(inicio, indice).trim())
        inicio = indice + 1
      }
    }
    partes.push(codigo.slice(inicio).trim())
    return partes
  }

  const argumentosDeLlamada = (codigo, apertura) => {
    let parentesis = 1
    let corchetes = 0
    let llaves = 0
    let cadena = null
    let escape = false
    let comentarioLinea = false
    let comentarioBloque = false
    const partes = []
    let inicio = apertura + 1

    for (let indice = apertura + 1; indice < codigo.length; indice += 1) {
      const caracter = codigo[indice]
      const siguiente = codigo[indice + 1]
      if (comentarioLinea) {
        if (caracter === '\n') comentarioLinea = false
        continue
      }
      if (comentarioBloque) {
        if (caracter === '*' && siguiente === '/') {
          comentarioBloque = false
          indice += 1
        }
        continue
      }
      if (cadena) {
        if (escape) escape = false
        else if (caracter === '\\') escape = true
        else if (caracter === cadena) cadena = null
        continue
      }
      if (caracter === '/' && siguiente === '/') {
        comentarioLinea = true
        indice += 1
        continue
      }
      if (caracter === '/' && siguiente === '*') {
        comentarioBloque = true
        indice += 1
        continue
      }
      if (caracter === '"' || caracter === "'" || caracter === '`') {
        cadena = caracter
        continue
      }
      if (caracter === '(') parentesis += 1
      else if (caracter === ')') {
        parentesis -= 1
        if (parentesis === 0) {
          partes.push(codigo.slice(inicio, indice).trim())
          return partes
        }
      } else if (caracter === '[') corchetes += 1
      else if (caracter === ']') corchetes -= 1
      else if (caracter === '{') llaves += 1
      else if (caracter === '}') llaves -= 1
      else if (caracter === ',' && parentesis === 1 && corchetes === 0 && llaves === 0) {
        partes.push(codigo.slice(inicio, indice).trim())
        inicio = indice + 1
      }
    }
    return []
  }

  const nombresDeDependencias = (modulos, ubicacion, clase, cantidad) => {
    const reservas = Array.from({ length: cantidad }, (_, indice) => 'dependencia ' + (indice + 1))
    const codigo = modulos['./' + ubicacion.archivo]
    if (typeof codigo !== 'string') return reservas
    const lineas = codigo.split('\n')
    const comienzo = lineas.slice(0, ubicacion.linea - 1).reduce((total, linea) => total + linea.length + 1, 0)
    const desdeGancho = codigo.indexOf(clase, comienzo)
    if (desdeGancho === -1) return reservas
    const apertura = codigo.indexOf('(', desdeGancho + clase.length)
    if (apertura === -1) return reservas
    const argumentos = argumentosDeLlamada(codigo, apertura)
    const ultimo = argumentos.at(-1)
    if (!ultimo || !ultimo.startsWith('[') || !ultimo.endsWith(']')) return reservas
    const expresiones = dividirNivelSuperior(ultimo.slice(1, -1))
    if (expresiones.length !== cantidad) return reservas
    return expresiones.map((expresion, indice) =>
      /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(expresion)
        ? limitar(expresion, 40)
        : reservas[indice],
    )
  }

  const ubicar = (pila, modulos, clase, cantidad) => {
    const marcos = marcosDelAlumno(pila, modulos)
    const primero = marcos[0]
    const componente = marcos.find((marco) => /^[A-Z]/.test(marco.nombre || ''))
    const gancho = marcos.find((marco) => /^use[A-Z]/.test(marco.nombre || ''))
    const archivoReserva = Object.keys(modulos).find((ruta) => ruta.endsWith('.jsx'))?.slice(2) || 'App.jsx'
    const ubicacion = {
      componente: limitar(componente?.nombre || 'Componente', 60),
      ...(gancho ? { gancho: limitar(gancho.nombre, 60) } : {}),
      archivo: primero?.archivo || archivoReserva,
      linea: primero?.linea || 1,
    }
    return {
      ...ubicacion,
      nombres: nombresDeDependencias(modulos, ubicacion, clase, cantidad),
    }
  }

  const iguales = (anteriores, actuales) =>
    anteriores.length === actuales.length && actuales.every((valor, indice) => Object.is(valor, anteriores[indice]))

  const envolverGancho = (React, ganchoReal, clase, modulos) => {
    function ganchoEnvuelto(crear, dependencias) {
      // Incondicional y antes del gancho real: conserva el orden de hooks.
      const referencia = React.useRef({ inicializado: false, confirmadas: [], ultimaLimpieza: null })
      const tieneDependencias = Array.isArray(dependencias)
      const actuales = tieneDependencias ? dependencias : []
      const ubicacion = ubicar(new Error().stack, modulos, clase, actuales.length)

      const ejecutar = () => {
        const estado = referencia.current
        const commit = numeroCommit()
        const ultimaLimpieza = estado.ultimaLimpieza
        estado.ultimaLimpieza = null

        let motivo
        let cambios = []
        if (!tieneDependencias) motivo = 'cada-render'
        else if (!estado.inicializado) motivo = 'montaje'
        else if (ultimaLimpieza && ultimaLimpieza.commit === commit && iguales(estado.confirmadas, actuales)) {
          motivo = 'strict-mode'
        } else {
          motivo = 'dependencias'
          cambios = actuales
            .map((valor, indice) => ({
              nombre: ubicacion.nombres[indice] || 'dependencia ' + (indice + 1),
              antes: valorCorto(estado.confirmadas[indice]),
              ahora: valorCorto(valor),
              cambio: !Object.is(valor, estado.confirmadas[indice]),
            }))
            .filter((cambio) => cambio.cambio)
            .slice(0, 8)
            .map(({ nombre, antes, ahora }) => ({ nombre: limitar(nombre, 40), antes, ahora }))
        }

        // Solo se confirman en el commit. Nunca se actualizan durante render.
        estado.confirmadas = actuales.slice()
        estado.inicializado = true
        encolar(estado, {
          tipo: 'efecto',
          componente: ubicacion.componente,
          ...(ubicacion.gancho ? { gancho: ubicacion.gancho } : {}),
          archivo: ubicacion.archivo,
          linea: ubicacion.linea,
          commit,
          accion: 'efecto',
          clase,
          motivo,
          cambios,
        })
        const limpiezaReal = crear()

        return () => {
          const commit = numeroCommit()
          estado.ultimaLimpieza = { commit }
          encolar(estado, {
            tipo: 'efecto',
            componente: ubicacion.componente,
            ...(ubicacion.gancho ? { gancho: ubicacion.gancho } : {}),
            archivo: ubicacion.archivo,
            linea: ubicacion.linea,
            commit,
            accion: 'limpieza',
            clase,
            cambios: [],
          })
          if (typeof limpiezaReal === 'function') return limpiezaReal()
        }
      }

      return tieneDependencias ? ganchoReal(ejecutar, dependencias) : ganchoReal(ejecutar)
    }
    return ganchoEnvuelto
  }

  const envolver = (React, modulos) => {
    try {
      const descriptores = Object.getOwnPropertyDescriptors(React)
      for (const clase of ['useEffect', 'useLayoutEffect', 'useInsertionEffect']) {
        const ganchoReal = React[clase]
        if (typeof ganchoReal !== 'function') continue
        descriptores[clase] = {
          configurable: true,
          enumerable: descriptores[clase]?.enumerable ?? true,
          writable: true,
          value: envolverGancho(React, ganchoReal, clase, modulos),
        }
      }
      return Object.defineProperties(Object.create(Object.getPrototypeOf(React)), descriptores)
    } catch {
      return React
    }
  }

  window.__efectosReactEnVivo = { envolver }
})()
