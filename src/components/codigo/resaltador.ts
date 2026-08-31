/**
 * Tokenizador propio para HTML, CSS y JavaScript.
 *
 * Es deliberadamente pequeño y sin dependencias: el contenido de esta
 * biblioteca es HTML y CSS, y una gramática completa (TextMate/Lezer) costaría
 * cientos de kilobytes para colorear ejemplos de veinte líneas.
 *
 * Invariante que sostiene todo lo demás y que los tests comprueban:
 * concatenar el `texto` de todos los tokens devuelve EXACTAMENTE el código de
 * entrada. Así nunca se pierde ni se inventa un carácter, ni siquiera con
 * código a medio escribir —que es el estado normal dentro de un editor.
 */

export type Lenguaje = 'html' | 'css' | 'js' | 'sql' | 'texto'

export type TipoToken =
  | 'texto'
  | 'puntuacion'
  | 'etiqueta'
  | 'atributo'
  | 'cadena'
  | 'comentario'
  | 'palabraClave'
  | 'numero'
  | 'funcion'
  | 'selector'
  | 'propiedad'
  | 'valor'
  | 'doctype'

export type Token = {
  tipo: TipoToken
  texto: string
}

export type LineaResaltada = {
  /** Número de línea empezando en 1, como lo cuenta cualquier editor. */
  numero: number
  tokens: Token[]
}

/** Clase CSS de cada tipo de token. Los colores viven en `sintaxis.css`. */
export const CLASES_TOKEN: Record<TipoToken, string> = {
  texto: 'sintaxis-texto',
  puntuacion: 'sintaxis-puntuacion',
  etiqueta: 'sintaxis-etiqueta',
  atributo: 'sintaxis-atributo',
  cadena: 'sintaxis-cadena',
  comentario: 'sintaxis-comentario',
  palabraClave: 'sintaxis-palabra-clave',
  numero: 'sintaxis-numero',
  funcion: 'sintaxis-funcion',
  selector: 'sintaxis-selector',
  propiedad: 'sintaxis-propiedad',
  valor: 'sintaxis-valor',
  doctype: 'sintaxis-doctype',
}

const PALABRAS_CLAVE_JS = new Set([
  'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
  'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'false',
  'finally', 'for', 'from', 'function', 'if', 'import', 'in', 'instanceof', 'let',
  'new', 'null', 'of', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try',
  'typeof', 'undefined', 'var', 'void', 'while', 'with', 'yield',
])

function empujar(salida: Token[], tipo: TipoToken, texto: string) {
  if (texto) salida.push({ tipo, texto })
}

/** Devuelve el índice del final del delimitador, o el final del código si no cierra. */
function hastaCierre(codigo: string, desde: number, cierre: string) {
  const indice = codigo.indexOf(cierre, desde)
  return indice === -1 ? codigo.length : indice + cierre.length
}

// ---------------------------------------------------------------- HTML

const INICIO_ETIQUETA = /^<\/?([a-zA-Z][^\s/>]*)/

function tokenizarEtiqueta(codigo: string, inicio: number, salida: Token[]): number {
  const coincidencia = INICIO_ETIQUETA.exec(codigo.slice(inicio))!
  const esCierre = codigo.startsWith('</', inicio)
  const nombre = coincidencia[1]
  const apertura = esCierre ? '</' : '<'

  empujar(salida, 'puntuacion', apertura)
  empujar(salida, 'etiqueta', nombre)

  let i = inicio + apertura.length + nombre.length
  let esperandoValor = false
  let autoCerrada = false

  while (i < codigo.length) {
    const caracter = codigo[i]

    if (caracter === '>') {
      empujar(salida, 'puntuacion', '>')
      i += 1
      break
    }
    if (caracter === '/' && codigo[i + 1] === '>') {
      empujar(salida, 'puntuacion', '/>')
      i += 2
      autoCerrada = true
      break
    }
    if (/\s/.test(caracter)) {
      const espacios = /^\s+/.exec(codigo.slice(i))![0]
      empujar(salida, 'texto', espacios)
      i += espacios.length
      continue
    }
    if (caracter === '=') {
      empujar(salida, 'puntuacion', '=')
      i += 1
      esperandoValor = true
      continue
    }
    if (caracter === '"' || caracter === "'") {
      const fin = hastaCierre(codigo, i + 1, caracter)
      empujar(salida, 'cadena', codigo.slice(i, fin))
      i = fin
      esperandoValor = false
      continue
    }

    const palabra = /^[^\s=/>'"]+/.exec(codigo.slice(i))
    if (!palabra) {
      empujar(salida, 'texto', caracter)
      i += 1
      continue
    }
    empujar(salida, esperandoValor ? 'cadena' : 'atributo', palabra[0])
    i += palabra[0].length
    esperandoValor = false
  }

  // El contenido de <style> y <script> es texto crudo para el analizador de
  // HTML: se colorea con el tokenizador del lenguaje que toca.
  const minusculas = nombre.toLowerCase()
  if (!esCierre && !autoCerrada && (minusculas === 'style' || minusculas === 'script')) {
    const resto = codigo.slice(i)
    const cierre = new RegExp(`</${minusculas}\\b`, 'i').exec(resto)
    const fin = cierre ? i + cierre.index : codigo.length
    const contenido = codigo.slice(i, fin)
    if (contenido) {
      if (minusculas === 'style') tokenizarCss(contenido, salida)
      else tokenizarJs(contenido, salida)
    }
    i = fin
  }

  return i
}

function tokenizarHtml(codigo: string, salida: Token[]) {
  let i = 0

  while (i < codigo.length) {
    if (codigo.startsWith('<!--', i)) {
      const fin = hastaCierre(codigo, i + 4, '-->')
      empujar(salida, 'comentario', codigo.slice(i, fin))
      i = fin
      continue
    }
    if (codigo.startsWith('<!', i)) {
      const fin = hastaCierre(codigo, i + 2, '>')
      empujar(salida, 'doctype', codigo.slice(i, fin))
      i = fin
      continue
    }
    if (codigo[i] === '<' && INICIO_ETIQUETA.test(codigo.slice(i))) {
      i = tokenizarEtiqueta(codigo, i, salida)
      continue
    }

    // Texto normal hasta el siguiente '<'. Si el propio '<' no abre etiqueta
    // (por ejemplo `a < b`), se consume como texto y se sigue buscando.
    let siguiente = codigo.indexOf('<', codigo[i] === '<' ? i + 1 : i)
    if (siguiente === -1) siguiente = codigo.length
    empujar(salida, 'texto', codigo.slice(i, siguiente))
    i = siguiente
  }
}

// ---------------------------------------------------------------- CSS

function tokenizarCss(codigo: string, salida: Token[]) {
  let i = 0
  let enBloque = false
  let enValor = false

  while (i < codigo.length) {
    const caracter = codigo[i]

    if (codigo.startsWith('/*', i)) {
      const fin = hastaCierre(codigo, i + 2, '*/')
      empujar(salida, 'comentario', codigo.slice(i, fin))
      i = fin
      continue
    }
    if (caracter === '"' || caracter === "'") {
      const fin = hastaCierre(codigo, i + 1, caracter)
      empujar(salida, 'cadena', codigo.slice(i, fin))
      i = fin
      continue
    }
    if (/\s/.test(caracter)) {
      const espacios = /^\s+/.exec(codigo.slice(i))![0]
      empujar(salida, 'texto', espacios)
      i += espacios.length
      continue
    }
    if (caracter === '{') {
      empujar(salida, 'puntuacion', caracter)
      enBloque = true
      enValor = false
      i += 1
      continue
    }
    if (caracter === '}') {
      empujar(salida, 'puntuacion', caracter)
      enBloque = false
      enValor = false
      i += 1
      continue
    }
    if (caracter === ':' && enBloque) {
      empujar(salida, 'puntuacion', caracter)
      enValor = true
      i += 1
      continue
    }
    if (caracter === ';') {
      empujar(salida, 'puntuacion', caracter)
      enValor = false
      i += 1
      continue
    }
    if ('(),'.includes(caracter)) {
      empujar(salida, 'puntuacion', caracter)
      i += 1
      continue
    }
    if (caracter === '@') {
      const regla = /^@[\w-]*/.exec(codigo.slice(i))![0]
      empujar(salida, 'palabraClave', regla)
      i += regla.length
      continue
    }

    if (!enBloque) {
      const selector = /^[^{};()@,\s"']+/.exec(codigo.slice(i))![0]
      empujar(salida, 'selector', selector)
      i += selector.length
      continue
    }
    if (!enValor) {
      const propiedad = /^[^:{};()@,\s"']+/.exec(codigo.slice(i))![0]
      empujar(salida, 'propiedad', propiedad)
      i += propiedad.length
      continue
    }

    const numero = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:%|[a-zA-Z]+)?/.exec(codigo.slice(i))
    if (numero) {
      empujar(salida, 'numero', numero[0])
      i += numero[0].length
      continue
    }
    const funcion = /^[\w-]+(?=\()/.exec(codigo.slice(i))
    if (funcion) {
      empujar(salida, 'funcion', funcion[0])
      i += funcion[0].length
      continue
    }
    const valor = /^[^{};()@,\s"']+/.exec(codigo.slice(i))![0]
    empujar(salida, 'valor', valor)
    i += valor.length
  }
}

// ---------------------------------------------------------------- JavaScript

/** Avanza sobre una cadena respetando los escapes `\"`. */
function finDeCadenaJs(codigo: string, inicio: number) {
  const comilla = codigo[inicio]
  let i = inicio + 1
  while (i < codigo.length) {
    if (codigo[i] === '\\') {
      i += 2
      continue
    }
    if (codigo[i] === comilla) return i + 1
    i += 1
  }
  return codigo.length
}

function tokenizarJs(codigo: string, salida: Token[]) {
  let i = 0

  while (i < codigo.length) {
    const caracter = codigo[i]

    if (codigo.startsWith('//', i)) {
      const salto = codigo.indexOf('\n', i)
      const fin = salto === -1 ? codigo.length : salto
      empujar(salida, 'comentario', codigo.slice(i, fin))
      i = fin
      continue
    }
    if (codigo.startsWith('/*', i)) {
      const fin = hastaCierre(codigo, i + 2, '*/')
      empujar(salida, 'comentario', codigo.slice(i, fin))
      i = fin
      continue
    }
    if (caracter === '"' || caracter === "'" || caracter === '`') {
      const fin = finDeCadenaJs(codigo, i)
      empujar(salida, 'cadena', codigo.slice(i, fin))
      i = fin
      continue
    }
    if (/\s/.test(caracter)) {
      const espacios = /^\s+/.exec(codigo.slice(i))![0]
      empujar(salida, 'texto', espacios)
      i += espacios.length
      continue
    }

    const numero = /^(?:0[xX][\da-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+)/.exec(codigo.slice(i))
    if (numero) {
      empujar(salida, 'numero', numero[0])
      i += numero[0].length
      continue
    }

    const identificador = /^[A-Za-z_$][\w$]*/.exec(codigo.slice(i))
    if (identificador) {
      const palabra = identificador[0]
      const siguiente = codigo.slice(i + palabra.length).match(/^\s*\(/)
      const tipo: TipoToken = PALABRAS_CLAVE_JS.has(palabra)
        ? 'palabraClave'
        : siguiente
          ? 'funcion'
          : 'texto'
      empujar(salida, tipo, palabra)
      i += palabra.length
      continue
    }

    // Operadores y signos sueltos. Las expresiones regulares literales se
    // tratan como divisiones: distinguirlas exige contexto sintáctico y no
    // aporta nada al contenido que se documenta aquí.
    empujar(salida, 'puntuacion', caracter)
    i += 1
  }
}

// ---------------------------------------------------------------- SQL

const PALABRAS_CLAVE_SQL = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'IS', 'NULL', 'DISTINCT', 'LIMIT', 'OFFSET', 'ASC', 'DESC', 'UNION', 'ALL', 'EXISTS',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'WITH', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
  'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'PRIMARY', 'KEY', 'FOREIGN',
  'REFERENCES', 'DEFAULT', 'UNIQUE', 'CHECK', 'INDEX', 'VIEW', 'COUNT', 'SUM', 'AVG',
  'MIN', 'MAX',
  // Vocabulario de PostgreSQL sin equivalente en SQLite (motor: 'postgres')
  'JSONB', 'RETURNING', 'POLICY', 'ROLE', 'GRANT', 'REVOKE', 'MATERIALIZED',
  'PARTITION', 'FUNCTION', 'PROCEDURE', 'TRIGGER', 'BEFORE', 'AFTER', 'FOR', 'EACH',
  'ROW', 'EXTENSION', 'SEQUENCE', 'SUPERUSER', 'NOSUPERUSER', 'LOGIN', 'ENABLE',
  'USING', 'ARRAY', 'ENUM',
])

/**
 * Avanza sobre una cadena SQL respetando el escape estándar: '' dentro de
 * la cadena representa una comilla simple literal, no un cierre (a
 * diferencia de JS, SQL no usa barra invertida para escapar).
 */
function finDeCadenaSql(codigo: string, inicio: number) {
  let i = inicio + 1
  while (i < codigo.length) {
    if (codigo[i] === "'" && codigo[i + 1] === "'") {
      i += 2
      continue
    }
    if (codigo[i] === "'") return i + 1
    i += 1
  }
  return codigo.length
}

function tokenizarSql(codigo: string, salida: Token[]) {
  let i = 0

  while (i < codigo.length) {
    const caracter = codigo[i]

    if (codigo.startsWith('--', i)) {
      const salto = codigo.indexOf('\n', i)
      const fin = salto === -1 ? codigo.length : salto
      empujar(salida, 'comentario', codigo.slice(i, fin))
      i = fin
      continue
    }
    if (caracter === "'") {
      const fin = finDeCadenaSql(codigo, i)
      empujar(salida, 'cadena', codigo.slice(i, fin))
      i = fin
      continue
    }
    if (/\s/.test(caracter)) {
      const espacios = /^\s+/.exec(codigo.slice(i))![0]
      empujar(salida, 'texto', espacios)
      i += espacios.length
      continue
    }

    const numero = /^\d+\.?\d*/.exec(codigo.slice(i))
    if (numero) {
      empujar(salida, 'numero', numero[0])
      i += numero[0].length
      continue
    }

    // SQL es insensible a mayúsculas en sus palabras clave (a diferencia de
    // JS) — se compara en mayúsculas, pero se conserva el texto tal cual lo
    // escribió quien redactó la consulta.
    const identificador = /^[A-Za-z_][\w]*/.exec(codigo.slice(i))
    if (identificador) {
      const palabra = identificador[0]
      const siguiente = codigo.slice(i + palabra.length).match(/^\s*\(/)
      const tipo: TipoToken = PALABRAS_CLAVE_SQL.has(palabra.toUpperCase())
        ? 'palabraClave'
        : siguiente
          ? 'funcion'
          : 'texto'
      empujar(salida, tipo, palabra)
      i += palabra.length
      continue
    }

    empujar(salida, 'puntuacion', caracter)
    i += 1
  }
}

// ---------------------------------------------------------------- API

export function tokenizar(codigo: string, lenguaje: Lenguaje = 'html'): Token[] {
  const salida: Token[] = []
  if (!codigo) return salida

  if (lenguaje === 'html') tokenizarHtml(codigo, salida)
  else if (lenguaje === 'css') tokenizarCss(codigo, salida)
  else if (lenguaje === 'js') tokenizarJs(codigo, salida)
  else if (lenguaje === 'sql') tokenizarSql(codigo, salida)
  else empujar(salida, 'texto', codigo)

  return salida
}

/**
 * Igual que `tokenizar`, pero partido por líneas: ningún token contiene un
 * salto de línea, así cada línea se puede pintar, numerar o destacar por
 * separado.
 */
export function tokenizarLineas(codigo: string, lenguaje: Lenguaje = 'html'): LineaResaltada[] {
  const lineas: LineaResaltada[] = [{ numero: 1, tokens: [] }]

  for (const token of tokenizar(codigo, lenguaje)) {
    const trozos = token.texto.split('\n')
    trozos.forEach((trozo, indice) => {
      if (indice > 0) lineas.push({ numero: lineas.length + 1, tokens: [] })
      if (trozo) lineas[lineas.length - 1].tokens.push({ tipo: token.tipo, texto: trozo })
    })
  }

  return lineas
}
