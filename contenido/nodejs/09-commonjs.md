# CommonJS: require y module.exports

- **Módulo:** El sistema de módulos
- **Slug:** `commonjs` (autogenerado del título)
- **Orden:** 90
- **Fuentes:** [Packages reference](https://nodejs.org/api/packages.html) — ver `contenido/nodejs/TEMARIO.md` #9

---

## Qué es y para qué sirve

CommonJS es el sistema de módulos ORIGINAL de Node.js — anterior a que `import`/`export` existieran en JavaScript. Usa `require()` para importar y `module.exports` para exportar. Sigue siendo real y ampliamente usado: mucho código y muchos paquetes de npm todavía están escritos así, y entenderlo es necesario para trabajar con ese ecosistema.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// matematicas.js\nfunction sumar(a, b) {\n  return a + b;\n}\n\nmodule.exports = { sumar };\n\n// main.js\nconst { sumar } = require('./matematicas.js');\nconsole.log(sumar(2, 3));\n</script>",
  "anotaciones": [
    { "fragmento": "module.exports = { sumar };", "nota": "module.exports empieza siendo un objeto vacío en cada fichero — asignarle propiedades (o reemplazarlo por completo) es cómo un módulo de CommonJS decide qué expone al exterior." },
    { "fragmento": "const { sumar } = require('./matematicas.js');", "nota": "require() es una función normal (no una palabra clave del lenguaje, a diferencia de import) que lee el fichero, lo ejecuta, y devuelve lo que sea que module.exports contenga en ese momento." }
  ]
}
```

## Cómo decide Node.js si un fichero es CommonJS

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Extensión .cjs", "texto": "Siempre se trata como CommonJS, sin importar nada más en el proyecto." },
    { "titulo": "Extensión .js sin \"type\": \"module\" en el package.json más cercano", "texto": "CommonJS por defecto — es el comportamiento histórico de Node.js, y sigue siendo el valor por defecto si no se indica lo contrario." },
    { "titulo": "\"type\": \"commonjs\" explícito en package.json", "texto": "Fuerza CommonJS para los .js de ese paquete, incluso si en algún momento se cambiara la convención por defecto." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Mezclar require() e import en el mismo fichero.", "texto": "Un fichero es CommonJS o ES module, no las dos cosas — la lección 11 explica cómo hacer que un proyecto use ambos sistemas en ficheros distintos." },
    { "titulo": "Olvidar la extensión del fichero en require('./modulo').", "texto": "require() sí completa extensiones automáticamente (a diferencia de import en ES modules) — pero solo para .js, .json y .node, no para cualquier extensión arbitraria." }
  ]
}
```

## Ejercicios

1. Crea dos ficheros CommonJS: uno que exporte una función, y otro que la importe y la use.
2. Explica la diferencia entre `module.exports = algo` y `module.exports.algo = valor`.
3. ¿Cómo decide Node.js si un fichero `.js` concreto es CommonJS o ES module?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Packages reference",
      "descripcion": "Referencia oficial sobre cómo Node.js determina el sistema de módulos de cada fichero.",
      "url": "https://nodejs.org/api/packages.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
