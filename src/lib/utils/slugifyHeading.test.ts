import { slugifyHeading } from './slugifyHeading'

describe('slugifyHeading', () => {
  it('pasa a minúsculas y separa por guiones', () => {
    expect(slugifyHeading('Qué es y para qué sirve')).toBe('que-es-y-para-que-sirve')
  })

  it('quita tildes y diacríticos', () => {
    expect(slugifyHeading('Cómo se usa')).toBe('como-se-usa')
  })

  it('quita emoji y símbolos, sin dejar guiones colgando', () => {
    expect(slugifyHeading('Lo que HTML NO es 👤')).toBe('lo-que-html-no-es')
  })

  it('colapsa espacios y puntuación consecutivos en un único guion', () => {
    expect(slugifyHeading('Errores típicos: ¿cuáles?')).toBe('errores-tipicos-cuales')
  })
})
