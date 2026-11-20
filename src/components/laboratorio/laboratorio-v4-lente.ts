import {
  CAPAS_V4,
  COLOR_TRAMPA_V4,
  ENFOCABLES_V4,
  REGIONES_V4,
  ROTULO_TRAMPA_V4,
  SELECTOR_ENCABEZADOS_V4,
  SELECTOR_REGIONES_V4,
  SELECTOR_TRAMPAS_V4,
  type AnalisisV4,
  type GravedadV4,
  type IdCapaV4,
} from './laboratorio-v4-datos'

export type OpcionesLenteV4 = {
  capas: Set<IdCapaV4>
  rotulos: boolean
  compacto: boolean
  radiografia: boolean
  seleccion: string | null
}

function color(id: IdCapaV4, campo: 'color' | 'rotulo'): string {
  return CAPAS_V4.find((capa) => capa.id === id)![campo]
}

/** Propiedades comunes de todos los rótulos. Cambian el fondo y la posición. */
function rotulo(fondo: string, posicion: string): string {
  return `  position: absolute;
${posicion}
  z-index: 6;
  background: ${fondo};
  color: #ffffff;
  font: 700 10px/15px ui-sans-serif, system-ui, sans-serif;
  padding: 0 5px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;`
}

function agregarRadiografia(bloques: string[]) {
  bloques.push(`/* Modo radiografía: la página renuncia a su color.
   Solo se tocan color, fondo y borde, así que el contorno (outline), el
   relleno de las capas (box-shadow) y la trama (background-image) sobreviven. */
* {
  color: #3f3f46 !important;
  background-color: transparent !important;
  border-color: #d4d4d8 !important;
  text-shadow: none !important;
}
body { background-color: #ffffff !important; }`)
}

function agregarRegiones(bloques: string[], rotulos: boolean) {
  bloques.push(`/* Capa: regiones. Canal = relleno interior. */
${SELECTOR_REGIONES_V4} {
  position: relative;
  box-shadow: inset 0 0 0 1px ${color('regiones', 'color')},
              inset 0 0 0 9999px ${color('regiones', 'color')}12;
}`)
  if (!rotulos) return

  const contenidos = Object.entries(REGIONES_V4)
    .map(([etiqueta, nombre]) =>
      etiqueta === 'section'
        ? `section[aria-label]::before, section[aria-labelledby]::before { content: "${nombre}"; }`
        : `${etiqueta}::before { content: "${nombre}"; }`
    )
    .join('\n')
  const selectoresRotulo = SELECTOR_REGIONES_V4.split(', ')
    .map((selector) => `${selector}::before`)
    .join(',\n')

  bloques.push(`${contenidos}

${selectoresRotulo} {
${rotulo(color('regiones', 'rotulo'), '  top: 0;\n  right: 0;')}
}

/* Una región dentro de otra saca su rótulo fuera de su propia caja, justo
   debajo — así nunca compite con su propio contenido sea cual sea su
   altura (un <nav> de una sola línea no tiene 16px libres dentro para
   empujar el rótulo sin taparse a sí mismo), y tampoco con el rótulo de
   la región que la contiene, que vive arriba, dentro de su caja. */
:is(${SELECTOR_REGIONES_V4}) :is(${SELECTOR_REGIONES_V4})::before {
  top: 100%;
  margin-top: 2px;
}`)
}

function agregarFoco(bloques: string[], opciones: OpcionesLenteV4) {
  bloques.push(`/* Capa: recorrido del foco. Canal = contorno por fuera. */
body { counter-reset: rx-orden; }

${ENFOCABLES_V4} {
  position: relative;
  counter-increment: rx-orden;
  outline: 2px solid ${color('foco', 'color')};
  outline-offset: 3px;
}

/* Un <input> no admite ::before ni ::after: su número se lee en el panel. */
a[href]::after,
button::after,
select::after,
textarea::after,
[tabindex]:not([tabindex="-1"])::after {
  content: counter(rx-orden);
${rotulo(color('foco', 'rotulo'), '  top: -10px;\n  left: -10px;')}
  min-width: 9px;
  text-align: center;
  border-radius: 999px;
}

/* Parece pulsable y no lo es. */
${SELECTOR_TRAMPAS_V4} {
  position: relative;
  outline: 2px dashed ${COLOR_TRAMPA_V4};
  outline-offset: 3px;
}`)
  if (!opciones.rotulos) return
  const texto = opciones.compacto ? 'sin teclado' : 'el tabulador no llega'
  bloques.push(`${SELECTOR_TRAMPAS_V4.split(', ')
    .map((selector) => `${selector}::after`)
    .join(',\n')} {
  content: "${texto}";
${rotulo(ROTULO_TRAMPA_V4, '  bottom: -9px;\n  left: -2px;')}
}`)
}

function agregarEncabezados(bloques: string[], rotulos: boolean) {
  bloques.push(`/* Capa: encabezados. Canal = raíl en el borde izquierdo. */
${SELECTOR_ENCABEZADOS_V4} {
  position: relative;
  box-shadow: inset 4px 0 0 0 ${color('encabezados', 'color')};
}`)
  if (!rotulos) return
  const contenidos = [1, 2, 3, 4, 5, 6]
    .map((nivel) => `h${nivel}::before { content: "h${nivel}"; }`)
    .join('\n')
  bloques.push(`${contenidos}

/* El rótulo se sube por encima del encabezado, donde suele haber margen. */
${SELECTOR_ENCABEZADOS_V4.split(', ')
  .map((selector) => `${selector}::before`)
  .join(',\n')} {
${rotulo(color('encabezados', 'rotulo'), '  top: 0;\n  left: 0;\n  transform: translateY(-100%);')}
}`)
}

// El nombre accesible no se puede calcular con un selector, así que esta
// capa la dibuja el análisis: una ruta exacta por cada elemento señalado.
function agregarPinturaNombre(
  bloques: string[],
  rutas: string[],
  estilo: { tono: string; fondo: string; texto: string; rotulos: boolean }
) {
  if (rutas.length === 0) return
  bloques.push(`${rutas.join(',\n')} {
  position: relative;
  outline: 2px dotted ${estilo.tono};
  outline-offset: 2px;
  background-image: repeating-linear-gradient(
    135deg, ${estilo.tono}2e 0 5px, transparent 5px 11px
  );
}${
    estilo.rotulos
      ? `

${rutas.map((ruta) => `${ruta}::before`).join(',\n')} {
  content: "${estilo.texto}";
${rotulo(estilo.fondo, '  bottom: 0;\n  right: 0;')}
}`
      : ''
  }`)
}

function rutasPorGravedad(analisis: AnalisisV4, gravedad: GravedadV4): string[] {
  return analisis.nombres
    .filter((hallazgo) => hallazgo.gravedad === gravedad)
    .map((hallazgo) => hallazgo.ruta)
}

function agregarNombres(
  bloques: string[],
  analisis: AnalisisV4,
  opciones: OpcionesLenteV4
) {
  const errores = rutasPorGravedad(analisis, 'error')
  const avisos = rutasPorGravedad(analisis, 'aviso')
  bloques.push('/* Capa: nombres accesibles. Canal = trama diagonal de fondo. */')
  agregarPinturaNombre(bloques, errores, {
    tono: COLOR_TRAMPA_V4,
    fondo: ROTULO_TRAMPA_V4,
    texto: opciones.compacto ? 'sin nombre' : 'sin nombre accesible',
    rotulos: opciones.rotulos,
  })
  agregarPinturaNombre(bloques, avisos, {
    tono: color('nombres', 'color'),
    fondo: color('nombres', 'rotulo'),
    texto: opciones.compacto ? 'frágil' : 'nombre frágil',
    rotulos: opciones.rotulos,
  })
  if (errores.length === 0 && avisos.length === 0) {
    bloques.push('/* Nada que señalar: todos los controles tienen nombre. */')
  }
}

function agregarSeleccion(bloques: string[], seleccion: string) {
  bloques.push(`/* Elemento señalado desde el panel: se apaga todo lo demás.
   La sombra exterior de 9999px hace de foco de teatro; el elemento sube al
   frente para quedar por encima de ella. */
${seleccion} {
  position: relative;
  z-index: 9999;
  outline: 3px solid #f8fafc;
  outline-offset: 4px;
  box-shadow: 0 0 0 9999px rgba(9, 9, 11, 0.66);
}`)
}

/**
 * Construye la lente: la hoja de estilos que se superpone a la página.
 * Nunca interpola texto del usuario, solo nombres de etiqueta y números, así
 * que no hay forma de colar nada por aquí.
 */
export function construirCssLenteV4(
  analisis: AnalisisV4,
  opciones: OpcionesLenteV4
): string {
  const bloques = [
    `/* La lente del escáner. Se inyecta delante del HTML de la página.
   Cada capa pinta con una propiedad distinta y coloca su rótulo en una esquina
   propia: por eso pueden estar todas encendidas sin taparse entre ellas. */`,
  ]
  if (opciones.radiografia) agregarRadiografia(bloques)
  if (opciones.capas.has('regiones')) agregarRegiones(bloques, opciones.rotulos)
  if (opciones.capas.has('foco')) agregarFoco(bloques, opciones)
  if (opciones.capas.has('encabezados')) agregarEncabezados(bloques, opciones.rotulos)
  if (opciones.capas.has('nombres')) agregarNombres(bloques, analisis, opciones)
  if (opciones.seleccion) agregarSeleccion(bloques, opciones.seleccion)
  return bloques.join('\n\n')
}
