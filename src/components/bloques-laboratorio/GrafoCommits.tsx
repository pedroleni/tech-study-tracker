import type { GrafoGit } from '@/lib/git-en-vivo/motor'

import { calcularLayoutGrafo } from './calcularLayoutGrafo'

const COLORES_CARRIL = ['#3b82f6', '#F03C2E', '#8b5cf6', '#059669']

export function GrafoCommits({ grafo }: { grafo: GrafoGit }) {
  const layout = calcularLayoutGrafo(grafo)

  return (
    <div className="overflow-x-auto rounded-lg border bg-card p-3">
      <svg
        role="img"
        aria-label="Grafo de commits y ramas"
        width={layout.ancho}
        height={layout.alto}
        viewBox={`0 0 ${layout.ancho} ${layout.alto}`}
      >
        {layout.aristas.map((arista, indice) => (
          <line
            key={indice}
            x1={arista.desde.x}
            y1={arista.desde.y}
            x2={arista.hasta.x}
            y2={arista.hasta.y}
            stroke="var(--muted-foreground)"
            strokeWidth={2}
          />
        ))}
        {layout.nodos.map((nodo) => (
          <g key={nodo.hash} transform={`translate(${nodo.x},${nodo.y})`}>
            <circle
              r={7}
              fill="var(--card)"
              stroke={
                COLORES_CARRIL[nodo.carril % COLORES_CARRIL.length]
              }
              strokeWidth={2}
            />
            <text
              y={22}
              textAnchor="middle"
              fontSize={10}
              fontFamily="monospace"
              fill="var(--muted-foreground)"
            >
              {nodo.hashCorto}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-2">
        {layout.etiquetas.map((etiqueta) => {
          const color =
            COLORES_CARRIL[etiqueta.carril % COLORES_CARRIL.length]

          return (
            <span
              key={etiqueta.nombre}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-bold"
              style={{
                color,
                backgroundColor: `${color}1a`,
              }}
            >
              {etiqueta.esActual && <span aria-hidden="true">●</span>}
              <span>{etiqueta.nombre}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
