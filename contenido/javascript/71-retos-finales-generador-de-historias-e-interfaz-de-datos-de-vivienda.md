# Retos finales: generador de historias e interfaz de datos de vivienda

- **Módulo:** Calidad y organización
- **Slug:** `retos-finales-generador-de-historias-e-interfaz-de-datos-de-vivienda` (autogenerado del título)
- **Orden:** 212
- **Fuentes:** [Challenge: Silly story generator (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Silly_story_generator) + [Challenge: Building a house data UI (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/House_data_UI) — ver `contenido/javascript/TEMARIO.md` #71

---

## Qué es y para qué sirve

La última lección del temario. Dos retos que no introducen nada nuevo — combinan, en proyectos reales, prácticamente todo lo visto en las 70 lecciones anteriores: template literals, arrays, condicionales, `fetch()`, `filter()`, y construir el DOM con seguridad.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién junta todas las piezas del temario",
  "roles": [
    { "etiqueta": "Quien genera texto dinámico", "rol": "El generador de historias", "descripcion": "Plantillas, arrays, selección aleatoria y condicionales, combinados en un solo flujo." },
    { "etiqueta": "Quien filtra datos reales", "rol": "La interfaz de datos de vivienda", "descripcion": "fetch(), filter(), y construir el DOM dinámicamente a partir de una API real." },
    { "etiqueta": "Quien construye con seguridad", "rol": "textContent, nunca innerHTML", "descripcion": "El mismo cuidado frente a XSS ya visto con setAttribute(), aplicado a datos externos." }
  ]
}
```

## El generador de historias: plantilla + replace()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const historiaBase = 'Hacía 34 grados fuera, así que :insertx: salió a caminar. Al llegar a :inserty:, se quedó mirando horrorizado, y entonces :insertz:. Bob vio todo, pero no se sorprendió — :insertx: pesa 136 kilos.';\n\n  const personajes = ['Willy el Duende', 'Papá Noel', 'El Gran Jefe'];\n  const lugares = ['el comedor social', 'Disneylandia', 'la Casa Blanca'];\n  const sucesos = ['ardió espontáneamente', 'se derritió en la acera', 'se convirtió en babosa'];\n\n  let historia = historiaBase\n    .replace(':insertx:', obtenerValorAleatorio(personajes))\n    .replace(':inserty:', obtenerValorAleatorio(lugares))\n    .replace(':insertz:', obtenerValorAleatorio(sucesos));\n</script>",
  "anotaciones": [
    { "fragmento": "let historia = historiaBase\n    .replace(':insertx:', obtenerValorAleatorio(personajes))\n    .replace(':inserty:', obtenerValorAleatorio(lugares))\n    .replace(':insertz:', obtenerValorAleatorio(sucesos));", "nota": "replace() (visto junto a las expresiones regulares) sustituye cada marcador por un valor aleatorio distinto — arrays, una función auxiliar, y manipulación de strings, todo encadenado en un mismo flujo." }
  ]
}
```

## Personalización: condicionales sobre el texto generado

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function generarHistoria() {\n    let historia = historiaBase;\n\n    if (nombrePersonalizado.value !== '') {\n      historia = historia.replace('Bob', nombrePersonalizado.value);\n    }\n\n    if (document.getElementById('uk').checked) {\n      const celsius = Math.round((94 - 32) * (5 / 9));\n      historia = historia.replace('94 Fahrenheit', `${celsius} grados Celsius`);\n    }\n\n    salida.textContent = historia;\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "if (nombrePersonalizado.value !== '') {\n      historia = historia.replace('Bob', nombrePersonalizado.value);\n    }", "nota": "Comprobar si el campo de nombre tiene contenido, y si el radio button UK está marcado, decide qué reemplazos adicionales aplicar — la misma lógica condicional del módulo de fundamentos, ahora combinada con manipulación de texto real." }
  ]
}
```

## La interfaz de vivienda: fetch() con el mismo patrón de siempre

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  let casas;\n\n  async function obtenerDatosCasas() {\n    const respuesta = await fetch('https://mdn.github.io/shared-assets/misc/houses.json');\n    if (!respuesta.ok) {\n      throw new Error(`Error HTTP: ${respuesta.status}`);\n    }\n    casas = await respuesta.json();\n    inicializarFormulario();\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "if (!respuesta.ok) {\n      throw new Error(`Error HTTP: ${respuesta.status}`);\n    }", "nota": "Exactamente el mismo patrón visto en el módulo de asincronía — comprobar respuesta.ok antes de parsear, y solo entonces seguir con el resto de la inicialización." }
  ]
}
```

## Poblar un desplegable sin duplicados

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const callesVistas = [];\n  for (const casa of casas) {\n    if (!callesVistas.includes(casa.street)) {\n      callesVistas.push(casa.street);\n      selectorCalle.appendChild(document.createElement('option')).textContent = casa.street;\n    }\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "if (!callesVistas.includes(casa.street)) {", "nota": "Un array auxiliar (callesVistas) evita añadir la misma calle dos veces al desplegable — createElement()/appendChild() construyen cada <option> dinámicamente, a partir de datos reales, no escritos a mano." }
  ]
}
```

## Filtrar: el patrón "vacío significa cualquier valor"

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const casasFiltradas = casas.filter((casa) => {\n    return (\n      (selectorCalle.value === '' || casa.street === selectorCalle.value) &&\n      (selectorDormitorios.value === '' || String(casa.bedrooms) === selectorDormitorios.value)\n    );\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "(selectorCalle.value === '' || casa.street === selectorCalle.value)", "nota": "selectorCalle.value === '' ANTES de comparar de verdad es el patrón para 'cualquier valor vale' — si el desplegable está vacío, esa parte del && ya es true, sin importar el resto." },
    { "fragmento": "String(casa.bedrooms) === selectorDormitorios.value", "nota": "String(casa.bedrooms) convierte el número a texto, porque el valor de un <select> siempre es un string — comparar un número directamente con === nunca coincidiría." }
  ]
}
```

## Construir el resultado con seguridad

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function renderizarCasa(casa) {\n    const articulo = document.createElement('article');\n    articulo.appendChild(document.createElement('h2')).textContent = `${casa.house_number} ${casa.street}`;\n\n    const lista = document.createElement('ul');\n    lista.appendChild(document.createElement('li')).textContent = `Dormitorios: ${casa.bedrooms}`;\n    articulo.appendChild(lista);\n\n    salida.appendChild(articulo);\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "articulo.appendChild(document.createElement('h2')).textContent = `${casa.house_number} ${casa.street}`;", "nota": "Cada dato se asigna con textContent, elemento por elemento — nunca con innerHTML, sobre todo tratándose de datos que vienen de fuera (una API externa)." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Por qué evitar innerHTML con datos externos",
  "contenido": "Usar innerHTML con datos que no se controlan (como los de una API externa) es un vector de XSS real — un string malicioso podría inyectar HTML o JavaScript ejecutable. textContent y createElement()/appendChild() nunca interpretan su contenido como código, por diseño — el mismo cuidado ya visto con setAttribute() en el módulo del DOM."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const casas = [\n    { street: 'Calle Mayor', bedrooms: 2 },\n    { street: 'Avenida Sol', bedrooms: 3 },\n  ];\n\n  const selectorCalle = { value: '' };       // \"cualquier calle\"\n  const selectorDormitorios = { value: '3' };\n\n  const filtradas = casas.filter((casa) => {\n    return (\n      (selectorCalle.value === '' || casa.street === selectorCalle.value) &&\n      (selectorDormitorios.value === '' || String(casa.bedrooms) === selectorDormitorios.value)\n    );\n  });\n\n  console.log(filtradas.length);\n</script>",
  "opciones": [
    "1 — selectorCalle.value === '' hace que cualquier calle pase el primer filtro; solo la casa con 3 dormitorios pasa el segundo",
    "0 — un valor vacío en selectorCalle hace que NINGUNA casa coincida",
    "2 — ambas casas pasan, porque selectorCalle está vacío"
  ],
  "correcta": 0,
  "explicacion": "selectorCalle.value === '' es true, así que esa parte del && se cumple para CUALQUIER calle, sin comparar nada más. Pero selectorDormitorios.value es '3' (no vacío), así que solo pasa la casa cuyo bedrooms (convertido a string) sea exactamente '3' — la Avenida Sol. filtradas.length es 1."
}
```

## Lo que estos retos NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Estos dos retos introducen técnicas completamente nuevas, no vistas en el resto del temario",
      "realidad": "Combinan template literals, arrays, fetch, filter, y construcción del DOM — todo ya visto por separado, ahora junto."
    },
    {
      "mito": "String(casa.bedrooms) === selectorDormitorios.value es innecesario, se podría comparar directamente",
      "realidad": "El valor de un <select> siempre es un string — comparar un número directamente con === nunca coincidiría."
    },
    {
      "mito": "innerHTML es igual de seguro que textContent para mostrar datos de una API",
      "realidad": "innerHTML interpreta el contenido como HTML/JavaScript ejecutable — un riesgo real de XSS con datos no controlados."
    },
    {
      "mito": "selectorCalle.value === '' en el filtro descarta todas las casas",
      "realidad": "Es precisamente lo que permite aceptar CUALQUIER calle cuando no se ha elegido ninguna."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Comparar el valor de un <select> directamente con un número.", "texto": "Siempre es un string — hace falta convertir antes de comparar." },
    { "titulo": "Usar innerHTML para mostrar datos que vienen de una fuente externa.", "texto": "textContent/createElement() evitan el riesgo de XSS." },
    { "titulo": "No usar un array auxiliar para evitar duplicados al construir un desplegable.", "texto": "Sin él, cada calle repetida en los datos aparecería varias veces." },
    { "titulo": "Olvidar comprobar respuesta.ok antes de parsear una respuesta de fetch().", "texto": "El mismo hábito de todo el módulo de asincronía, aplicado aquí también." }
  ]
}
```

## Ejercicios

1. Construye un generador de historias combinando arrays, una función de selección aleatoria, y `replace()` sobre una plantilla.
2. Añade lógica condicional al generador: un nombre personalizado, o una conversión de unidades según una opción marcada.
3. Implementa un filtro sobre un array de datos usando el patrón "valor vacío = cualquier valor" con `&&`.
4. Construye el DOM de un resultado usando `createElement()`/`appendChild()`/`textContent`, sin usar `innerHTML` en ningún momento.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Challenge: Silly story generator",
      "descripcion": "Reto de MDN: un generador de historias tipo \"mad libs\", combinando arrays, selección aleatoria, plantillas y reemplazo de texto.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Silly_story_generator",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Challenge: Building a house data UI",
      "descripcion": "Reto de MDN: una interfaz de búsqueda y filtrado de datos de vivienda, con fetch(), filter(), y construcción del DOM sin innerHTML.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/House_data_UI",
      "etiqueta": "MDN"
    }
  ]
}
```
