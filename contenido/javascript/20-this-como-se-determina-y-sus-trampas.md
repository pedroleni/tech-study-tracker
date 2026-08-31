# this: cómo se determina y sus trampas

- **Módulo:** Funciones
- **Slug:** `this-como-se-determina-y-sus-trampas` (autogenerado del título)
- **Orden:** 59
- **Fuentes:** [The "this" keyword (web.dev)](https://web.dev/learn/javascript/functions/this) — ver `contenido/javascript/TEMARIO.md` #20

---

## Qué es y para qué sirve

`this` no depende de dónde se escribió una función — depende de CÓMO se la llama. Esa única regla explica casi todas las sorpresas: un método que funciona perfectamente hasta que se extrae a una variable suelta, y de repente deja de funcionar.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita saber de dónde sale this",
  "roles": [
    { "etiqueta": "Quien determina this por la llamada", "rol": "No por dónde se escribió la función", "descripcion": "La misma función puede tener un this distinto según cómo se invoque cada vez." },
    { "etiqueta": "Quien pierde el enlace al extraer", "rol": "Un método sacado de su objeto", "descripcion": "Pasar person.metodo a otro sitio sin más rompe su conexión con person." },
    { "etiqueta": "Quien fija this a mano con bind", "rol": "call, apply y bind", "descripcion": "Tres formas de controlar explícitamente qué será this, sin depender de cómo se llame la función." }
  ]
}
```

## this en una llamada de función suelta

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function mostrarThis() {\n    console.log(this);\n  }\n\n  mostrarThis(); // el objeto global (window en el navegador)\n\n  'use strict';\n  function mostrarThisEstricto() {\n    console.log(this); // undefined, en modo estricto\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "mostrarThis(); // el objeto global (window en el navegador)", "nota": "Fuera de modo estricto, una llamada de función SUELTA (sin ningún objeto delante) hace que this apunte al objeto global." },
    { "fragmento": "console.log(this); // undefined, en modo estricto", "nota": "En modo estricto, ese mismo caso da undefined en vez del objeto global — un comportamiento más seguro, pensado para evitar modificar el objeto global por accidente." }
  ]
}
```

## this en un método: se enlaza al objeto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = {\n    nombre: 'Ada',\n    saludar() {\n      console.log(this.nombre);\n    },\n  };\n\n  persona.saludar(); // 'Ada'\n</script>",
  "anotaciones": [
    { "fragmento": "persona.saludar(); // 'Ada'", "nota": "Cuando una función se llama COMO MÉTODO de un objeto (persona.saludar()), this dentro de ella apunta a ESE objeto — persona, en este caso." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La regla clave: cómo se llama, no dónde se define",
  "contenido": "this se determina por el CONTEXTO DE EJECUCIÓN — es decir, por cómo se invoca la función en ese momento concreto, no por dónde se escribió en el código. La misma función, llamada de dos formas distintas, puede tener un this completamente diferente cada vez."
}
```

## El binding perdido: extraer un método

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = {\n    nombre: 'Ada',\n    saludar() {\n      console.log(this.nombre);\n    },\n  };\n\n  const funcionSuelta = persona.saludar; // se extrae, sin el objeto\n  funcionSuelta(); // undefined (o error) — ya no es una llamada de método\n\n  setTimeout(persona.saludar, 100); // el mismo problema, en la práctica\n</script>",
  "anotaciones": [
    { "fragmento": "const funcionSuelta = persona.saludar; // se extrae, sin el objeto", "nota": "Al asignar persona.saludar a una variable, solo se copia la FUNCIÓN — el enlace con persona no viaja con ella. Al llamar funcionSuelta(), ya es una llamada de función suelta, no una llamada de método." },
    { "fragmento": "setTimeout(persona.saludar, 100); // el mismo problema, en la práctica", "nota": "Un caso muy real: pasar un método a setTimeout (o a addEventListener) sin más tiene exactamente el mismo problema — se ejecuta como función suelta, this ya no es persona." }
  ]
}
```

## Fijar this explícitamente: call, apply y bind

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const persona = { nombre: 'Ada' };\n\n  function saludar() {\n    console.log(this.nombre);\n  }\n\n  saludar.call(persona); // 'Ada' — this fijado explícitamente\n  const saludarComoAda = saludar.bind(persona);\n  saludarComoAda(); // 'Ada' — this queda fijado para siempre\n</script>",
  "anotaciones": [
    { "fragmento": "saludar.call(persona); // 'Ada' — this fijado explícitamente", "nota": "call() ejecuta la función AHORA MISMO, con this fijado al objeto que se le pasa — sin importar cómo se llamaría normalmente." },
    { "fragmento": "const saludarComoAda = saludar.bind(persona);", "nota": "bind() no ejecuta nada todavía — devuelve una NUEVA función, con this ya fijado a persona para siempre, sin importar cómo se llame esa nueva función después." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Las arrow functions no tienen este problema",
  "contenido": "Como se vio en la lección anterior, una arrow function no tiene su propio this — hereda el de su entorno léxico. Por eso, dentro de un método, una arrow function definida ahí adentro sigue apuntando al objeto correcto, incluso en casos donde una función normal perdería el enlace."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const persona = {\n    nombre: 'Ada',\n    saludar() {\n      console.log(this.nombre);\n    },\n  };\n\n  persona.saludar();\n  const funcionSuelta = persona.saludar;\n  funcionSuelta();\n</script>",
  "opciones": [
    "'Ada' y luego undefined (o un error) — this depende de CÓMO se llama, no de dónde se definió el método",
    "'Ada' las dos veces — this siempre recuerda el objeto donde se definió el método",
    "undefined las dos veces — this nunca se puede usar dentro de un método de objeto"
  ],
  "correcta": 0,
  "explicacion": "persona.saludar() es una llamada de MÉTODO: this es persona, imprime 'Ada'. funcionSuelta() es una llamada de función SUELTA — el enlace con persona se perdió al extraer la función, así que this ya no es persona."
}
```

## Lo que this NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "this siempre se refiere al objeto donde se definió la función",
      "realidad": "Se determina por CÓMO se llama la función, no por dónde se escribió — la misma función puede tener un this distinto según cómo se invoque."
    },
    {
      "mito": "Extraer un método a una variable no cambia su comportamiento",
      "realidad": "Pierde su enlace con el objeto original — al llamarlo por separado, ya no es una llamada de método, así que this deja de apuntar a ese objeto."
    },
    {
      "mito": "call(), apply() y bind() son formas alternativas de llamar una función, sin relación con this",
      "realidad": "Las tres existen específicamente para CONTROLAR this de forma explícita, sin importar cómo se llame la función normalmente."
    },
    {
      "mito": "En modo estricto, this en una llamada de función suelta se comporta igual que fuera de modo estricto",
      "realidad": "En modo estricto, da undefined; fuera de él, apunta al objeto global."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Asumir que this siempre apunta al objeto donde se definió una función.", "texto": "Depende de cómo se llama en cada caso concreto, no de dónde se escribió." },
    { "titulo": "Extraer un método de un objeto (por ejemplo, para setTimeout) sin tener en cuenta el this perdido.", "texto": "Un caso muy real, no solo teórico." },
    { "titulo": "No usar bind() cuando hace falta fijar this de antemano.", "texto": "Antes de pasar una función a otro sitio donde perdería su enlace." },
    { "titulo": "Confundir el comportamiento de this en modo estricto con el de fuera de él.", "texto": "undefined frente al objeto global, en una llamada de función suelta." }
  ]
}
```

## Ejercicios

1. Escribe un objeto con un método que use `this`, y llama al método normalmente.
2. Extrae ese mismo método a una variable suelta y llama a la variable — explica qué le pasa a `this`.
3. Usa `bind()` para fijar `this` de ese método suelto, de forma que vuelva a funcionar correctamente.
4. Explica la diferencia entre `this` en modo estricto y fuera de él, en una llamada de función suelta.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un objeto con un método que use this, y llámalo normalmente (ejercicio 1). Extrae ese método a una variable suelta y llámala — observa qué le pasa a this (ejercicio 2). Usa bind() para arreglarlo (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst persona = {\n  nombre: 'Ada',\n  saludar() {\n    mostrar('Hola, soy ' + this.nombre);\n  },\n};\npersona.saludar();\n\nconst saludarSuelto = persona.saludar;\ntry {\n  saludarSuelto();\n} catch (error) {\n  mostrar('Error al llamarlo suelto: ' + error.message);\n}\n\nconst saludarFijado = persona.saludar.bind(persona);\nsaludarFijado();",
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
      "titulo": "The \"this\" keyword",
      "descripcion": "Capítulo de web.dev sobre cómo se determina this en llamadas sueltas, en métodos, el binding perdido al extraer un método, y call/apply/bind.",
      "url": "https://web.dev/learn/javascript/functions/this",
      "etiqueta": "web.dev"
    }
  ]
}
```
