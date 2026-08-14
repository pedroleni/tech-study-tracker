import {
  Blocks,
  BookOpen,
  Braces,
  Cloud,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Globe2,
  Layers3,
  Monitor,
  Network,
  Package,
  Server,
  ShieldCheck,
  Smartphone,
  Terminal,
  Wrench,
} from 'lucide-react'
import type { ComponentType } from 'react'

export type CuratedIconMap = Record<
  string,
  { label: string; Icon: ComponentType<{ className?: string }> }
>

export const categoryIcons: CuratedIconMap = {
  code: { label: 'Código', Icon: Code2 },
  frontend: { label: 'Frontend', Icon: Monitor },
  backend: { label: 'Backend', Icon: Server },
  terminal: { label: 'Terminal', Icon: Terminal },
  database: { label: 'Base de datos', Icon: Database },
  cloud: { label: 'Nube', Icon: Cloud },
  mobile: { label: 'Móvil', Icon: Smartphone },
  web: { label: 'Web', Icon: Globe2 },
  layers: { label: 'Capas', Icon: Layers3 },
  package: { label: 'Paquete', Icon: Package },
  hardware: { label: 'Hardware', Icon: Cpu },
  versionControl: { label: 'Control de versiones', Icon: GitBranch },
  security: { label: 'Seguridad', Icon: ShieldCheck },
  api: { label: 'API', Icon: Braces },
  networks: { label: 'Redes', Icon: Network },
  tools: { label: 'Herramientas', Icon: Wrench },
  learning: { label: 'Aprendizaje', Icon: BookOpen },
  architecture: { label: 'Arquitectura', Icon: Blocks },
}
