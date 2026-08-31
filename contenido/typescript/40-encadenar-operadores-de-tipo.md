# Encadenar operadores: construir un tipo a partir de otro

- **Módulo:** Operadores de manipulación de tipos
- **Slug:** `encadenar-operadores-de-tipo` (autogenerado del título)
- **Orden:** 400
- **Fuentes:** [Creating Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html) — ver `contenido/typescript/TEMARIO.md` #40

---

## Qué es y para qué sirve

`keyof`, `typeof` e indexed access types no son herramientas aisladas — su verdadero valor aparece al combinarlas entre sí y con genéricos, para derivar tipos nuevos a partir de estructuras que ya existen, en vez de declararlos todos a mano y arriesgarse a que se desincronicen. Esta lección cierra el módulo uniendo las tres piezas en un ejemplo real.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "keyof + typeof + indexed access, combinados",
  "consigna": "Añade una propiedad nueva a `rutas` y comprueba (razonando, o probando en obtenerRuta) que TypeScript la reconoce automáticamente sin tocar ningún tipo declarado a mano.",
  "ts": "const rutas = {\n  inicio: '/',\n  perfil: '/perfil',\n  ajustes: '/ajustes',\n};\n\ntype NombreRuta = keyof typeof rutas; // se deriva, no se escribe a mano\n\nfunction obtenerRuta<K extends NombreRuta>(nombre: K): typeof rutas[K] {\n  return rutas[nombre];\n}\n\nconsole.log(obtenerRuta('perfil'));",
  "pestañaInicial": "ts"
}
```

## Por qué esto importa: un único punto de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "exito",
  "titulo": "El objeto real es la única fuente de verdad",
  "contenido": "En el ejemplo, NombreRuta y el tipo de retorno de obtenerRuta se derivan del objeto rutas — nunca se escribió 'inicio' | 'perfil' | 'ajustes' a mano en ningún sitio. Añadir una ruta nueva a rutas actualiza automáticamente todos los tipos derivados, sin tocar ninguna declaración de tipo por separado. Este es el objetivo real de encadenar estos operadores: eliminar la posibilidad de que un tipo y el valor del que depende se desincronicen."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Declarar tipos derivables a mano en vez de derivarlos con keyof/typeof.", "texto": "Cualquier tipo escrito a mano que refleje la forma de un valor real corre el riesgo de desincronizarse el día que ese valor cambie — derivarlo automáticamente elimina ese riesgo por completo." },
    { "titulo": "Sobrecombinar operadores hasta que el tipo resultante sea difícil de leer.", "texto": "Encadenar tres o cuatro operadores en una sola línea puede ser correcto pero ilegible — dar un nombre intermedio a un paso (con un alias de tipo) suele ayudar más que forzarlo todo en una expresión." }
  ]
}
```

## Ejercicios

1. Declara un objeto `permisos` con al menos tres claves booleanas, y deriva un tipo `NombrePermiso` con `keyof typeof`.
2. Escribe una función genérica que reciba una clave de ese objeto y devuelva su valor, con el tipo de retorno correcto derivado automáticamente.
3. Explica, con tus propias palabras, por qué derivar un tipo de un valor real es más seguro a largo plazo que escribirlo a mano.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Creating Types from Types",
      "descripcion": "Capítulo del Handbook que presenta la familia completa de operadores de manipulación de tipos.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/types-from-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
