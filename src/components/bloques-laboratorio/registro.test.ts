import { expect, it } from 'vitest'

import { ArbolDeComponentes } from './ArbolDeComponentes'
import { CompiladorReact } from './CompiladorReact'
import { ReactAnotado } from './ReactAnotado'
import { ReactEnVivo } from './ReactEnVivo'
import { registroBloquesLaboratorio } from './registro'

it('registra los bloques de React', () => {
  expect(registroBloquesLaboratorio['react-en-vivo']).toBe(ReactEnVivo)
  expect(registroBloquesLaboratorio['react-anotado']).toBe(ReactAnotado)
  expect(registroBloquesLaboratorio['compilador-react']).toBe(CompiladorReact)
})

it('registra el árbol de componentes estático', () => {
  expect(registroBloquesLaboratorio['arbol-de-componentes']).toBe(ArbolDeComponentes)
})
