// Puente entre el código del alumno, dentro del iframe aislado de
// react-en-vivo, y la lección. Corre ANTES de cargar React: el hook de
// DevTools tiene que existir cuando react-dom arranca. Se incrusta en el
// srcdoc como texto (documento.ts lo importa con ?raw), nunca como módulo.
;(() => {
  const enviar = (datos) => parent.postMessage({ canal: 'react-en-vivo', ...datos }, '*')
  window.__enviarReactEnVivo = enviar
  let commits = 0
  const avisarCommit = () => {
    commits += 1
    enviar({ tipo: 'commit', numero: commits })
  }
  // Si la extensión React DevTools ya inyectó su hook, se encadena en vez de sustituirlo.
  const existente = window.__REACT_DEVTOOLS_GLOBAL_HOOK__
  if (existente && typeof existente.onCommitFiberRoot === 'function') {
    const original = existente.onCommitFiberRoot
    existente.onCommitFiberRoot = function (...args) {
      avisarCommit()
      return original.apply(this, args)
    }
  } else {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      supportsFiber: true,
      renderers: new Map(),
      inject(renderer) {
        const id = this.renderers.size + 1
        this.renderers.set(id, renderer)
        return id
      },
      onCommitFiberRoot: avisarCommit,
      onCommitFiberUnmount() {},
      onPostCommitFiberRoot() {},
      checkDCE() {},
    }
  }
  const aTexto = (valor) => {
    if (typeof valor === 'string') return valor
    if (valor instanceof Error) return valor.message
    try {
      return JSON.stringify(valor) ?? String(valor)
    } catch {
      return String(valor)
    }
  }
  // Los avisos de React usan "%s" constantemente: sin sustituir, serían ilegibles.
  const formatear = (args) => {
    if (typeof args[0] !== 'string') return args.map(aTexto).join(' ')
    const resto = args.slice(1)
    const cuerpo = args[0].replace(/%[sdioOc]/g, (marca) => {
      if (resto.length === 0) return marca
      const valor = resto.shift()
      return marca === '%c' ? '' : aTexto(valor)
    })
    return [cuerpo, ...resto.map(aTexto)].join(' ')
  }
  for (const nivel of ['log', 'info', 'warn', 'error']) {
    const original = console[nivel].bind(console)
    console[nivel] = (...args) => {
      enviar({ tipo: 'consola', nivel, texto: formatear(args).slice(0, 2000), commit: commits })
      original(...args)
    }
  }
  window.addEventListener('error', (evento) =>
    enviar({ tipo: 'error', texto: String(evento.message).slice(0, 2000) }),
  )
  window.addEventListener('unhandledrejection', (evento) => {
    const razon = evento.reason instanceof Error ? evento.reason.message : String(evento.reason)
    enviar({ tipo: 'error', texto: razon.slice(0, 2000) })
  })
  const avisarAlto = () => enviar({ tipo: 'alto', alto: document.documentElement.scrollHeight })
  if (typeof ResizeObserver === 'function') new ResizeObserver(avisarAlto).observe(document.documentElement)
  window.addEventListener('load', avisarAlto)
})()
