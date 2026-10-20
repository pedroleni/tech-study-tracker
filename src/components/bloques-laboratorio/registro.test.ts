import { expect, it } from 'vitest'

import { ArbolDeComponentes } from './ArbolDeComponentes'
import { ReactAnotado } from './ReactAnotado'
import { ReactEnVivo } from './ReactEnVivo'
import { registroBloquesLaboratorio } from './registro'

it('registra los bloques de React', () => {
  expect(registroBloquesLaboratorio['react-en-vivo']).toBe(ReactEnVivo)
  expect(registroBloquesLaboratorio['react-anotado']).toBe(ReactAnotado)
})

it('registra el árbol de componentes estático', () => {
  expect(registroBloquesLaboratorio['arbol-de-componentes']).toBe(ArbolDeComponentes)
})
