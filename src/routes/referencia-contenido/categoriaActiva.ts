import { createContext } from 'react'

// Cada GrupoCatalogo lee el filtro activo por contexto en vez de recibirlo
// como prop — así el filtro no obliga a tocar las 14 llamadas existentes.
export const CategoriaActivaContext = createContext<string | null>(null)
