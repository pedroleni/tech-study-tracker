export type Fichero = 'index.html' | 'estilos.css'
export type Nivel = 'error' | 'aviso'
export type Panel = 'problemas' | 'recorrido' | 'correccion'

/**
 * Selector de lo que el navegador hace alcanzable con el tabulador por sí solo,
 * sin que nadie tenga que añadir nada. Es el mismo de LaboratorioFoco: las dos
 * variantes cuentan la misma lección y tienen que coincidir en los hechos.
 */
export const ENFOCABLES_V1 =
  'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'

export const HTML_INICIAL_V1 = `<body>
  <nav>
    <a href="/">Inicio</a>
    <a href="/precios">Precios</a>
  </nav>

  <main>
    <h1>Suscríbete al boletín</h1>
    <p>Un correo al mes. Nada más.</p>

    <input type="email" placeholder="tu@correo.com">

    <!-- Parece un botón, se pinta como un botón... pero es un div. -->
    <div class="boton" onclick="enviar()">Enviar</div>

    <button class="secundario">Cancelar</button>
  </main>
</body>`

export const CSS_INICIAL_V1 = `body {
  font-family: system-ui, sans-serif;
  color: #0f172a;
  padding: 20px;
}

nav a {
  color: #1d4ed8;
  margin-right: 12px;
}

h1 { font-size: 20px; margin: 18px 0 4px; }
p  { color: #475569; margin: 0 0 16px; }

input {
  width: 220px;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.boton {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 6px;
  background: #2563eb;
  color: #ffffff;
  cursor: pointer;
}

.boton:hover {
  background: #1d4ed8;
}

.secundario {
  padding: 8px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
}`

/**
 * Defensa en profundidad dentro de la vista previa: el `sandbox=""` del iframe
 * ya impide ejecutar scripts, y esta política impide además cualquier petición
 * de red (una `url()` en el CSS del usuario revelaría su IP a un tercero).
 */
export const META_SEGURIDAD_V1 = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:;">`

/**
 * Subrayado de editor sobre la propia página: marca lo que responde al ratón
 * pero no al teclado. Es una aproximación en CSS de dos reglas del panel de
 * problemas —el CSS no puede comprobar si un `label` apunta a un `id`—, así que
 * la lista de abajo manda sobre lo que se ve aquí.
 */
export const CAPA_PROBLEMAS_V1 = `<style>
  [onclick]:not(${ENFOCABLES_V1}), [role="button"]:not(${ENFOCABLES_V1}) {
    position: relative;
    outline: 2px dashed #dc2626;
    outline-offset: 3px;
    text-decoration: underline wavy #dc2626 2px;
    text-underline-offset: 5px;
  }
  [onclick]:not(${ENFOCABLES_V1})::after, [role="button"]:not(${ENFOCABLES_V1})::after {
    content: "error: el tabulador no llega";
    position: absolute; left: 50%; top: -11px; transform: translateX(-50%);
    background: #dc2626; color: #ffffff; white-space: nowrap;
    font: bold 10px/16px ui-monospace, monospace;
    padding: 0 6px; border-radius: 3px;
  }
  input:not([id]):not([aria-label]):not([aria-labelledby]):not([title]):not([type="hidden"]):not([type="submit"]) {
    outline: 2px dotted #b45309;
    outline-offset: 3px;
  }
</style>`

/** Numera, sobre la página, lo que el tabulador alcanza y en qué orden. */
export const CAPA_TABULACION_V1 = `<style>
  body { counter-reset: orden; }
  ${ENFOCABLES_V1} {
    counter-increment: orden;
    outline: 2px solid #2563eb;
    outline-offset: 3px;
    position: relative;
  }
  a[href]::before, button::before, select::before, textarea::before {
    content: counter(orden);
    position: absolute; top: -9px; left: -9px;
    background: #2563eb; color: #ffffff; text-align: center;
    font: bold 10px/16px ui-monospace, monospace;
    min-width: 16px; height: 16px; border-radius: 999px;
  }
</style>`

export type CorreccionV1 = { fichero: Fichero; buscar: string; reemplazar: string }

/**
 * La corrección que aplica el botón «Aplicar corrección», expresada como
 * sustituciones de texto: así el botón solo se ofrece mientras el fragmento
 * original siga ahí, y nunca reescribe lo que haya cambiado el usuario.
 */
export const CORRECCIONES_V1: CorreccionV1[] = [
  {
    fichero: 'index.html',
    buscar: '    <input type="email" placeholder="tu@correo.com">',
    reemplazar:
      '    <label for="correo">Tu correo electrónico</label>\n' +
      '    <input id="correo" type="email" placeholder="tu@correo.com">',
  },
  {
    fichero: 'index.html',
    buscar:
      '    <!-- Parece un botón, se pinta como un botón... pero es un div. -->\n' +
      '    <div class="boton" onclick="enviar()">Enviar</div>',
    reemplazar: '    <button class="boton" type="submit">Enviar</button>',
  },
  {
    fichero: 'estilos.css',
    buscar: '.boton {\n  display: inline-block;',
    reemplazar: '.boton {\n  display: inline-block;\n  border: 0;\n  font: inherit;',
  },
  {
    fichero: 'estilos.css',
    buscar: '.boton:hover {\n  background: #1d4ed8;\n}',
    reemplazar:
      '.boton:hover {\n  background: #1d4ed8;\n}\n\n' +
      '.boton:focus-visible {\n  outline: 3px solid #0f172a;\n  outline-offset: 2px;\n}',
  },
]

export const HTML_CORREGIDO_V1 = `<label for="correo">Tu correo electrónico</label>
<input id="correo" type="email" placeholder="tu@correo.com">

<button class="boton" type="submit">Enviar</button>`

export const CSS_CORREGIDO_V1 = `.boton {
  border: 0;
  font: inherit;
}

.boton:focus-visible {
  outline: 3px solid #0f172a;
  outline-offset: 2px;
}`
