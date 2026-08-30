# Interoperabilidad entre CommonJS y ES modules

- **Módulo:** El sistema de módulos
- **Slug:** `interoperabilidad-commonjs-esm` (autogenerado del título)
- **Orden:** 110
- **Fuentes:** [Packages reference](https://nodejs.org/api/packages.html) — ver `contenido/nodejs/TEMARIO.md` #11

---

## Qué es y para qué sirve

Un proyecto real, sobre todo si depende de paquetes de npm antiguos, casi nunca es 100% de un solo sistema de módulos. Node.js permite mezclar CommonJS y ES modules dentro del mismo proyecto — con algunas reglas concretas sobre qué puede importar a qué, y con qué limitaciones.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// Un ES module SÍ puede importar un paquete CommonJS:\nimport paqueteAntiguo from 'paquete-commonjs'; // funciona\n\n// Un fichero CommonJS NO puede usar import de un ES module directamente:\n// const { algo } = require('paquete-esm'); // Error real en muchos casos\n\n// La alternativa real desde CommonJS: import() dinámico (siempre devuelve una promesa)\nasync function cargar() {\n  const { algo } = await import('paquete-esm');\n  return algo;\n}\n</script>",
  "anotaciones": [
    { "fragmento": "import paqueteAntiguo from 'paquete-commonjs'; // funciona", "nota": "Node.js envuelve automáticamente un módulo CommonJS para que se pueda importar desde un ES module — la dirección \"moderno importa antiguo\" es la que mejor soportada está." },
    { "fragmento": "const { algo } = await import('paquete-esm');", "nota": "import() como función (no como palabra clave) SÍ está disponible en CommonJS, y siempre devuelve una Promise — es el mecanismo real para cargar un ES module desde código CommonJS, cuando no queda otra opción." }
  ]
}
```

## Extensiones que siempre ganan, sin importar "type"

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": ".mjs y .cjs son explícitos siempre",
  "contenido": "Independientemente de lo que diga \"type\" en el package.json más cercano, un fichero .mjs SIEMPRE se trata como ES module, y uno .cjs SIEMPRE como CommonJS — es la forma de forzar un sistema concreto para un fichero suelto dentro de un proyecto que, en general, usa el otro."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Intentar usar require() para cargar un paquete que solo distribuye ES modules.", "texto": "Muchos paquetes modernos de npm ya no publican una versión CommonJS — la única forma de usarlos desde código CommonJS es el import() dinámico dentro de una función async." },
    { "titulo": "Pensar que se puede mezclar require e import en el MISMO fichero.", "texto": "La mezcla ocurre entre FICHEROS de un proyecto (uno CommonJS, otro ES module) — un fichero individual sigue siendo uno de los dos sistemas, nunca los dos combinados en el mismo lugar." }
  ]
}
```

## Ejercicios

1. Explica en qué dirección es más sencilla la interoperabilidad: ¿ES module importando CommonJS, o al revés?
2. ¿Qué hace `.mjs`/`.cjs` que `"type"` en `package.json` no puede anular?
3. Escribe un fragmento de código CommonJS que cargue un paquete ES module usando `import()` dinámico.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Packages reference",
      "descripcion": "Referencia oficial sobre interoperabilidad entre CommonJS y ES modules.",
      "url": "https://nodejs.org/api/packages.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
