import { describe, expect, it } from 'vitest'

import {
  esquemaArbolDeComponentes,
  esquemaBloqueLaboratorio,
  esquemaCodigoAnotado,
  esquemaComprobacionReact,
  esquemaEditorEnVivo,
  esquemaGitAnotado,
  esquemaGitEnVivo,
  esquemaImagen,
  esquemaPrediceElResultado,
  esquemaReactAnotado,
  esquemaReactEnVivo,
  esquemaSqlAnotado,
  esquemaSqlEnVivo,
} from './schemas'

const archivoApp = { nombre: 'App.jsx', codigo: 'export default function App() { return <p>Hola</p> }' }
const minimoEnVivo = { tipo: 'react-en-vivo', archivos: [archivoApp] }

describe('esquemaReactEnVivo', () => {
  it('acepta el mínimo y aplica los valores por defecto', () => {
    const datos = esquemaReactEnVivo.parse(minimoEnVivo)
    expect(datos).toMatchObject({ strictMode: true, mostrarConsola: true, mostrarJsGenerado: false })
    expect(esquemaBloqueLaboratorio.parse(minimoEnVivo).tipo).toBe('react-en-vivo')
  })

  it('exige App.jsx, nombres únicos y válidos, y un archivoInicial existente', () => {
    const fallo = (datos: unknown) => esquemaReactEnVivo.safeParse(datos).success
    expect(fallo({ ...minimoEnVivo, archivos: [{ nombre: 'Main.jsx', codigo: '' }] })).toBe(false)
    expect(fallo({ ...minimoEnVivo, archivos: [archivoApp, archivoApp] })).toBe(false)
    for (const nombre of ['app.tsx', '../App.jsx', 'App.js', 'estilos.scss']) {
      expect(fallo({ ...minimoEnVivo, archivos: [archivoApp, { nombre, codigo: '' }] })).toBe(false)
    }
    expect(fallo({ ...minimoEnVivo, archivoInicial: 'Otro.jsx' })).toBe(false)
    expect(fallo({ ...minimoEnVivo, archivos: [archivoApp, { nombre: 'estilos.css', codigo: 'p{}' }], archivoInicial: 'estilos.css' })).toBe(true)
  })

  it('las comprobaciones distinguen cada forma sin perder campos', () => {
    const espera = (e: unknown) =>
      esquemaComprobacionReact.safeParse({ descripcion: 'd', espera: e })
    expect(espera({ etiqueta: 'Nueva tarea', valor: '' }).data?.espera).toEqual({ etiqueta: 'Nueva tarea', valor: '' })
    expect(espera({ rol: 'listitem', texto: 'Nadar' }).data?.espera).toEqual({ rol: 'listitem', texto: 'Nadar' })
    expect(espera({ ausente: { texto: 'Leer' } }).success).toBe(true)
    expect(espera({ rol: 'boton' }).success).toBe(false)
    expect(espera({ texto: 'x', sobra: 1 }).success).toBe(false)
    expect(esquemaComprobacionReact.parse({ descripcion: 'd', espera: { texto: 'x' } }).pasos).toEqual([])
  })

  it('limita las comprobaciones a 8 y los pasos a 10', () => {
    const c = { descripcion: 'd', espera: { texto: 'x' } }
    expect(esquemaReactEnVivo.safeParse({ ...minimoEnVivo, comprobaciones: Array(9).fill(c) }).success).toBe(false)
    expect(esquemaComprobacionReact.safeParse({ ...c, pasos: Array(11).fill({ teclear: '{Enter}' }) }).success).toBe(false)
  })

  it('api acepta colecciones válidas y rechaza nombres, tamaños y registros sin id inválidos', () => {
    const api = { recetas: [{ id: 1, nombre: 'Salmorejo' }] }
    expect(esquemaReactEnVivo.parse({ ...minimoEnVivo, api }).api).toEqual(api)
    expect(esquemaReactEnVivo.safeParse({ ...minimoEnVivo, api: { 'Recetas mal': [] } }).success).toBe(false)
    expect(
      esquemaReactEnVivo.safeParse({
        ...minimoEnVivo,
        api: Object.fromEntries(Array.from({ length: 9 }, (_, indice) => [`c${indice}`, []])),
      }).success,
    ).toBe(false)
    expect(
      esquemaReactEnVivo.safeParse({ ...minimoEnVivo, api: { recetas: Array(201).fill({ id: 1 }) } }).success,
    ).toBe(false)
    expect(esquemaReactEnVivo.safeParse({ ...minimoEnVivo, api: { recetas: [{ nombre: 'Sin id' }] } }).success).toBe(false)
    expect(
      esquemaReactEnVivo.safeParse({ ...minimoEnVivo, api: { recetas: [{ id: 1, texto: 'x'.repeat(20_001) }] } }).success,
    ).toBe(false)
  })

  it('red aplica latencia 600 y desordenar false por defecto y rechaza 3001', () => {
    expect(esquemaReactEnVivo.parse({ ...minimoEnVivo, red: {} }).red).toEqual({
      latencia: 600,
      desordenar: false,
    })
    expect(esquemaReactEnVivo.safeParse({ ...minimoEnVivo, red: { latencia: 3001 } }).success).toBe(false)
  })

  it('el paso red de una comprobación solo admite fallar-siguiente', () => {
    const base = { descripcion: 'd', espera: { texto: 'error' } }
    expect(
      esquemaComprobacionReact.parse({ ...base, pasos: [{ red: 'fallar-siguiente' }] }).pasos,
    ).toEqual([{ red: 'fallar-siguiente' }])
    expect(
      esquemaComprobacionReact.safeParse({ ...base, pasos: [{ red: 'fallar-siempre' }] }).success,
    ).toBe(false)
  })
})

describe('esquemaReactAnotado', () => {
  it('acepta el mínimo con sus valores por defecto', () => {
    const datos = esquemaReactAnotado.parse({ tipo: 'react-anotado', codigo: archivoApp.codigo, anotaciones: [{ fragmento: 'App', nota: 'n' }] })
    expect(datos).toMatchObject({ css: '', strictMode: true, mostrarConsola: false })
  })

  it('acepta api y red con los mismos límites', () => {
    const datos = esquemaReactAnotado.parse({
      tipo: 'react-anotado',
      codigo: archivoApp.codigo,
      anotaciones: [{ fragmento: 'App', nota: 'n' }],
      api: { recetas: [{ id: 'a', nombre: 'Gazpacho' }] },
      red: {},
    })
    expect(datos.red).toEqual({ latencia: 600, desordenar: false })
  })
})

describe('árbol de renders en los bloques de React', () => {
  it('mostrarArbol es false por defecto en react-en-vivo y react-anotado', () => {
    expect(esquemaReactEnVivo.parse(minimoEnVivo).mostrarArbol).toBe(false)
    expect(
      esquemaReactAnotado.parse({ tipo: 'react-anotado', codigo: archivoApp.codigo, anotaciones: [{ fragmento: 'App', nota: 'n' }] })
        .mostrarArbol,
    ).toBe(false)
    expect(esquemaReactEnVivo.parse({ ...minimoEnVivo, mostrarArbol: true }).mostrarArbol).toBe(true)
  })
})

describe('esquemaArbolDeComponentes', () => {
  const nodos = [
    { nombre: 'App', nivel: 0, etiqueta: 'estado: tareas' },
    { nombre: 'Lista', nivel: 1, estado: 'renderizado' },
    { nombre: 'Tarea', nivel: 2, clave: 'a', nota: '← se vuelve a pintar' },
    { nombre: 'Pie', nivel: 1, estado: 'sin-cambios' },
  ]
  const arbol = (cambios: Record<string, unknown> = {}) => ({ tipo: 'arbol-de-componentes', nodos, ...cambios })

  it('acepta un árbol válido', () => {
    expect(esquemaArbolDeComponentes.parse(arbol({ titulo: 'Dónde vive el estado' })).nodos).toHaveLength(4)
    expect(esquemaBloqueLaboratorio.parse(arbol()).tipo).toBe('arbol-de-componentes')
  })

  it('rechaza que el primer nodo no tenga nivel 0', () => {
    expect(esquemaArbolDeComponentes.safeParse(arbol({ nodos: [{ nombre: 'App', nivel: 1 }] })).success).toBe(false)
  })

  it('rechaza saltar de nivel 0 a 2', () => {
    expect(
      esquemaArbolDeComponentes.safeParse(arbol({ nodos: [{ nombre: 'App', nivel: 0 }, { nombre: 'Tarea', nivel: 2 }] })).success,
    ).toBe(false)
  })

  it('rechaza claves desconocidas en un nodo', () => {
    expect(esquemaArbolDeComponentes.safeParse(arbol({ nodos: [{ nombre: 'App', nivel: 0, color: 'rojo' }] })).success).toBe(false)
  })

  it('rechaza 41 nodos', () => {
    expect(
      esquemaArbolDeComponentes.safeParse(arbol({ nodos: Array.from({ length: 41 }, () => ({ nombre: 'App', nivel: 0 })) })).success,
    ).toBe(false)
  })
})

describe('lenguaje jsx/tsx en bloques estáticos', () => {
  it('codigo-anotado y predice-el-resultado aceptan html, jsx y tsx; html por defecto', () => {
    const anotado = { tipo: 'codigo-anotado', codigo: '<p />', anotaciones: [{ fragmento: 'p', nota: 'n' }] }
    expect(esquemaCodigoAnotado.parse(anotado).lenguaje).toBe('html')
    expect(esquemaCodigoAnotado.parse({ ...anotado, lenguaje: 'jsx' }).lenguaje).toBe('jsx')
    expect(esquemaCodigoAnotado.safeParse({ ...anotado, lenguaje: 'javascript' }).success).toBe(false)
    const predice = { tipo: 'predice-el-resultado', codigo: 'x', opciones: ['a', 'b'], correcta: 0, explicacion: 'e' }
    expect(esquemaPrediceElResultado.parse({ ...predice, lenguaje: 'tsx' }).lenguaje).toBe('tsx')
  })
})

describe('esquemaEditorEnVivo', () => {
  it('acepta un bloque que solo trae contenido en ts', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
      ts: 'const x: number = 1;',
    })

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.ts).toBe('const x: number = 1;')
      expect(resultado.data.html).toBe('')
      expect(resultado.data.pestañaInicial).toBe('html')
    }
  })

  it('acepta pestañaInicial: "ts"', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
      ts: 'const x = 1;',
      pestañaInicial: 'ts',
    })

    expect(resultado.success).toBe(true)
  })

  it('sigue rechazando un bloque sin contenido en ningún campo', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
    })

    expect(resultado.success).toBe(false)
  })

  it('sigue validando bloques ya publicados sin el campo ts (retrocompatible)', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
      html: '<p>Hola</p>',
    })

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.ts).toBe('')
    }
  })
})

describe('esquemaSqlAnotado', () => {
  const base = {
    tipo: 'sql-anotado' as const,
    esquemaSql: "CREATE TABLE t (id INTEGER PRIMARY KEY, nombre TEXT); INSERT INTO t VALUES (1, 'Ana');",
    consulta: 'SELECT nombre FROM t',
    anotaciones: [{ fragmento: 'SELECT nombre', nota: 'Selecciona solo la columna nombre.' }],
  }

  it('acepta un bloque válido con los campos mínimos', () => {
    const resultado = esquemaSqlAnotado.safeParse(base)

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.esquemaSql).toBe(base.esquemaSql)
      expect(resultado.data.consulta).toBe(base.consulta)
      expect(resultado.data.anotaciones).toHaveLength(1)
    }
  })

  it('acepta titulo opcional', () => {
    const resultado = esquemaSqlAnotado.safeParse({ ...base, titulo: 'Un título' })

    expect(resultado.success).toBe(true)
  })

  it('rechaza un bloque sin esquemaSql', () => {
    const resultado = esquemaSqlAnotado.safeParse({
      tipo: base.tipo,
      consulta: base.consulta,
      anotaciones: base.anotaciones,
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza un bloque sin ninguna anotación', () => {
    const resultado = esquemaSqlAnotado.safeParse({ ...base, anotaciones: [] })

    expect(resultado.success).toBe(false)
  })

  it('rechaza más de 8 anotaciones', () => {
    const anotaciones = Array.from({ length: 9 }, (_, i) => ({
      fragmento: `frag${i}`,
      nota: `nota ${i}`,
    }))
    const resultado = esquemaSqlAnotado.safeParse({ ...base, anotaciones })

    expect(resultado.success).toBe(false)
  })

  it('rechaza esquemaSql de más de 3000 caracteres', () => {
    const resultado = esquemaSqlAnotado.safeParse({ ...base, esquemaSql: 'a'.repeat(3001) })

    expect(resultado.success).toBe(false)
  })
})

describe('esquemaSqlEnVivo', () => {
  const base = {
    tipo: 'sql-en-vivo' as const,
    esquemaSql: "CREATE TABLE t (id INTEGER PRIMARY KEY, nombre TEXT); INSERT INTO t VALUES (1, 'Ana');",
  }

  it('acepta un bloque puramente exploratorio (sin consultaSolucion)', () => {
    const resultado = esquemaSqlEnVivo.safeParse(base)

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.consultaInicial).toBe('')
      expect(resultado.data.consultaSolucion).toBeUndefined()
    }
  })

  it('acepta un bloque de ejercicio con consultaSolucion y consigna', () => {
    const resultado = esquemaSqlEnVivo.safeParse({
      ...base,
      consigna: 'Muestra el nombre de todos.',
      consultaInicial: '',
      consultaSolucion: 'SELECT nombre FROM t',
    })

    expect(resultado.success).toBe(true)
  })

  it('rechaza un bloque sin esquemaSql', () => {
    const resultado = esquemaSqlEnVivo.safeParse({ tipo: 'sql-en-vivo' })

    expect(resultado.success).toBe(false)
  })

  it('rechaza consultaSolucion de más de 1500 caracteres', () => {
    const resultado = esquemaSqlEnVivo.safeParse({ ...base, consultaSolucion: 'a'.repeat(1501) })

    expect(resultado.success).toBe(false)
  })
})

describe('esquemaSqlEnVivo — extensión Postgres', () => {
  const base = {
    tipo: 'sql-en-vivo' as const,
    esquemaSql: 'CREATE TABLE t (id int);',
    consultaInicial: '',
  }

  it('motor por defecto es sqlite (retrocompatible)', () => {
    const resultado = esquemaSqlEnVivo.safeParse(base)

    expect(resultado.success).toBe(true)
    if (resultado.success) expect(resultado.data.motor).toBe('sqlite')
  })

  it('acepta motor: postgres', () => {
    const resultado = esquemaSqlEnVivo.safeParse({ ...base, motor: 'postgres' })

    expect(resultado.success).toBe(true)
    if (resultado.success) expect(resultado.data.motor).toBe('postgres')
  })

  it('rechaza un motor que no sea sqlite ni postgres', () => {
    const resultado = esquemaSqlEnVivo.safeParse({ ...base, motor: 'mysql' })

    expect(resultado.success).toBe(false)
  })

  it('extensiones es opcional y solo acepta pgcrypto/uuid_ossp', () => {
    const sinExtensiones = esquemaSqlEnVivo.safeParse(base)
    expect(sinExtensiones.success).toBe(true)
    if (sinExtensiones.success) expect(sinExtensiones.data.extensiones).toBeUndefined()

    const conExtensiones = esquemaSqlEnVivo.safeParse({
      ...base,
      extensiones: ['pgcrypto', 'uuid_ossp'],
    })
    expect(conExtensiones.success).toBe(true)
    if (conExtensiones.success) {
      expect(conExtensiones.data.extensiones).toEqual(['pgcrypto', 'uuid_ossp'])
    }

    const invalida = esquemaSqlEnVivo.safeParse({ ...base, extensiones: ['postgis'] })
    expect(invalida.success).toBe(false)
  })

  it('identidadSimulada es opcional, necesita al menos 2 y como mucho 4', () => {
    const sinIdentidad = esquemaSqlEnVivo.safeParse(base)
    expect(sinIdentidad.success).toBe(true)
    if (sinIdentidad.success) expect(sinIdentidad.data.identidadSimulada).toBeUndefined()

    const dos = [
      { etiqueta: 'Ana', valor: 'ana' },
      { etiqueta: 'Roberto', valor: 'roberto' },
    ]
    const conDos = esquemaSqlEnVivo.safeParse({ ...base, identidadSimulada: dos })
    expect(conDos.success).toBe(true)
    if (conDos.success) expect(conDos.data.identidadSimulada).toEqual(dos)

    const conUna = esquemaSqlEnVivo.safeParse({ ...base, identidadSimulada: [dos[0]] })
    expect(conUna.success).toBe(false)

    const cinco = Array.from({ length: 5 }, (_, i) => ({ etiqueta: `u${i}`, valor: `v${i}` }))
    const conCinco = esquemaSqlEnVivo.safeParse({ ...base, identidadSimulada: cinco })
    expect(conCinco.success).toBe(false)
  })
})

describe('esquemaSqlAnotado — extensión Postgres', () => {
  it('motor por defecto es sqlite (retrocompatible)', () => {
    const resultado = esquemaSqlAnotado.safeParse({
      tipo: 'sql-anotado',
      esquemaSql: 'CREATE TABLE t (id int);',
      consulta: 'SELECT * FROM t;',
      anotaciones: [{ fragmento: 'SELECT', nota: 'x' }],
    })

    expect(resultado.success).toBe(true)
    if (resultado.success) expect(resultado.data.motor).toBe('sqlite')
  })
})

describe('esquemaBloqueLaboratorio con los tipos de SQL', () => {
  it('discrimina sql-anotado y sql-en-vivo dentro de la unión', () => {
    const anotado = esquemaBloqueLaboratorio.safeParse({
      tipo: 'sql-anotado',
      esquemaSql: 'CREATE TABLE t (id INTEGER);',
      consulta: 'SELECT * FROM t',
      anotaciones: [{ fragmento: 'SELECT', nota: 'nota' }],
    })
    const enVivo = esquemaBloqueLaboratorio.safeParse({
      tipo: 'sql-en-vivo',
      esquemaSql: 'CREATE TABLE t (id INTEGER);',
    })

    expect(anotado.success).toBe(true)
    expect(enVivo.success).toBe(true)
  })
})

describe('esquemaGitAnotado', () => {
  it('acepta un bloque válido con pasos de comando y anotaciones', () => {
    const resultado = esquemaGitAnotado.safeParse({
      tipo: 'git-anotado',
      esquemaGit: ["init .", "add a.txt", "commit -m 'v1'"],
      comando: 'log --oneline',
      anotaciones: [{ fragmento: 'log', nota: 'Muestra el historial real.' }],
    })
    expect(resultado.success).toBe(true)
    if (resultado.success) expect(resultado.data.mostrarGrafo).toBe(false)
  })

  it('acepta un paso de escritura de fichero junto a comandos', () => {
    const resultado = esquemaGitAnotado.safeParse({
      tipo: 'git-anotado',
      esquemaGit: [
        'init .',
        { escribir: { ruta: 'a.txt', contenido: 'hola\n' } },
        'add a.txt',
      ],
      comando: 'status',
      anotaciones: [{ fragmento: 'status', nota: 'x' }],
    })
    expect(resultado.success).toBe(true)
  })

  it('acepta mostrarGrafo explícito', () => {
    const resultado = esquemaGitAnotado.safeParse({
      tipo: 'git-anotado',
      esquemaGit: ['init .'],
      comando: 'log --oneline',
      mostrarGrafo: true,
      anotaciones: [{ fragmento: 'log', nota: 'x' }],
    })
    expect(resultado.success).toBe(true)
    if (resultado.success) expect(resultado.data.mostrarGrafo).toBe(true)
  })

  it('rechaza esquemaGit vacío', () => {
    const resultado = esquemaGitAnotado.safeParse({
      tipo: 'git-anotado',
      esquemaGit: [],
      comando: 'log --oneline',
      anotaciones: [{ fragmento: 'log', nota: 'x' }],
    })
    expect(resultado.success).toBe(false)
  })

  it('rechaza sin ninguna anotación', () => {
    const resultado = esquemaGitAnotado.safeParse({
      tipo: 'git-anotado',
      esquemaGit: ['init .'],
      comando: 'log --oneline',
      anotaciones: [],
    })
    expect(resultado.success).toBe(false)
  })

  it('rechaza un paso de escritura mal formado (sin ruta)', () => {
    const resultado = esquemaGitAnotado.safeParse({
      tipo: 'git-anotado',
      esquemaGit: [{ escribir: { contenido: 'x' } }],
      comando: 'status',
      anotaciones: [{ fragmento: 'status', nota: 'x' }],
    })
    expect(resultado.success).toBe(false)
  })
})

describe('esquemaGitEnVivo', () => {
  it('acepta un bloque válido con comandoSolucion', () => {
    const resultado = esquemaGitEnVivo.safeParse({
      tipo: 'git-en-vivo',
      esquemaGit: ["init .", "add a.txt", "commit -m 'v1'"],
      comandoInicial: 'status',
      comandoSolucion: 'log --oneline',
    })
    expect(resultado.success).toBe(true)
  })

  it('comandoInicial por defecto es cadena vacía', () => {
    const resultado = esquemaGitEnVivo.parse({
      tipo: 'git-en-vivo',
      esquemaGit: ['init .'],
    })
    expect(resultado.comandoInicial).toBe('')
    expect(resultado.mostrarGrafo).toBe(false)
  })

  it('acepta consigna y mostrarGrafo opcionales', () => {
    const resultado = esquemaGitEnVivo.safeParse({
      tipo: 'git-en-vivo',
      consigna: 'Resuelve el conflicto.',
      esquemaGit: ['init .'],
      comandoInicial: 'status',
      mostrarGrafo: true,
    })
    expect(resultado.success).toBe(true)
  })

  it('acepta pasos de escritura de fichero', () => {
    const resultado = esquemaGitEnVivo.safeParse({
      tipo: 'git-en-vivo',
      esquemaGit: ['init .', { escribir: { ruta: 'a.txt', contenido: 'x\n' } }],
      comandoInicial: 'status',
    })
    expect(resultado.success).toBe(true)
  })
})

describe('esquemaBloqueLaboratorio con los tipos de Git', () => {
  it('discrimina git-anotado y git-en-vivo dentro de la unión', () => {
    const anotado = esquemaBloqueLaboratorio.safeParse({
      tipo: 'git-anotado',
      esquemaGit: ['init .'],
      comando: 'log --oneline',
      anotaciones: [{ fragmento: 'log', nota: 'nota' }],
    })
    const enVivo = esquemaBloqueLaboratorio.safeParse({
      tipo: 'git-en-vivo',
      esquemaGit: ['init .'],
    })

    expect(anotado.success).toBe(true)
    expect(enVivo.success).toBe(true)
  })
})

describe('esquemaImagen', () => {
  it('acepta un bloque válido con src en nuestro dominio y alt', () => {
    const resultado = esquemaImagen.safeParse({
      tipo: 'imagen',
      src: 'https://www.techstudytracker.com/img/abc123.png',
      alt: 'Captura de la pestaña Network de DevTools',
    })

    expect(resultado.success).toBe(true)
  })

  it('acepta titulo opcional', () => {
    const resultado = esquemaImagen.safeParse({
      tipo: 'imagen',
      src: 'https://www.techstudytracker.com/img/abc123.png',
      alt: 'Captura',
      titulo: 'Figura 1: la pestaña Network',
    })

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.titulo).toBe('Figura 1: la pestaña Network')
    }
  })

  it('rechaza un src fuera de nuestro dominio', () => {
    const resultado = esquemaImagen.safeParse({
      tipo: 'imagen',
      src: 'https://otro-sitio.com/imagen.png',
      alt: 'Captura',
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza sin alt', () => {
    const resultado = esquemaImagen.safeParse({
      tipo: 'imagen',
      src: 'https://www.techstudytracker.com/img/abc123.png',
    })

    expect(resultado.success).toBe(false)
  })

  it('participa en esquemaBloqueLaboratorio', () => {
    const resultado = esquemaBloqueLaboratorio.safeParse({
      tipo: 'imagen',
      src: 'https://www.techstudytracker.com/img/abc123.png',
      alt: 'Captura',
    })

    expect(resultado.success).toBe(true)
  })
})
