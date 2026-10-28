import { describe, expect, it } from 'vitest'

import { explicarErrorReact } from './explicarError'
import { transformarArchivos } from './transformar'

describe('explicarErrorReact', () => {
  it.each([
    [
      "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.",
      'Uno de los componentes que usas vale undefined. Casi siempre es un import que no casa con su export: llaves para un export por defecto, sin llaves para uno con nombre, o un archivo que no exporta ese componente.',
    ],
    [
      "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: object. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.",
      'Uno de los componentes que usas es un objeto y no una función: suele pasar al importar el módulo entero o un objeto de exports en lugar del componente.',
    ],
    [
      'Objects are not valid as a React child (found: object with keys {nombre}). If you meant to render a collection of children, use an array instead.',
      'Estás pintando un objeto dentro del JSX. Muestra una de sus propiedades o conviértelo en texto.',
    ],
    [
      'Too many re-renders. React limits the number of renders to prevent an infinite loop.',
      'Un cambio de estado se ejecuta durante el propio render y lo repite sin fin. Suele ser un onClick={fn()} en vez de onClick={fn} o un set… suelto en el cuerpo del componente.',
    ],
    [
      'Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.',
      'Un efecto o un manejador actualiza el estado una y otra vez. Revisa las dependencias de useEffect y que el set… no se dispare en cada render.',
    ],
    [
      'Rendered more hooks than during the previous render.',
      'Un hook se llama dentro de un if, de un bucle o después de un return. Los hooks tienen que ejecutarse siempre, y en el mismo orden.',
    ],
    [
      'Rendered fewer hooks than expected. This may be caused by an accidental early return statement.',
      'Un hook se llama dentro de un if, de un bucle o después de un return. Los hooks tienen que ejecutarse siempre, y en el mismo orden.',
    ],
    [
      'Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.',
      'Un hook se está llamando fuera del cuerpo de un componente o de otro hook.',
    ],
    [
      'ReferenceError: ListaTareas is not defined',
      'Usas «ListaTareas» sin haberlo declarado ni importado.',
    ],
    [
      "TypeError: Cannot read properties of undefined (reading 'nombre')",
      'Intentas leer «nombre» de algo que vale undefined. Comprueba que ese valor exista antes de usarlo.',
    ],
    [
      "TypeError: Cannot read properties of null (reading 'id')",
      'Intentas leer «id» de algo que vale null. Comprueba que ese valor exista antes de usarlo.',
    ],
  ])('explica %s', (mensaje, explicacion) => {
    expect(explicarErrorReact(mensaje)).toBe(explicacion)
  })

  it('devuelve null para un error desconocido', () => {
    expect(explicarErrorReact('La receta no existe')).toBeNull()
  })

  it.each([
    {
      caso: 'dos elementos hermanos sin envolver',
      codigo:
        'export default function App() { return (<h1>a</h1><p>b</p>) }',
      mensaje: 'Unterminated regular expression',
      explicacion:
        'Suele ser JSX mal formado: dos elementos sueltos que hay que envolver en <>…</> o en otro elemento, una etiqueta sin cerrar, o una llave o un paréntesis de más o de menos.',
    },
    {
      caso: 'una etiqueta cerrada con otro nombre',
      codigo: 'export default function App() { return <div><p>a</div> }',
      mensaje: 'Unterminated JSX contents',
      explicacion:
        'Suele ser JSX mal formado: dos elementos sueltos que hay que envolver en <>…</> o en otro elemento, una etiqueta sin cerrar, o una llave o un paréntesis de más o de menos.',
    },
    {
      caso: 'una etiqueta sin cerrar',
      codigo: 'export default function App() { return <div> }',
      mensaje: 'Unterminated JSX contents',
      explicacion:
        'Suele ser JSX mal formado: dos elementos sueltos que hay que envolver en <>…</> o en otro elemento, una etiqueta sin cerrar, o una llave o un paréntesis de más o de menos.',
    },
  ])('explica el mensaje real de Sucrase para $caso', async ({ codigo, mensaje, explicacion }) => {
    const resultado = await transformarArchivos([{ nombre: 'App.jsx', codigo }])

    expect(resultado.ok).toBe(false)
    if (resultado.ok) throw new Error('Sucrase debería rechazar el JSX de la prueba')
    expect(resultado.mensaje).toBe(mensaje)
    expect(explicarErrorReact(resultado.mensaje)).toBe(explicacion)
  })
})
