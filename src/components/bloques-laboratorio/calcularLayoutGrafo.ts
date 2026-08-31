import type { GrafoGit } from '@/lib/git-en-vivo/motor'

export interface NodoLayout {
  hash: string
  hashCorto: string
  mensaje: string
  x: number
  y: number
  carril: number
}

export interface AristaLayout {
  desde: { x: number; y: number }
  hasta: { x: number; y: number }
}

export interface EtiquetaRamaLayout {
  nombre: string
  x: number
  y: number
  carril: number
  esActual: boolean
}

export interface LayoutGrafo {
  nodos: NodoLayout[]
  aristas: AristaLayout[]
  etiquetas: EtiquetaRamaLayout[]
  ancho: number
  alto: number
}

const ESPACIADO_X = 90
const MARGEN_X = 50
const ESPACIADO_Y = 50
const MARGEN_Y = 40

function ordenTopologico(grafo: GrafoGit): string[] {
  const gradoEntrada = new Map(
    grafo.commits.map((commit) => [commit.hash, commit.padres.length]),
  )
  const hijosDe = new Map<string, string[]>()

  for (const commit of grafo.commits) {
    for (const padre of commit.padres) {
      hijosDe.set(padre, [...(hijosDe.get(padre) ?? []), commit.hash])
    }
  }

  const cola = grafo.commits
    .filter((commit) => commit.padres.length === 0)
    .map((commit) => commit.hash)
  const orden: string[] = []

  while (cola.length > 0) {
    const hash = cola.shift()!
    orden.push(hash)
    for (const hijo of hijosDe.get(hash) ?? []) {
      const restante = (gradoEntrada.get(hijo) ?? 0) - 1
      gradoEntrada.set(hijo, restante)
      if (restante === 0) cola.push(hijo)
    }
  }

  // Los datos reales forman un DAG. Este fallback conserva cualquier nodo
  // inesperado en vez de descartarlo silenciosamente.
  for (const commit of grafo.commits) {
    if (!orden.includes(commit.hash)) orden.push(commit.hash)
  }

  return orden
}

function asignarCarriles(grafo: GrafoGit): Map<string, number> {
  const porHash = new Map(
    grafo.commits.map((commit) => [commit.hash, commit]),
  )
  const carrilDe = new Map<string, number>()

  grafo.ramas.forEach((rama, indiceRama) => {
    let actual: string | undefined = rama.hash
    while (actual && !carrilDe.has(actual)) {
      carrilDe.set(actual, indiceRama)
      actual = porHash.get(actual)?.padres[0]
    }
  })

  return carrilDe
}

export function calcularLayoutGrafo(grafo: GrafoGit): LayoutGrafo {
  const orden = ordenTopologico(grafo)
  const carriles = asignarCarriles(grafo)
  const porHash = new Map(
    grafo.commits.map((commit) => [commit.hash, commit]),
  )

  const posiciones = new Map<string, { x: number; y: number }>()
  orden.forEach((hash, indice) => {
    const carril = carriles.get(hash) ?? 0
    posiciones.set(hash, {
      x: MARGEN_X + indice * ESPACIADO_X,
      y: MARGEN_Y + carril * ESPACIADO_Y,
    })
  })

  const nodos: NodoLayout[] = orden.map((hash) => {
    const commit = porHash.get(hash)!
    const posicion = posiciones.get(hash)!
    return {
      hash,
      hashCorto: commit.hashCorto,
      mensaje: commit.mensaje,
      x: posicion.x,
      y: posicion.y,
      carril: carriles.get(hash) ?? 0,
    }
  })

  const aristas: AristaLayout[] = []
  for (const commit of grafo.commits) {
    const hasta = posiciones.get(commit.hash)!
    for (const padre of commit.padres) {
      const desde = posiciones.get(padre)
      if (desde) aristas.push({ desde, hasta })
    }
  }

  const etiquetas: EtiquetaRamaLayout[] = grafo.ramas.map((rama) => {
    const posicion = posiciones.get(rama.hash)!
    return {
      nombre: rama.nombre,
      x: posicion.x,
      y: posicion.y,
      carril: carriles.get(rama.hash) ?? 0,
      esActual: rama.nombre === grafo.ramaActual,
    }
  })

  const ancho =
    MARGEN_X * 2 + Math.max(0, orden.length - 1) * ESPACIADO_X
  const alto =
    MARGEN_Y * 2 + Math.max(0, grafo.ramas.length - 1) * ESPACIADO_Y

  return { nodos, aristas, etiquetas, ancho, alto }
}
