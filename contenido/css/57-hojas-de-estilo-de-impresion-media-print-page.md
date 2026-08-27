# Hojas de estilo de impresión (@media print, @page)

- **Módulo:** Calidad, rendimiento y organización
- **Slug:** `hojas-de-estilo-de-impresion-media-print-page` (autogenerado del título)
- **Orden:** 280
- **Fuentes:** [Printing (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing) + [@page (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/@page) — ver `contenido/css/TEMARIO.md` #57

---

## Qué es y para qué sirve

Una página pensada para pantalla casi nunca funciona bien impresa tal cual: la navegación ocupa espacio inútil, los enlaces pierden su URL visible, y el contenido puede partirse a mitad de una tabla entre dos hojas. `@media print` adapta los estilos específicamente para el papel; `@page` va más allá y controla el tamaño y los márgenes de la propia página impresa.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién prepara una página para el papel, no solo la pantalla",
  "roles": [
    { "etiqueta": "Quien prepara una página para imprimir", "rol": "Adaptar estilos solo para el papel", "descripcion": "@media print aplica reglas que nunca se ven en pantalla, solo al imprimir de verdad o en la vista previa de impresión." },
    { "etiqueta": "Quien oculta lo que no aporta en papel", "rol": "Quitar navegación, botones, interactividad", "descripcion": "Un menú de navegación o un botón \"Añadir al carrito\" no tienen ningún sentido en una hoja impresa." },
    { "etiqueta": "Quien controla saltos de página", "rol": "Evitar que algo se parta a la mitad", "descripcion": "break-inside: avoid evita que una tarjeta o una tabla queden cortadas entre dos páginas." }
  ]
}
```

## Vincular una hoja de estilos solo para imprimir

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<link href=\"/estilos/impresion.css\" media=\"print\" rel=\"stylesheet\">\n\n<style>\n  @media print {\n    body {\n      font-size: 12pt;\n      color: black;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "<link href=\"/estilos/impresion.css\" media=\"print\" rel=\"stylesheet\">", "nota": "media=\"print\" hace que el navegador solo aplique este archivo al imprimir — sigue descargándolo, pero no bloquea el renderizado en pantalla, como ya se vio en la lección de rendimiento." },
    { "fragmento": "@media print {\n    body {\n      font-size: 12pt;\n      color: black;\n    }\n  }", "nota": "Las reglas normales de pantalla SIGUEN aplicando al imprimir, salvo que algo dentro de @media print las sobrescriba — no es una hoja de estilos completamente aislada por defecto." }
  ]
}
```

## El patrón más común: ocultar lo que no sirve en papel

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @media print {\n    #header,\n    #footer,\n    #nav,\n    .boton {\n      display: none !important;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "display: none !important;", "nota": "!important aquí es razonable — el objetivo explícito es garantizar que estos elementos desaparezcan al imprimir, sin importar qué especificidad tenga alguna otra regla de pantalla." }
  ]
}
```

## @page: tamaño y márgenes de la página impresa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @page {\n    size: a4;\n    margin: 2cm;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "size: a4;", "nota": "Define el tamaño del papel — acepta nombres estándar (a4, letter), medidas explícitas (8.5in 11in), o solo la orientación (landscape)." },
    { "fragmento": "margin: 2cm;", "nota": "El margen de la página impresa en sí — distinto del margin de un elemento HTML normal, este afecta al espacio en blanco alrededor de todo el contenido de cada hoja." }
  ]
}
```

## Páginas concretas: primera, pares e impares

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @page :first {\n    margin-top: 4in;\n  }\n\n  @page :left {\n    margin-left: 2.5cm;\n  }\n\n  @page :right {\n    margin-right: 2.5cm;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@page :first {\n    margin-top: 4in;\n  }", "nota": "Se aplica solo a la PRIMERA página del documento impreso — útil para dejar más espacio arriba en una portada, sin afectar al resto de páginas." },
    { "fragmento": "@page :left {\n    margin-left: 2.5cm;\n  }\n\n  @page :right {\n    margin-right: 2.5cm;\n  }", "nota": ":left y :right distinguen páginas pares de impares — útil para simular la encuadernación de un libro, con más margen hacia el lado del lomo en cada caso." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "@page es una función relativamente reciente",
  "contenido": "@page alcanzó Baseline (ampliamente disponible) en 2024 — no es algo que haya funcionado igual en todos los navegadores durante años. Algunas partes, como las reglas de margen para añadir contenido (@top-right, @bottom-center...), tienen un soporte todavía más desigual. Conviene comprobarlo si el resultado impreso es crítico."
}
```

## Saltos de página: break-before, break-after, break-inside

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .tarjeta {\n    break-inside: avoid;\n  }\n\n  h2 {\n    break-before: page;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "break-inside: avoid;", "nota": "Evita que este elemento se parta entre dos páginas — sin esto, una tarjeta o una tabla larga puede cortarse justo a la mitad, quedando la otra mitad en la hoja siguiente." },
    { "fragmento": "break-before: page;", "nota": "Fuerza un salto de página ANTES de cada h2 — útil para que cada sección grande empiece siempre en una hoja nueva. page-break-before es la versión heredada de esta misma propiedad." }
  ]
}
```

## orphans y widows: líneas sueltas junto a un salto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  p {\n    orphans: 3;\n    widows: 3;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "orphans: 3;", "nota": "El mínimo de líneas que deben quedarse al FINAL de una página — evita que un párrafo deje una sola línea suelta al pie de la hoja antes del salto." },
    { "fragmento": "widows: 3;", "nota": "El mínimo de líneas que deben aparecer al PRINCIPIO de la página siguiente — evita que un párrafo empiece una hoja nueva con una única línea huérfana." }
  ]
}
```

## Mostrar la URL de un enlace, solo al imprimir

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @media print {\n    a::after {\n      content: \" (\" attr(href) \")\";\n    }\n  }\n</style>\n<a href=\"https://example.com\">Visita el sitio</a>",
  "anotaciones": [
    { "fragmento": "content: \" (\" attr(href) \")\";", "nota": "attr(href) lee el valor real del atributo href del propio enlace e imprime la URL entre paréntesis, justo después del texto — en papel, un enlace subrayado no sirve de nada sin poder ver a dónde apuntaba." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  @media print {\n    a::after {\n      content: \" (\" attr(href) \")\";\n    }\n  }\n</style>\n<a href=\"https://example.com\">Visita el sitio</a>",
  "opciones": [
    "El enlace también muestra la URL entre paréntesis en pantalla, igual que al imprimir",
    "En pantalla no se aprecia ningún cambio — la regla ::after con la URL solo se aplica dentro de @media print, al imprimir de verdad o en la vista previa",
    "content: attr(href) solo funciona si el enlace tiene además una clase print"
  ],
  "correcta": 1,
  "explicacion": "Toda la regla vive dentro de @media print, así que solo se activa al imprimir (o en la vista previa de impresión) — viendo la página normalmente en el navegador, el enlace se ve exactamente igual que si esa regla no existiera."
}
```

## Lo que @media print y @page NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "@media print solo sirve para ocultar elementos, nada más",
      "realidad": "Puede cambiar cualquier propiedad — tamaños de fuente, colores, mostrar contenido adicional como URLs de enlaces — no solo esconder cosas."
    },
    {
      "mito": "@page funciona igual en todos los navegadores desde hace años",
      "realidad": "Es Baseline 2024 (recién ampliamente disponible) — algunas partes, como las reglas de margen, tienen un soporte todavía más desigual."
    },
    {
      "mito": "page-break-inside es la forma moderna de controlar los saltos de página",
      "realidad": "Es la propiedad heredada; break-inside (y break-before/break-after) son las versiones modernas recomendadas."
    },
    {
      "mito": "orphans y widows hacen lo mismo, solo con otro nombre",
      "realidad": "orphans controla el mínimo de líneas al FINAL de una página; widows, el mínimo al PRINCIPIO de la siguiente — extremos distintos del mismo salto."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar que las reglas normales de pantalla también aplican al imprimir.", "texto": "Salvo que @media print las sobrescriba explícitamente." },
    { "titulo": "No comprobar el soporte real de @page antes de depender de sus reglas de margen.", "texto": "Es una función relativamente reciente, con soporte todavía desigual en algunas partes." },
    { "titulo": "Usar page-break-inside en vez de break-inside sin necesidad real de soporte heredado.", "texto": "break-inside es la versión moderna recomendada." },
    { "titulo": "No usar break-inside: avoid en elementos que no deberían partirse entre páginas.", "texto": "Una tabla o una tarjeta cortada a la mitad es difícil de leer en papel." }
  ]
}
```

## Ejercicios

1. Escribe una regla `@media print` que oculte un elemento de navegación con la clase `.nav`.
2. Escribe una regla `@page` que fije el tamaño en A4 y un margen de 2cm.
3. Escribe una regla que muestre la URL de cada enlace entre paréntesis, solo al imprimir.
4. Escribe una regla `break-inside: avoid` para evitar que una tarjeta se parta entre dos páginas.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Printing",
      "descripcion": "Referencia de MDN sobre cómo vincular hojas de impresión, @media print y los eventos beforeprint/afterprint.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing",
      "etiqueta": "MDN"
    },
    {
      "titulo": "@page",
      "descripcion": "Referencia de MDN con la sintaxis completa de @page: size, margin, pseudo-clases :first/:left/:right y páginas con nombre.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/@page",
      "etiqueta": "MDN"
    }
  ]
}
```
