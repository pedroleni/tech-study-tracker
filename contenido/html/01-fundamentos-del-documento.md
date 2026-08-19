# Lo mínimo que el navegador necesita para funcionar

- **Módulo:** Fundamentos del documento
- **Nivel:** primeros pasos
- **Requisitos previos:** ninguno
- **Tiempo estimado de lectura:** 7 minutos

---

## Qué es y para qué sirve

Un documento HTML son cinco cosas, siempre las mismas, en el mismo orden:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Mi página</title>
  </head>
  <body>
    <p>Aquí va lo que se ve.</p>
  </body>
</html>
```

**`<!DOCTYPE html>`** no es una etiqueta: es una instrucción para el
navegador, la primera línea del fichero, sin excepción. Le dice "interpreta
esto con las reglas modernas del estándar, no con las reglas de hace veinte
años pensadas para no romper páginas antiguas". Sin ella, el navegador entra
en un modo de compatibilidad donde el CSS se comporta de forma distinta y
más impredecible. Se escribe una vez, se olvida para siempre.

**`<html lang="es">`** es la raíz: todo lo demás vive dentro. El atributo
`lang` no es decoración — es lo que usa un lector de pantalla para elegir el
motor de pronunciación correcto, y lo que usa un traductor automático para
saber desde qué idioma traducir.

**`<head>`** es la parte que nadie ve directamente: metadatos, el título de
la pestaña, enlaces a hojas de estilo. Todo lo que necesita el navegador
*antes* de empezar a pintar la página, pero que un lector humano no lee.

**`<body>`** es todo lo que sí se ve. Un documento HTML solo tiene un
`<head>` y un `<body>`, y van en ese orden, siempre.

Los elementos se anidan como cajas dentro de cajas: si abres una etiqueta
dentro de otra, la cierras antes de cerrar la de fuera. `<p><strong>texto
</strong></p>` es correcto; `<p><strong>texto</p></strong>` no lo es, y
aunque muchos navegadores lo arreglan solos adivinando qué quisiste decir,
cada uno adivina distinto.

---

## Cuándo lo usarías de verdad 👤

Aquí es donde casi nadie mira, y es donde se explica el 90% de los "esto en
mi móvil se ve fatal" que llegan sin previo aviso.

**El `<meta charset="UTF-8">` que falta.** Sin él, cualquier tilde, eñe o
símbolo de moneda puede aparecer como un cuadrado o un carácter extraño,
dependiendo de qué codificación adivine el navegador. Es la primera línea
dentro de `<head>`, siempre, porque el navegador necesita saberlo antes de
leer ni un carácter más del fichero — si viene después de un `<title>` con
una eñe, esa eñe ya se leyó mal.

**El `<meta name="viewport">` que falta.** Sin él, un móvil renderiza la
página como si fuera un monitor de escritorio de 980 píxeles y luego la
encoge entera para que quepa: todo se ve diminuto y hay que hacer zoom para
leer una palabra. No es un problema de CSS responsive — es que sin esta
línea el CSS responsive ni siquiera llega a activarse.

**Por qué el orden de `<head>` casi nunca importa, salvo `charset`.** El
navegador lee el `<head>` entero antes de pintar nada, así que el orden de
`<title>`, enlaces a CSS o fuentes rara vez cambia el resultado. La única
excepción real es `charset`: tiene que ir antes que cualquier contenido que
pueda tener caracteres especiales, títulos incluidos.

**Cuándo SÍ hace falta un comentario `<!-- -->`.** Casi nunca. El código
HTML bien escrito se explica por su propia estructura — un `<nav>` ya dice
"esto es la navegación", no hace falta un comentario que lo repita encima.
Los comentarios sobreviven mal a los cambios: alguien reordena el HTML y el
comentario se queda mintiendo, apuntando a algo que ya no está ahí. Resérvalos
para lo que el código no puede decir por sí mismo: por qué algo se hizo así,
no qué es.

---

## Cómo se usa

**Elementos vacíos frente a elementos contenedores.** La mayoría de
etiquetas van en pareja, con apertura y cierre: `<p>...</p>`. Un puñado no
tiene contenido dentro y no se cierran con una etiqueta aparte:

```html
<img src="foto.jpg" alt="Un gato durmiendo">
<br>
<input type="text">
<hr>
```

No hace falta escribir `<br />` con la barra — eso era una convención de
XHTML que HTML5 no exige. `<br>` a secas es correcto y es lo que vas a ver
en código moderno.

**Atributos: siempre en la etiqueta de apertura, con el valor entre
comillas.**

```html
<a href="https://ejemplo.com" target="_blank">Enlace</a>
```

Técnicamente el HTML permite comillas simples o incluso ningún tipo de
comillas si el valor no tiene espacios. No lo hagas: usa comillas dobles
siempre. Es lo que espera cualquier herramienta que analice tu código, y es
lo único obligatorio si el valor contiene espacios — `class="tarjeta
destacada"` sin comillas se rompe en dos atributos.

**Un atributo puede no llevar valor.** `disabled`, `required`, `checked`:
su sola presencia ya significa "verdadero". No se escribe
`disabled="true"` — se escribe `disabled`, y punto. Si el atributo no está,
es como si valiera `false`.

---

## Errores típicos 👤

**Poner el `<meta charset>` en cualquier sitio del `<head>` menos el
primero.** Ya lo has visto arriba, pero merece repetirse porque es el error
más silencioso de todos: el navegador ya empezó a interpretar el texto con
la codificación equivocada antes de llegar a la línea que la corrige, y
para entonces algunos caracteres ya se leyeron mal.

**Cerrar las etiquetas en el orden que no es.** `<div><p>texto</div></p>`.
El navegador intentará salvarlo adivinando, pero cada navegador adivina
distinto, y lo que en Chrome se ve bien puede desmontarse en otro sitio. La
regla es simple aunque cueste acostumbrarse: lo último que abres es lo
primero que cierras.

**Escribir HTML en mayúsculas o mezclado.** `<DIV>`, `<Body>`. Funciona —el
navegador no distingue mayúsculas de minúsculas en las etiquetas— pero
rompe la convención que sigue todo el código HTML que vas a leer de aquí en
adelante. Minúsculas, siempre.

**Olvidar el atributo `lang` en `<html>`.** No rompe nada visualmente, así
que es fácil que pase inadvertido para siempre. Pero un lector de pantalla
sin esa pista puede intentar leer una página en español con el motor de
pronunciación de otro idioma, y el resultado es difícil de entender.

**Confundir "no se ve el error" con "está bien escrito".** Los navegadores
son extremadamente tolerantes: perdonan etiquetas sin cerrar, atributos mal
escritos, anidamientos incorrectos. Esa tolerancia es útil para no romper
la web entera por un error tipográfico de alguien, pero tiene un precio:
acostumbra a escribir HTML descuidado que "funciona" hasta que deja de
hacerlo, casi siempre en el navegador de otra persona.

---

## Ejercicios

### 1. Predice el resultado

¿Qué carácter es probable que se vea mal en la página, y por qué?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "html",
  "codigo": "<!DOCTYPE html>\n<html lang=\"es\">\n  <head>\n    <title>Información</title>\n    <meta charset=\"UTF-8\">\n  </head>\n  <body>\n    <p>Información</p>\n  </body>\n</html>",
  "opciones": [
    "La 'ó' de \"Información\" dentro del <title>, en la pestaña del navegador",
    "La 'ó' de \"Información\" dentro del <body>, en el texto de la página",
    "Ninguna: las dos se ven bien"
  ],
  "correcta": 0,
  "explicacion": "El <meta charset> va después del <title>, así que el navegador ya interpretó y mostró el título —con su tilde— antes de saber qué codificación usar. Para cuando llega a <body>, ya procesó la línea de charset y esa segunda \"Información\" se ve bien."
}
```

### 2. Encuentra el error

Este documento tiene un error de anidamiento. Encuéntralo antes de mirar la
solución.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<p>Bienvenido a <strong>mi página</p></strong>",
  "anotaciones": [
    { "fragmento": "<strong>", "nota": "Se abre aquí, dentro de <p>. Lo último que se abre tiene que ser lo primero que se cierra." },
    { "fragmento": "</p></strong>", "nota": "El cierre está al revés: </p> va antes que </strong>, cuando debería ir después. Lo correcto es </strong></p>." }
  ]
}
```

### 3. Escríbelo tú

Escribe el esqueleto completo de un documento HTML válido para una página
cuyo título de pestaña sea "Contacto", en español, con codificación UTF-8 y
preparado para verse bien en móvil. El `<body>` puede quedar vacío.

**Se comprueba automáticamente que:**

- el documento empieza por `<!DOCTYPE html>`
- `<html>` tiene el atributo `lang="es"`
- dentro de `<head>` hay un `<meta charset="UTF-8">` antes que cualquier
  otro contenido con texto
- hay un `<meta name="viewport">` con `width=device-width`
- el `<title>` contiene exactamente el texto "Contacto"

---

## Para profundizar

- [Estándar HTML de WHATWG — sintaxis](https://html.spec.whatwg.org/multipage/syntax.html)
- [Guía de `<!DOCTYPE>` en el estándar HTML](https://html.spec.whatwg.org/multipage/syntax.html#the-doctype)

---

### Atribución

Los datos de referencia sobre sintaxis y elementos proceden del
[Estándar HTML de WHATWG](https://html.spec.whatwg.org/), publicado bajo
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). El texto de esta
página es original y no reproduce el estándar; los ejemplos son propios.
