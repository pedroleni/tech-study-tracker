/** Lo que el navegador mete en el recorrido del tabulador sin que nadie añada nada. */
export const ENFOCABLES_V4 =
  'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'

/** Elementos que parecen pulsables pero se quedan fuera de ese recorrido. */
export const SELECTOR_TRAMPAS_V4 =
  `[onclick]:not(${ENFOCABLES_V4}), [role="button"]:not(${ENFOCABLES_V4})`

/** Puntos de referencia que un lector de pantalla puede listar, y cómo los anuncia. */
export const REGIONES_V4: Record<string, string> = {
  header: 'banner',
  nav: 'navegación',
  main: 'principal',
  aside: 'complementaria',
  footer: 'pie de página',
  form: 'formulario',
  section: 'región',
}

export const SELECTOR_REGIONES_V4 =
  'header, nav, main, aside, footer, form, section[aria-label], section[aria-labelledby]'
export const SELECTOR_ENCABEZADOS_V4 = 'h1, h2, h3, h4, h5, h6'

export type IdCapaV4 = 'regiones' | 'foco' | 'encabezados' | 'nombres'
export type CapaV4 = {
  id: IdCapaV4
  nombre: string
  /** Color de la línea. Es el mismo dentro del iframe y en la leyenda de fuera. */
  color: string
  /** Fondo de los rótulos: más oscuro, para que el texto blanco pase de 4.5:1. */
  rotulo: string
  /**
   * Canal visual que ocupa la capa. Es la clave de esta variante: dos capas
   * encendidas a la vez no se tapan porque no dibujan sobre lo mismo.
   */
  canal: string
  explicacion: string
}

/*
  El reparto de canales, que es el problema de diseño de esta variante:

    capa           forma                         esquina del rótulo
    ─────────────  ────────────────────────────  ──────────────────────
    regiones       relleno + línea interior      superior derecha
    foco           contorno exterior             superior izquierda
    trampas        contorno exterior discontinuo inferior izquierda
    encabezados    raíl en el borde izquierdo    encima, a la izquierda
    nombres        trama diagonal de fondo       inferior derecha

  Ninguna capa usa la propiedad CSS de otra (unas pintan `outline`, otras
  `box-shadow`, otras `background-image`), y cada rótulo tiene su esquina
  reservada. Por eso se pueden encender las cuatro sin que el resultado sea
  un amasijo. Los conjuntos de elementos tampoco se cruzan: un punto de
  referencia no es un encabezado, y un encabezado no es enfocable.
*/
export const CAPAS_V4: readonly CapaV4[] = [
  {
    id: 'regiones',
    nombre: 'Regiones',
    color: '#8b5cf6',
    rotulo: '#6d28d9',
    canal: 'relleno + esquina superior derecha',
    explicacion: 'Las zonas a las que un lector de pantalla puede saltar directamente.',
  },
  {
    id: 'foco',
    nombre: 'Recorrido del foco',
    color: '#3b82f6',
    rotulo: '#1d4ed8',
    canal: 'contorno exterior + esquina superior izquierda',
    explicacion: 'Por dónde pasa el tabulador, en orden, y qué se queda fuera.',
  },
  {
    id: 'encabezados',
    nombre: 'Encabezados',
    color: '#0d9488',
    rotulo: '#0f766e',
    canal: 'raíl izquierdo + rótulo encima',
    explicacion: 'El índice de la página: los niveles y los huecos entre ellos.',
  },
  {
    id: 'nombres',
    nombre: 'Nombres accesibles',
    color: '#d97706',
    rotulo: '#b45309',
    canal: 'trama diagonal + esquina inferior derecha',
    explicacion: 'Controles que se anuncian mal o no se anuncian de ninguna manera.',
  },
]

export const COLOR_TRAMPA_V4 = '#dc2626'
export const ROTULO_TRAMPA_V4 = '#b91c1c'
export type IdPresetV4 = 'formulario' | 'pagina'

/* El primer ejemplo es, palabra por palabra, el de LaboratorioFoco: las cinco
   variantes tienen que poder compararse contando la misma historia. */
export const HTML_FORMULARIO_V4 = `<style>
  body { font-family: system-ui; padding: 16px; }
  .boton {
    background: #2563eb; color: white; padding: 8px 16px;
    border-radius: 6px; display: inline-block; cursor: pointer;
  }
</style>

<body>
  <nav>
    <a href="/">Inicio</a>
    <a href="/precios">Precios</a>
  </nav>

  <main>
    <h1>Suscríbete</h1>
    <input type="email" placeholder="tu@correo.com">

    <!-- Parece un botón. Se comporta como un botón. No es un botón. -->
    <div class="boton" onclick="enviar()">Enviar</div>

    <button>Cancelar</button>
  </main>
</body>`

/* El segundo es el mismo formulario dentro de una página entera, para que las
   cuatro capas tengan algo que enseñar a la vez. */
export const HTML_PAGINA_V4 = `<style>
  body { font-family: system-ui; margin: 0; color: #18181b; }
  header {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; padding: 12px 20px; background: #f4f4f5;
  }
  nav a { margin-left: 12px; color: #1d4ed8; }
  main { padding: 20px; }
  form { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  aside { margin: 0 20px 20px; padding: 12px 16px; background: #fef3c7; }
  footer { padding: 12px 20px; background: #f4f4f5; font-size: 13px; }
  .campo { width: 200px; padding: 8px 10px; border: 1px solid #d4d4d8; border-radius: 6px; }
  .boton {
    background: #2563eb; color: white; padding: 8px 16px;
    border-radius: 6px; display: inline-block; cursor: pointer;
  }
  .icono { border: 0; background: #e4e4e7; border-radius: 6px; padding: 9px 12px; cursor: pointer; }
</style>

<body>
  <header>
    <strong>Boletín semanal</strong>
    <nav>
      <a href="/">Inicio</a>
      <a href="/archivo">Archivo</a>
    </nav>
  </header>

  <main>
    <h1>Suscríbete</h1>
    <p>Un correo cada viernes. Sin ruido.</p>

    <form>
      <input class="campo" type="email" placeholder="tu@correo.com">

      <!-- Parece un botón. Se comporta como un botón. No es un botón. -->
      <div class="boton" onclick="enviar()">Enviar</div>

      <button class="icono">✕</button>
    </form>

    <h3>Lo que vas a recibir</h3>
    <p>Un resumen, dos enlaces y ninguna promesa.</p>
  </main>

  <aside>
    <p>Ese h3 viene justo detrás de un h1: falta el h2 de en medio.</p>
  </aside>

  <footer>
    <p>© 2026</p>
  </footer>
</body>`

export const PRESETS_V4: readonly { id: IdPresetV4; nombre: string; html: string }[] = [
  { id: 'formulario', nombre: 'Formulario de suscripción', html: HTML_FORMULARIO_V4 },
  { id: 'pagina', nombre: 'La página entera', html: HTML_PAGINA_V4 },
]

export type GravedadV4 = 'ok' | 'aviso' | 'error'
export type HallazgoV4 = {
  /** Selector `:nth-child` exacto del elemento, para poder señalarlo en la página. */
  ruta: string
  etiqueta: string
  texto: string
  detalle: string
  gravedad: GravedadV4
  /** Sangrado del listado; solo lo usan los encabezados. */
  sangria?: number
  /** El HTML del elemento, para enseñarlo resaltado. Solo en las trampas. */
  codigo?: string
}

export type AnalisisV4 = {
  regiones: HallazgoV4[]
  foco: HallazgoV4[]
  trampas: HallazgoV4[]
  encabezados: HallazgoV4[]
  nombres: HallazgoV4[]
}

export const VACIOS_V4: Record<IdCapaV4, string> = {
  regiones:
    'Ninguna. Quien navegue por regiones no puede saltar a ningún sitio: se recorre la página entera, cada vez.',
  foco: 'Nada alcanzable con el teclado. Quien no usa ratón no puede hacer absolutamente nada aquí.',
  encabezados: 'Sin encabezados no hay índice, y sin índice no hay forma de hojear la página.',
  nombres: 'Todos los controles se anuncian con un nombre propio. Así se hace.',
}
