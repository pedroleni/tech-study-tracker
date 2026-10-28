const EXPLICACION_HOOKS =
  'Un hook se llama dentro de un if, de un bucle o después de un return. Los hooks tienen que ejecutarse siempre, y en el mismo orden.'
const EXPLICACION_JSX_MAL_FORMADO =
  'Suele ser JSX mal formado: dos elementos sueltos que hay que envolver en <>…</> o en otro elemento, una etiqueta sin cerrar, o una llave o un paréntesis de más o de menos.'

export function explicarErrorReact(texto: string): string | null {
  // Sucrase 3.35.1 devuelve el mismo «Unterminated JSX contents» para una
  // etiqueta sin cerrar y otra cerrada con un nombre distinto. Al no poder
  // distinguirlas, se usa la explicación general y no una causa falsa.
  if (
    texto.includes('Unterminated regular expression') ||
    texto.includes('Unterminated JSX contents') ||
    texto.includes('Unexpected token, expected ","')
  ) {
    return EXPLICACION_JSX_MAL_FORMADO
  }
  if (
    texto.includes('Expected corresponding JSX closing tag') ||
    texto.includes('has no corresponding closing tag')
  ) {
    return 'Una etiqueta JSX no se cierra o se cierra con otro nombre. Cada <x> necesita su </x>, o escríbela como <x />.'
  }
  if (texto.includes('Element type is invalid') && texto.includes('got: undefined')) {
    return 'Uno de los componentes que usas vale undefined. Casi siempre es un import que no casa con su export: llaves para un export por defecto, sin llaves para uno con nombre, o un archivo que no exporta ese componente.'
  }
  if (texto.includes('Element type is invalid') && texto.includes('got: object')) {
    return 'Uno de los componentes que usas es un objeto y no una función: suele pasar al importar el módulo entero o un objeto de exports en lugar del componente.'
  }
  if (texto.includes('Objects are not valid as a React child')) {
    return 'Estás pintando un objeto dentro del JSX. Muestra una de sus propiedades o conviértelo en texto.'
  }
  if (texto.includes('Too many re-renders')) {
    return 'Un cambio de estado se ejecuta durante el propio render y lo repite sin fin. Suele ser un onClick={fn()} en vez de onClick={fn} o un set… suelto en el cuerpo del componente.'
  }
  if (texto.includes('Maximum update depth exceeded')) {
    return 'Un efecto o un manejador actualiza el estado una y otra vez. Revisa las dependencias de useEffect y que el set… no se dispare en cada render.'
  }
  if (
    texto.includes('Rendered more hooks than during the previous render') ||
    texto.includes('Rendered fewer hooks than expected')
  ) {
    return EXPLICACION_HOOKS
  }
  if (texto.includes('Invalid hook call')) {
    return 'Un hook se está llamando fuera del cuerpo de un componente o de otro hook.'
  }

  const referencia = texto.match(/(?:ReferenceError:\s*)?([A-Za-z_$][\w$]*) is not defined/)
  if (referencia) return `Usas «${referencia[1]}» sin haberlo declarado ni importado.`

  const propiedad = texto.match(
    /Cannot read properties of (undefined|null) \(reading ['"]([^'"]+)['"]\)/,
  )
  if (propiedad) {
    return `Intentas leer «${propiedad[2]}» de algo que vale ${propiedad[1]}. Comprueba que ese valor exista antes de usarlo.`
  }

  return null
}
