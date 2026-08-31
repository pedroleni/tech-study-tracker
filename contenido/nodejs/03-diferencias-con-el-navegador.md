# Diferencias reales entre Node.js y el navegador

- **Módulo:** Qué es Node.js y por qué existe
- **Slug:** `diferencias-con-el-navegador` (autogenerado del título)
- **Orden:** 30
- **Fuentes:** [Differences between Node.js and the Browser](https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser) — ver `contenido/nodejs/TEMARIO.md` #3

---

## Qué es y para qué sirve

Aunque el lenguaje es el mismo, el ENTORNO alrededor cambia por completo — algunas APIs que ya conoces del navegador no existen en Node.js, y Node.js trae otras que un navegador nunca podría dar por razones de seguridad. Conocer esta lista evita el error más común al empezar: escribir código pensado para el navegador y que Node.js no reconozca.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// Pensado para el navegador - no existe en Node.js\ndocument.querySelector('#app').textContent = 'Hola';\nlocalStorage.setItem('clave', 'valor');\nwindow.alert('Hola');\n</script>",
  "despues": "<script>\n// Pensado para Node.js - no existe en el navegador\nconst fs = require('node:fs');\nfs.writeFileSync('salida.txt', 'Hola');\n\nconsole.log(process.env.HOME); // variables de entorno del sistema\nconsole.log(process.argv); // argumentos de la línea de comandos\n</script>",
  "nota": "document, window y localStorage son APIs del NAVEGADOR (parte del DOM y de las APIs Web) - no existen en Node.js porque no hay ninguna página que renderizar. process, y módulos como fs o path, son APIs de NODE.JS - no existen en el navegador porque darían acceso al sistema de ficheros o variables de entorno reales, algo que un sitio web nunca debería poder hacer sin permiso explícito."
}
```

## Lo que sí es igual en los dos sitios

```laboratorio
{
  "tipo": "callout",
  "variante": "exito",
  "titulo": "El lenguaje, console, y buena parte de las APIs Web modernas",
  "contenido": "console.log, JSON.parse/stringify, Promise, async/await, Array/Object/Map/Set, y desde hace tiempo también fetch — todo esto funciona igual en los dos entornos. La lista de diferencias reales es más corta de lo que parece al principio: sobre todo el DOM (document, window) por un lado, y fs/process/módulos del sistema operativo por el otro."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Copiar código de una lección de JavaScript orientada al navegador y ejecutarlo con node archivo.js.", "texto": "Si usa document, window o cualquier API del DOM, falla con un ReferenceError — ese código está pensado para ejecutarse dentro de un navegador, no con Node.js." },
    { "titulo": "Buscar cómo acceder al sistema de ficheros desde una lección de JavaScript del navegador.", "texto": "No existe una forma segura de hacerlo desde un sitio web sin permiso explícito del usuario — es, a propósito, una de las diferencias de seguridad más importantes entre los dos entornos." }
  ]
}
```

## Ejercicios

1. Haz una lista de tres APIs que existen en el navegador pero no en Node.js, y tres que existen en Node.js pero no en el navegador.
2. Explica por qué un sitio web no puede leer archivos del disco duro del usuario sin su permiso explícito.
3. ¿Qué tienen en común `console.log`, `JSON.parse` y `Promise` que hace que funcionen igual en los dos entornos?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Differences between Node.js and the Browser",
      "descripcion": "Comparación oficial de las APIs disponibles en cada entorno.",
      "url": "https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser",
      "etiqueta": "Node.js"
    }
  ]
}
```
