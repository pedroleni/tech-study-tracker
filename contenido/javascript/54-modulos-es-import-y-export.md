# Módulos ES: import y export

- **Módulo:** JavaScript moderno
- **Slug:** `modulos-es-import-y-export` (autogenerado del título)
- **Orden:** 161
- **Fuentes:** [JavaScript modules (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) — ver `contenido/javascript/TEMARIO.md` #54

---

## Qué es y para qué sirve

Abre el módulo de JavaScript moderno. Los módulos ES dividen el código en archivos independientes, cada uno con su propio ámbito — `export` decide qué comparte un archivo con los demás, `import` trae de vuelta lo que otro archivo exportó.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita compartir código entre archivos",
  "roles": [
    { "etiqueta": "Quien comparte algo con nombre", "rol": "export", "descripcion": "Un módulo puede tener varios exports con nombre — cada uno se importa por ese nombre exacto." },
    { "etiqueta": "Quien exporta lo principal", "rol": "export default", "descripcion": "Como mucho uno por módulo — se importa con cualquier nombre, sin llaves." },
    { "etiqueta": "Quien trae algo de vuelta", "rol": "import", "descripcion": "Usa la ruta relativa al archivo, y recibe una vista de solo lectura de lo exportado." }
  ]
}
```

## Exports con nombre

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // cuadrado.js\n  export const nombre = 'cuadrado';\n\n  export function dibujar(ctx, lado, x, y, color) {\n    ctx.fillStyle = color;\n    ctx.fillRect(x, y, lado, lado);\n    return { lado, x, y, color };\n  }\n\n  // principal.js\n  import { nombre, dibujar } from './modulos/cuadrado.js';\n\n  console.log(nombre); // 'cuadrado'\n</script>",
  "anotaciones": [
    { "fragmento": "export const nombre = 'cuadrado';", "nota": "export delante de una declaración la hace disponible para otros archivos — se pueden tener varios exports con nombre en un mismo módulo." },
    { "fragmento": "import { nombre, dibujar } from './modulos/cuadrado.js';", "nota": "import { } trae de vuelta lo exportado, usando la ruta RELATIVA al archivo — los nombres entre llaves deben coincidir exactamente con los exportados." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Los valores importados son de solo lectura",
  "contenido": "Un valor importado se comporta como si fuera const desde el archivo que lo importa — intentar reasignarlo (nombre = 'otro') lanza un error, aunque en el módulo original se haya declarado con let."
}
```

## export default: uno solo por módulo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // cuadrado.js\n  export default function dibujarCuadradoAleatorio(ctx) {\n    // ...\n  }\n\n  // principal.js\n  import dibujarCuadrado from './modulos/cuadrado.js';\n</script>",
  "anotaciones": [
    { "fragmento": "export default function dibujarCuadradoAleatorio(ctx) {", "nota": "Cada módulo admite SOLO UN export default — es lo que ese archivo considera su exportación 'principal'." },
    { "fragmento": "import dibujarCuadrado from './modulos/cuadrado.js';", "nota": "Al importar un default, se le puede poner CUALQUIER nombre (aquí, dibujarCuadrado) — sin llaves {}, y sin que tenga que coincidir con el nombre original de la función." }
  ]
}
```

## script type="module", modo estricto y ámbito propio

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script type=\"module\" src=\"principal.js\"></script>\n\n<script>\n  // Dentro de principal.js:\n  const miVariable = 'local'; // NO es global — solo existe en este módulo\n  document.getElementById('main').textContent = miVariable; // pero SÍ puede usar globales como document\n</script>",
  "anotaciones": [
    { "fragmento": "<script type=\"module\" src=\"principal.js\"></script>", "nota": "type=\"module\" es obligatorio para que el navegador trate el archivo como módulo — sin él, import/export lanzan un SyntaxError." },
    { "fragmento": "const miVariable = 'local'; // NO es global — solo existe en este módulo", "nota": "Todo el código de un módulo se ejecuta en modo estricto automáticamente, y sus variables de nivel superior NO contaminan el ámbito global — aunque sí puede seguir accediendo a globales reales como document o window." }
  ]
}
```

## Renombrar al importar, o traer todo junto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  import {\n    dibujar as dibujarCuadrado,\n    nombre as etiqueta,\n  } from './modulos/cuadrado.js';\n\n  import * as Cuadrado from './modulos/cuadrado.js';\n  const resultado = Cuadrado.dibujar(contexto, 50, 50, 100, 'azul');\n</script>",
  "anotaciones": [
    { "fragmento": "import {\n    dibujar as dibujarCuadrado,\n    nombre as etiqueta,\n  } from './modulos/cuadrado.js';", "nota": "as renombra un import al traerlo — útil para evitar colisiones de nombres entre módulos distintos que exportan algo con el mismo nombre." },
    { "fragmento": "import * as Cuadrado from './modulos/cuadrado.js';", "nota": "import * as Nombre trae TODOS los exports con nombre del módulo, agrupados en un único objeto — cada export se accede como una propiedad de ese objeto (Cuadrado.dibujar, Cuadrado.nombre...)." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Diferido automáticamente, y ejecutado una sola vez",
  "contenido": "A diferencia de un <script> normal, un módulo se difiere automáticamente (como si tuviera defer, sin necesitar escribirlo) — y aunque se referencie desde varios sitios, solo se ejecuta UNA vez."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Los módulos exigen un servidor real",
  "contenido": "Por las restricciones de CORS que los navegadores aplican a los módulos, abrir un archivo directamente con file:// no funciona — hace falta servirlo a través de un servidor real, aunque sea uno local de desarrollo."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  // Dentro de un módulo:\n  const secreto = 'solo aquí dentro';\n  console.log(typeof window.secreto);\n</script>",
  "opciones": [
    "'undefined' — las variables declaradas dentro de un módulo NO se vuelven globales, aunque estén en el nivel superior del archivo",
    "'string' — cualquier variable de nivel superior en un módulo se añade automáticamente a window",
    "Un error, porque los módulos no pueden acceder a window en absoluto"
  ],
  "correcta": 0,
  "explicacion": "A diferencia de un script clásico (donde una variable de nivel superior con var podía volverse global), las variables de un módulo tienen su PROPIO ámbito — secreto no se convierte en window.secreto, así que typeof window.secreto da 'undefined'. Los módulos SÍ pueden acceder a globales reales como window o document, pero no al revés."
}
```

## Lo que los módulos NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un archivo con import/export funciona igual sin necesitar <script type=\"module\">",
      "realidad": "Sin ese atributo, import/export lanzan un SyntaxError."
    },
    {
      "mito": "Un módulo referenciado desde varios <script> se ejecuta una vez por cada referencia",
      "realidad": "Se ejecuta UNA sola vez, sin importar cuántas veces se referencie."
    },
    {
      "mito": "Un módulo puede tener varios export default",
      "realidad": "Solo UNO por módulo — el resto deben ser exports con nombre."
    },
    {
      "mito": "Las variables de nivel superior de un módulo se vuelven globales, como en un script clásico",
      "realidad": "Tienen su propio ámbito — no contaminan window ni el resto de la página."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar type=\"module\" en la etiqueta <script>.", "texto": "Provoca errores de sintaxis directos con import/export." },
    { "titulo": "Intentar reasignar un valor importado.", "texto": "Se comporta como const desde el archivo que lo importa, sin importar cómo se declaró en el original." },
    { "titulo": "Confundir un export con nombre (varios por módulo) con el export default (solo uno).", "texto": "Cada uno se importa con una sintaxis distinta." },
    { "titulo": "Abrir un archivo con módulos directamente con file://.", "texto": "Hace falta servirlo desde un servidor real, por las restricciones de CORS." }
  ]
}
```

## Ejercicios

1. Crea un módulo con al menos dos exports con nombre, e impórtalos en otro archivo con `import { }`.
2. Crea un módulo con un `export default`, e impórtalo con el nombre que prefieras.
3. Usa la sintaxis `import * as Nombre` para importar todos los exports con nombre de un módulo en un único objeto.
4. Declara una variable de nivel superior dentro de un módulo, y comprueba que no aparece en `window`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "JavaScript modules",
      "descripcion": "Guía de MDN sobre exports con nombre y default, import (incluido renombrar con as, y el import de espacio de nombres con *), type=\"module\", y el ámbito propio de un módulo.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules",
      "etiqueta": "MDN"
    }
  ]
}
```
