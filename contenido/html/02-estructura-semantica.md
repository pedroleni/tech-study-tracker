# La estructura de una página

> **Ficha piloto.** Sirve para fijar la plantilla y medir cuánto cuesta
> escribir una ficha de verdad. Las secciones marcadas con 👤 son las que
> el autor tiene que escribir sí o sí: son las que no existen en la
> documentación oficial y las que justifican que esta página exista.

- **Nivel:** primeros pasos
- **Requisitos previos:** ninguno
- **Tiempo estimado de lectura:** 8 minutos

---

## Qué es y para qué sirve

Una página web es texto plano. El navegador no ve un menú, ni un
artículo, ni un pie de página: ve caracteres. Las **etiquetas** son la
forma de decirle qué es cada trozo.

Casi todas las etiquetas de HTML sirven para eso: dar significado. Un
`<h1>` no es "texto grande", es *el título de esta página*. Que además se
vea grande es una consecuencia, no el objetivo. Esa diferencia parece
una sutileza y es justo lo que separa a quien escribe HTML de quien lo
copia y lo pega.

Existen dos etiquetas que no significan nada a propósito: `<div>` y
`<span>`. Son cajas vacías de significado, pensadas para cuando
necesitas agrupar algo por motivos puramente visuales y ninguna etiqueta
con significado encaja. Son útiles. El problema empieza cuando se
convierten en la respuesta a todo.

Las etiquetas que sí significan algo se llaman **semánticas**. Las que
estructuran una página son estas:

| Etiqueta | Qué representa |
|---|---|
| `<header>` | La cabecera de la página o de una sección |
| `<nav>` | Un bloque de navegación con enlaces principales |
| `<main>` | El contenido principal. **Solo puede haber uno visible** |
| `<article>` | Algo que se entiende por sí solo si lo sacas de la página |
| `<section>` | Un bloque temático dentro de un contenido mayor |
| `<aside>` | Contenido relacionado pero secundario |
| `<footer>` | El pie de la página o de una sección |

---

## Cuándo lo usarías de verdad 👤

La documentación oficial te dice qué es cada etiqueta. Lo que casi nunca
te dice es cuándo notas la diferencia. Son estos cuatro momentos:

**Cuando alguien navega tu página sin ver.** Un lector de pantalla ofrece
un atajo para saltar directamente al contenido principal, y ese atajo
existe porque hay un `<main>`. También puede listar las regiones de la
página como si fuera un índice. Si todo son `<div>`, ese índice sale
vacío: la persona tiene que recorrerse el menú entero, cada vez, en cada
página. No es una mejora estética. Es la diferencia entre poder usar tu
web y no poder.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>.header,header{background:#1d4ed8;color:#fff;padding:16px;margin:0;font-family:system-ui}.header h1,header h1{margin:0;font-size:1.2rem}</style><div class=\"header\"><h1>Mi blog</h1></div>",
  "despues": "<style>.header,header{background:#1d4ed8;color:#fff;padding:16px;margin:0;font-family:system-ui}.header h1,header h1{margin:0;font-size:1.2rem}</style><header><h1>Mi blog</h1></header>",
  "nota": "Con el mismo CSS los dos se ven exactamente igual. La diferencia no está en la pantalla: está en lo que el navegador entiende que representa cada uno."
}
```

**Cuando llega el CSS.** Con etiquetas semánticas escribes `nav a` y ya
está. Con div soup acabas inventando clases para todo y, lo que es peor,
dependiendo de ellas: el día que cambies una clase, se rompe el estilo en
sitios que no recuerdas.

**Cuando entra Google.** El buscador usa la estructura para saber qué
parte de la página es el contenido y cuál es el menú repetido en las
doscientas páginas del sitio.

**Cuando vuelves tú, seis meses después.** Un HTML semántico se lee de
arriba abajo y se entiende sin abrirlo en el navegador. Trescientos
`<div>` anidados, no.

---

## Cómo se usa

La estructura mínima de una página completa:

```html
<body>
  <header>
    <h1>Mi blog</h1>
    <nav>
      <ul>
        <li><a href="/">Inicio</a></li>
        <li><a href="/sobre-mi">Sobre mí</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <h2>Cómo aprendí HTML</h2>
      <p>Tardé más de lo que me gustaría reconocer.</p>
    </article>
  </main>

  <footer>
    <p>© 2026</p>
  </footer>
</body>
```

Tres detalles que conviene fijar desde el principio:

**El menú va dentro de una lista.** Un menú *es* una lista de enlaces, y
decirlo tiene una consecuencia práctica: un lector de pantalla anuncia
"lista de dos elementos" y quien escucha sabe cuánto menú le queda por
delante. Sin la lista, son dos enlaces sueltos sin principio ni final.

**`<main>` va una sola vez.** Es el contenido principal. Por definición
no hay dos.

**`<article>` frente a `<section>`.** La pregunta que lo resuelve: *si
saco esto de la página y lo pego en otro sitio, ¿se sigue entendiendo?*
Una entrada de blog, sí: es un `<article>`. El bloque "Comentarios" de
esa entrada, no: es una `<section>`.

---

## Errores típicos 👤

**Usar `<section>` como si fuera un `<div>` más elegante.** Es el error
más extendido. Una `<section>` sin un encabezado dentro casi siempre
debería ser un `<div>`. La regla práctica: si no puedes ponerle un
título, no es una sección.

**Saltarse niveles de encabezado por el tamaño de la letra.** Ir de
`<h2>` a `<h4>` porque el `<h3>` "se veía muy grande". Los encabezados
son el índice de la página, y ese salto deja un hueco en el índice. Si el
tamaño no te gusta, eso lo arregla el CSS.

**Poner varios `<h1>`.** Uno por página. Es el título de *esto*, y no hay
dos títulos.

**Meter el `<nav>` fuera del `<header>` sin pensarlo.** Se puede, pero
suele ser porque se copió de algún sitio.

**Convertir un `<div>` en un botón.** Un `<div onclick>` no recibe el
foco con el tabulador, no se activa con la barra espaciadora y no se
anuncia como botón. Reproducir a mano todo lo que `<button>` ya te da es
mucho trabajo para acabar peor.

**El error del que casi nadie avisa: envolver `<main>` en un `<div>` con
la clase del layout.** Funciona, no rompe nada, y sin embargo es una
oportunidad perdida — porque el `<div>` acaba siendo el que lleva el
estilo y `<main>` queda de adorno. Ponle el estilo directamente a
`<main>`.

---

## Ejercicios

### 1. Predice el resultado

Un lector de pantalla lista las regiones de esta página. ¿Cuántas
encuentra?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "html",
  "codigo": "<body>\n  <div class=\"header\">\n    <h1>Tienda</h1>\n    <div class=\"nav\"><a href=\"/\">Inicio</a></div>\n  </div>\n  <div class=\"content\">\n    <p>Bienvenido</p>\n  </div>\n</body>",
  "opciones": ["Ninguna región", "1 región", "2 regiones", "4 regiones"],
  "correcta": 0,
  "explicacion": "No hay una sola etiqueta semántica: las clases header y nav son nombres para el CSS, y el navegador no les da ningún significado. Para quien navega por regiones, esta página es un bloque único e indivisible."
}
```

### 2. Encuentra el error

Este código funciona y se ve bien. Tiene dos problemas de estructura:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<main>\n  <h1>Recetas</h1>\n  <section>\n    <h3>Tortilla de patatas</h3>\n    <p>Huevos, patatas y paciencia.</p>\n  </section>\n</main>",
  "anotaciones": [
    { "fragmento": "<h3>Tortilla de patatas</h3>", "nota": "Salta de <h1> a <h3>: falta el <h2> de en medio, y eso deja un hueco en el índice de la página." },
    { "fragmento": "<section>", "nota": "Debería ser <article>: una receta se entiende por sí sola si la sacas de aquí — es la prueba del algodón." }
  ]
}
```

### 3. Escríbelo tú

Escribe la estructura de una página de contacto que tenga: una cabecera
con el título y un menú de dos enlaces, un contenido principal con un
formulario, y un pie con el aviso de copyright. Sin CSS, solo estructura.

**Se comprueba automáticamente que:**

- existe exactamente un `<main>`
- existe un `<nav>` y está dentro del `<header>`
- el `<nav>` contiene una `<ul>` con dos elementos `<li>`
- hay exactamente un `<h1>`
- existe un `<footer>`
- no se ha saltado ningún nivel de encabezado

---

## Para profundizar

- [Estándar HTML de WHATWG — secciones](https://html.spec.whatwg.org/multipage/sections.html)
- [Guía de referencia de landmarks del W3C](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/)

---

### Atribución

Los datos de referencia sobre elementos y su semántica proceden del
[Estándar HTML de WHATWG](https://html.spec.whatwg.org/), publicado bajo
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). El texto de
esta página es original y no reproduce el estándar; los ejemplos son
propios.
