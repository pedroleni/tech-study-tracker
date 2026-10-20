// Puente entre el código del alumno, dentro del iframe aislado de
// react-en-vivo, y la lección. Corre ANTES de cargar React: el hook de
// DevTools tiene que existir cuando react-dom arranca. Se incrusta en el
// srcdoc como texto (documento.ts lo importa con ?raw), nunca como módulo.
;(() => {
  const enviar = (datos) => parent.postMessage({ canal: 'react-en-vivo', ...datos }, '*')
  window.__enviarReactEnVivo = enviar
  let commits = 0
  const avisarCommit = (raiz) => {
    commits += 1
    enviar({ tipo: 'commit', numero: commits })
    // El árbol de renders (fase 2) solo existe si la vista previa lo pidió
    // (runtime/arbol.js). Un fallo suyo nunca puede romper la app del alumno.
    if (typeof window.__arbolReactEnVivo === 'function') {
      try {
        window.__arbolReactEnVivo(raiz, commits)
      } catch {
        // El panel se queda en el commit anterior; la vista previa sigue.
      }
    }
  }
  // Si la extensión React DevTools ya inyectó su hook, se encadena en vez de sustituirlo.
  const existente = window.__REACT_DEVTOOLS_GLOBAL_HOOK__
  if (existente && typeof existente.onCommitFiberRoot === 'function') {
    const original = existente.onCommitFiberRoot
    existente.onCommitFiberRoot = function (...args) {
      avisarCommit(args[1])
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
      onCommitFiberRoot: (_renderer, raiz) => avisarCommit(raiz),
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
  // El sandbox no permite ventanas modales (sin allow-modals): alert() no
  // haría nada y el alumno creería que su onClick no funciona. Se muestran
  // como un aviso dentro de la vista previa y en la consola. confirm()
  // responde siempre "aceptar"; prompt(), su valor por defecto o "".
  const avisar = (tipo, mensaje) => {
    const texto = mensaje === undefined ? '' : String(mensaje)
    enviar({ tipo: 'consola', nivel: 'info', texto: (tipo + ': ' + texto).slice(0, 2000), commit: commits })
    const aviso = document.createElement('div')
    aviso.textContent = texto
    Object.assign(aviso.style, {
      position: 'fixed',
      top: '8px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '2147483647',
      maxWidth: '90%',
      padding: '8px 12px',
      borderRadius: '8px',
      background: '#1f2937',
      color: '#ffffff',
      font: '14px system-ui, sans-serif',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      pointerEvents: 'none',
    })
    ;(document.body || document.documentElement).append(aviso)
    setTimeout(() => aviso.remove(), 3000)
  }
  window.alert = (mensaje) => avisar('alert', mensaje)
  window.confirm = (mensaje) => {
    avisar('confirm', mensaje)
    return true
  }
  window.prompt = (mensaje, valor) => {
    avisar('prompt', mensaje)
    return valor === undefined ? '' : String(valor)
  }
  window.addEventListener('error', (evento) =>
    enviar({ tipo: 'error', texto: String(evento.message).slice(0, 2000) }),
  )
  window.addEventListener('unhandledrejection', (evento) => {
    const razon = evento.reason instanceof Error ? evento.reason.message : String(evento.reason)
    enviar({ tipo: 'error', texto: razon.slice(0, 2000) })
  })
  // La altura del contenido, no scrollHeight: scrollHeight nunca baja de la
  // altura actual del iframe, y una vista previa corta no podría encogerse.
  const avisarAlto = () =>
    enviar({ tipo: 'alto', alto: Math.ceil(document.documentElement.getBoundingClientRect().height) })
  if (typeof ResizeObserver === 'function') new ResizeObserver(avisarAlto).observe(document.documentElement)
  window.addEventListener('load', avisarAlto)
})()
