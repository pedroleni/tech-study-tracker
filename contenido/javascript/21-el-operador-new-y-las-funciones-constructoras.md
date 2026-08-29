# El operador new y las funciones constructoras

- **Módulo:** Funciones
- **Slug:** `el-operador-new-y-las-funciones-constructoras` (autogenerado del título)
- **Orden:** 62
- **Fuentes:** [The "new" keyword (web.dev)](https://web.dev/learn/javascript/functions/new) — ver `contenido/javascript/TEMARIO.md` #21

---

## Qué es y para qué sirve

`new` convierte una función normal en una fábrica de objetos: crea un objeto nuevo, y dentro de la función, `this` apunta a ese objeto recién creado. La sintaxis `class` — vista en su propio módulo más adelante — cubre hoy mejor este mismo caso de uso, pero entender `new` ayuda a entender `class` por dentro.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita fabricar objetos a partir de una función",
  "roles": [
    { "etiqueta": "Quien crea objetos con new", "rol": "Un objeto nuevo, cada vez", "descripcion": "Cada llamada con new produce un objeto distinto, con sus propias propiedades." },
    { "etiqueta": "Quien combina datos y métodos", "rol": "Todo en una sola unidad", "descripcion": "Una función constructora puede asignar tanto valores como funciones a this." },
    { "etiqueta": "Quien evita olvidar el new", "rol": "Un error real, no solo teórico", "descripcion": "Sin new, this deja de apuntar a ningún objeto nuevo — vuelve a las reglas normales de una llamada suelta." }
  ]
}
```

## new: crea un objeto, this apunta a él

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function MiFuncion() {\n    this.miPropiedad = true;\n  }\n\n  const miObjeto = new MiFuncion();\n  console.log(miObjeto.miPropiedad); // true\n</script>",
  "anotaciones": [
    { "fragmento": "const miObjeto = new MiFuncion();", "nota": "new crea un objeto vacío nuevo, y lo pasa como this dentro de MiFuncion — cualquier propiedad asignada a this termina en ese objeto." },
    { "fragmento": "console.log(miObjeto.miPropiedad); // true", "nota": "miObjeto es el objeto que new creó — con la propiedad que la función le asignó por dentro, a través de this." }
  ]
}
```

## Combinar datos y métodos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function MiFuncion(valorInicial) {\n    this.miValor = valorInicial;\n    this.duplicarMiValor = () => valorInicial * 2;\n  }\n\n  const miObjeto = new MiFuncion(10);\n  console.log(miObjeto.miValor);          // 10\n  console.log(miObjeto.duplicarMiValor()); // 20\n</script>",
  "anotaciones": [
    { "fragmento": "this.duplicarMiValor = () => valorInicial * 2;", "nota": "Una función constructora puede asignar tanto datos (miValor) como comportamiento (duplicarMiValor) al mismo objeto — todo agrupado en una sola unidad." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Convención: mayúscula inicial para funciones constructoras",
  "contenido": "MiFuncion, Persona, Coche — se escribe la primera letra en mayúscula precisamente para señalar que esa función está pensada para usarse con new, distinguiéndola de una función normal (miFuncion, calcularTotal) a simple vista."
}
```

## El peligro real: olvidar el new

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function Persona(nombre) {\n    this.nombre = nombre;\n  }\n\n  const correcto = new Persona('Ada');\n  console.log(correcto.nombre); // 'Ada'\n\n  const incorrecto = Persona('Grace'); // sin new, por error\n  console.log(incorrecto); // undefined\n</script>",
  "anotaciones": [
    { "fragmento": "const incorrecto = Persona('Grace'); // sin new, por error", "nota": "Sin new, Persona se ejecuta como una llamada de función SUELTA — this vuelve a las reglas normales vistas en la lección anterior (el objeto global, o undefined en modo estricto), no un objeto nuevo. La función tampoco devuelve nada explícito, así que incorrecto termina siendo undefined." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "class es la forma moderna preferida hoy",
  "contenido": "Los mismos casos de uso que resolvían las funciones constructoras están mejor cubiertos hoy por la sintaxis class, introducida en ES6 — con su propio módulo dedicado más adelante en este temario. Entender new sigue siendo útil: class funciona, por dentro, sobre este mismo mecanismo."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  function Persona(nombre) {\n    this.nombre = nombre;\n  }\n\n  const correcto = new Persona('Ada');\n  console.log(correcto.nombre);\n\n  const incorrecto = Persona('Grace');\n  console.log(incorrecto);\n</script>",
  "opciones": [
    "'Ada' y luego undefined — Persona() sin new no crea ningún objeto, this sigue las reglas normales de una llamada suelta",
    "'Ada' y luego 'Grace' — new es opcional, el resultado es el mismo con o sin él",
    "Un error de sintaxis en la segunda llamada, porque las funciones constructoras exigen new siempre"
  ],
  "correcta": 0,
  "explicacion": "Con new, se crea un objeto nuevo y this apunta a él: correcto.nombre es 'Ada'. Sin new, Persona('Grace') es una llamada de función suelta — this no apunta a ningún objeto nuevo, y como la función no tiene ningún return explícito, incorrecto termina siendo undefined."
}
```

## Lo que new NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "new es opcional al llamar una función constructora, el resultado es el mismo",
      "realidad": "Sin new, this vuelve a las reglas normales de una llamada de función suelta — no se crea ningún objeto nuevo."
    },
    {
      "mito": "Cualquier función se puede usar como constructora sin ningún cambio de convención",
      "realidad": "Técnicamente sí, pero la mayúscula inicial (Persona, no persona) señala explícitamente qué funciones están pensadas para usarse con new."
    },
    {
      "mito": "Las funciones constructoras siguen siendo la forma recomendada de crear objetos hoy",
      "realidad": "class, introducida en ES6, cubre mejor los mismos casos de uso — tiene su propio módulo dedicado más adelante."
    },
    {
      "mito": "this dentro de una función constructora se comporta igual que en cualquier función normal",
      "realidad": "Cuando se llama CON new, this apunta al objeto recién creado — un comportamiento especial, distinto de las reglas normales de this."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar el new al llamar una función pensada como constructora.", "texto": "this deja de apuntar a un objeto nuevo, con resultados inesperados." },
    { "titulo": "No seguir la convención de mayúscula inicial.", "texto": "Dificulta distinguir a simple vista qué funciones están pensadas para new." },
    { "titulo": "Usar funciones constructoras en código nuevo cuando class encaja mejor.", "texto": "class es la sintaxis moderna preferida para este mismo caso de uso." },
    { "titulo": "Confundir el this especial de new con las reglas normales de this.", "texto": "Con new, this SIEMPRE apunta al objeto recién creado, sin importar cómo se llamaría normalmente la función." }
  ]
}
```

## Ejercicios

1. Escribe una función constructora `Coche` que reciba una marca y la guarde en `this`.
2. Crea una instancia de `Coche` con `new`, y comprueba que su propiedad es accesible.
3. Llama a esa misma función SIN `new`, y explica qué le pasa a `this` en ese caso.
4. Explica por qué se recomienda escribir las funciones constructoras con mayúscula inicial.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe una función constructora Coche que reciba una marca y la guarde en this (ejercicio 1). Créala con new y comprueba la propiedad (ejercicio 2). Llámala SIN new y observa qué pasa (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nfunction Coche(marca) {\n  this.marca = marca;\n}\nconst miCoche = new Coche('Toyota');\nmostrar(miCoche.marca);\n\ntry {\n  const otroCoche = Coche('Ford');\n  mostrar(typeof otroCoche);\n} catch (error) {\n  mostrar('Error sin new: ' + error.message);\n}",
  "pestañaInicial": "js"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "The \"new\" keyword",
      "descripcion": "Capítulo de web.dev sobre qué hace new, cómo combinar datos y métodos en una función constructora, y la convención de nombres.",
      "url": "https://web.dev/learn/javascript/functions/new",
      "etiqueta": "web.dev"
    }
  ]
}
```
