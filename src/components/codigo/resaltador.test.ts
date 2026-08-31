import { describe, expect, it } from 'vitest'

import { tokenizar, tokenizarLineas, type Lenguaje, type Token } from '@/components/codigo/resaltador'

/** Devuelve solo los tokens de los tipos que interesan a cada prueba. */
function tiposYTextos(tokens: Token[], tipos: Token['tipo'][]) {
  return tokens.filter((token) => tipos.includes(token.tipo)).map((token) => [token.tipo, token.texto])
}

describe('tokenizar HTML', () => {
  it('separa etiqueta, atributos, valores y contenido', () => {
    const tokens = tokenizar('<a href="/inicio" class="enlace">Ir al inicio</a>', 'html')

    expect(tiposYTextos(tokens, ['etiqueta', 'atributo', 'cadena', 'texto'])).toEqual([
      ['etiqueta', 'a'],
      ['texto', ' '],
      ['atributo', 'href'],
      ['cadena', '"/inicio"'],
      ['texto', ' '],
      ['atributo', 'class'],
      ['cadena', '"enlace"'],
      ['texto', 'Ir al inicio'],
      ['etiqueta', 'a'],
    ])
  })

  it('reconoce atributos sin valor, valores sin comillas y etiquetas auto-cerradas', () => {
    const tokens = tokenizar('<input type=email required />', 'html')

    expect(tiposYTextos(tokens, ['etiqueta', 'atributo', 'cadena', 'puntuacion'])).toEqual([
      ['puntuacion', '<'],
      ['etiqueta', 'input'],
      ['atributo', 'type'],
      ['puntuacion', '='],
      ['cadena', 'email'],
      ['atributo', 'required'],
      ['puntuacion', '/>'],
    ])
  })

  it('distingue comentarios y doctype', () => {
    const tokens = tokenizar('<!DOCTYPE html>\n<!-- una nota -->', 'html')

    expect(tiposYTextos(tokens, ['doctype', 'comentario'])).toEqual([
      ['doctype', '<!DOCTYPE html>'],
      ['comentario', '<!-- una nota -->'],
    ])
  })

  it('colorea el contenido de <style> como CSS y el de <script> como JavaScript', () => {
    const tokens = tokenizar('<style>.aviso { color: red; }</style><script>const a = 1</script>', 'html')

    expect(tokens.some((token) => token.tipo === 'selector' && token.texto === '.aviso')).toBe(true)
    expect(tokens.some((token) => token.tipo === 'propiedad' && token.texto === 'color')).toBe(true)
    expect(tokens.some((token) => token.tipo === 'palabraClave' && token.texto === 'const')).toBe(true)
  })

  it('no confunde un menor-que suelto con una etiqueta', () => {
    const tokens = tokenizar('<p>2 < 3 y 4 > 1</p>', 'html')

    expect(tokens.filter((token) => token.tipo === 'etiqueta')).toHaveLength(2)
  })
})

describe('tokenizar CSS y JavaScript', () => {
  it('separa selector, propiedad, valor, número y comentario', () => {
    const tokens = tokenizar('/* nota */\nbody > .caja {\n  padding: 16px;\n}', 'css')

    expect(tiposYTextos(tokens, ['comentario', 'selector', 'propiedad', 'numero'])).toEqual([
      ['comentario', '/* nota */'],
      ['selector', 'body'],
      ['selector', '>'],
      ['selector', '.caja'],
      ['propiedad', 'padding'],
      ['numero', '16px'],
    ])
  })

  it('reconoce funciones y at-rules en CSS', () => {
    const tokens = tokenizar('@media (min-width: 40rem) { a { color: rgb(0 0 0); } }', 'css')

    expect(tokens.some((token) => token.tipo === 'palabraClave' && token.texto === '@media')).toBe(true)
    expect(tokens.some((token) => token.tipo === 'funcion' && token.texto === 'rgb')).toBe(true)
  })

  it('separa palabras clave, cadenas, comentarios y llamadas en JavaScript', () => {
    const tokens = tokenizar('// hola\nconst saludo = "hola"\nconsole.log(saludo)', 'js')

    expect(tokens.some((token) => token.tipo === 'comentario' && token.texto === '// hola')).toBe(true)
    expect(tokens.some((token) => token.tipo === 'palabraClave' && token.texto === 'const')).toBe(true)
    expect(tokens.some((token) => token.tipo === 'cadena' && token.texto === '"hola"')).toBe(true)
    expect(tokens.some((token) => token.tipo === 'funcion' && token.texto === 'log')).toBe(true)
  })

  it('deja el lenguaje "texto" sin tokenizar', () => {
    expect(tokenizar('<b>literal</b>', 'texto')).toEqual([{ tipo: 'texto', texto: '<b>literal</b>' }])
  })
})

describe('tokenizar SQL', () => {
  it('separa palabras clave, identificadores, cadenas, números y puntuación', () => {
    const tokens = tokenizar("SELECT nombre, salario FROM empleados WHERE id = 1", 'sql')

    // Incluye los espacios: 'texto' está en la lista de tipos pedidos, y los
    // espacios entre palabras se tokenizan como 'texto' (verificado
    // ejecutando el tokenizador real antes de escribir este test, no
    // asumido por analogía con el test de HTML).
    expect(tiposYTextos(tokens, ['palabraClave', 'texto', 'numero', 'puntuacion'])).toEqual([
      ['palabraClave', 'SELECT'],
      ['texto', ' '],
      ['texto', 'nombre'],
      ['puntuacion', ','],
      ['texto', ' '],
      ['texto', 'salario'],
      ['texto', ' '],
      ['palabraClave', 'FROM'],
      ['texto', ' '],
      ['texto', 'empleados'],
      ['texto', ' '],
      ['palabraClave', 'WHERE'],
      ['texto', ' '],
      ['texto', 'id'],
      ['texto', ' '],
      ['puntuacion', '='],
      ['texto', ' '],
      ['numero', '1'],
    ])
  })

  it('reconoce palabras clave en minúsculas igual que en mayúsculas', () => {
    const tokens = tokenizar('select nombre from empleados', 'sql')

    expect(tokens.filter((t) => t.tipo === 'palabraClave').map((t) => t.texto)).toEqual([
      'select',
      'from',
    ])
  })

  it('reconoce cadenas con \'\' como escape de comilla simple', () => {
    const tokens = tokenizar("SELECT 'no lo hagas' FROM t", 'sql')

    expect(tokens.some((t) => t.tipo === 'cadena' && t.texto === "'no lo hagas'")).toBe(true)
  })

  it("una cadena con comilla escapada ('') no se corta a mitad", () => {
    const tokens = tokenizar("SELECT 'don''t' FROM t", 'sql')

    expect(tokens.some((t) => t.tipo === 'cadena' && t.texto === "'don''t'")).toBe(true)
  })

  it('reconoce comentarios de línea con --', () => {
    const tokens = tokenizar('SELECT 1 -- una nota\nFROM t', 'sql')

    expect(tokens.some((t) => t.tipo === 'comentario' && t.texto === '-- una nota')).toBe(true)
  })

  it('reconoce funciones agregadas seguidas de paréntesis como palabra clave, y funciones propias como funcion', () => {
    const tokens = tokenizar('SELECT COUNT(*), mi_funcion(x) FROM t', 'sql')

    expect(tokens.some((t) => t.tipo === 'palabraClave' && t.texto === 'COUNT')).toBe(true)
    expect(tokens.some((t) => t.tipo === 'funcion' && t.texto === 'mi_funcion')).toBe(true)
  })

  it('reconoce palabras clave de Postgres que no existen en SQLite', () => {
    const codigo =
      'ALTER TABLE t ADD COLUMN x JSONB; CREATE POLICY p ON t USING (true); GRANT SELECT ON t TO app_user; CREATE ROLE app_user;'
    const tokens = tokenizar(codigo, 'sql')
    const palabrasClave = tokens.filter((t) => t.tipo === 'palabraClave').map((t) => t.texto)

    expect(palabrasClave).toContain('JSONB')
    expect(palabrasClave).toContain('POLICY')
    expect(palabrasClave).toContain('GRANT')
    expect(palabrasClave).toContain('ROLE')
  })

  it('sigue cumpliendo el invariante de reconstrucción exacta con vocabulario Postgres', () => {
    const codigo =
      'CREATE ROLE app_user NOSUPERUSER; CREATE MATERIALIZED VIEW v AS SELECT 1 RETURNING id;'
    const tokens = tokenizar(codigo, 'sql')

    expect(tokens.map((token) => token.texto).join('')).toBe(codigo)
  })
})

describe('resistencia al código roto', () => {
  // Dentro de un editor, el código está mal formado la mayor parte del tiempo:
  // el tokenizador tiene que aguantarlo sin colgarse y sin perder caracteres.
  const CASOS: { nombre: string; codigo: string; lenguaje: Lenguaje }[] = [
    { nombre: 'etiqueta sin cerrar', codigo: '<div class="caja"', lenguaje: 'html' },
    { nombre: 'comilla sin cerrar', codigo: '<a href="/inicio>texto', lenguaje: 'html' },
    { nombre: 'comentario sin cerrar', codigo: '<p>hola</p><!-- a medias', lenguaje: 'html' },
    { nombre: 'style sin cerrar', codigo: '<style>body { color: red;', lenguaje: 'html' },
    { nombre: 'cierre huérfano', codigo: '</section>', lenguaje: 'html' },
    { nombre: 'signos sueltos', codigo: '< > / = " \'', lenguaje: 'html' },
    { nombre: 'solo espacios', codigo: '   \n\n\t', lenguaje: 'html' },
    { nombre: 'bloque CSS sin cerrar', codigo: 'a { color: /* nota', lenguaje: 'css' },
    { nombre: 'llave de más en CSS', codigo: '} } a {}', lenguaje: 'css' },
    { nombre: 'cadena JS sin cerrar', codigo: 'const a = "sin final', lenguaje: 'js' },
    { nombre: 'JS con escapes', codigo: 'const a = "com\\"illa" // fin', lenguaje: 'js' },
    { nombre: 'cadena vacía', codigo: '', lenguaje: 'html' },
    { nombre: 'cadena SQL sin cerrar', codigo: "SELECT 'sin final", lenguaje: 'sql' },
    { nombre: 'comentario SQL sin salto final', codigo: 'SELECT 1 -- nota', lenguaje: 'sql' },
    { nombre: 'comilla escapada SQL', codigo: "SELECT 'don''t stop'", lenguaje: 'sql' },
  ]

  it.each(CASOS)('no pierde ni un carácter con $nombre', ({ codigo, lenguaje }) => {
    const tokens = tokenizar(codigo, lenguaje)

    expect(tokens.map((token) => token.texto).join('')).toBe(codigo)
  })

  it.each(CASOS)('parte en líneas sin perder nada con $nombre', ({ codigo, lenguaje }) => {
    const lineas = tokenizarLineas(codigo, lenguaje)

    const reconstruido = lineas
      .map((linea) => linea.tokens.map((token) => token.texto).join(''))
      .join('\n')
    expect(reconstruido).toBe(codigo)
    expect(lineas.every((linea) => linea.tokens.every((token) => !token.texto.includes('\n')))).toBe(
      true
    )
  })
})

describe('tokenizarLineas', () => {
  it('numera desde 1 y conserva las líneas vacías', () => {
    const lineas = tokenizarLineas('<p>uno</p>\n\n<p>tres</p>', 'html')

    expect(lineas.map((linea) => linea.numero)).toEqual([1, 2, 3])
    expect(lineas[1].tokens).toEqual([])
    expect(lineas[2].tokens.some((token) => token.texto === 'tres')).toBe(true)
  })

  it('devuelve una línea vacía para un código vacío', () => {
    expect(tokenizarLineas('', 'html')).toEqual([{ numero: 1, tokens: [] }])
  })
})
