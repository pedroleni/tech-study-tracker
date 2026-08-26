# Crear enlaces: rutas relativas y absolutas, target y rel

- **Módulo:** Enlaces
- **Slug:** `crear-enlaces-rutas-relativas-y-absolutas-target-y-rel` (autogenerado del título)
- **Orden:** 45
- **Fuentes:** [Creating links (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Creating_links) + [Links (web.dev)](https://web.dev/learn/html/links) — ver `contenido/html/TEMARIO.md` #10

---

## Qué es y para qué sirve

Sin enlaces no hay web — es literalmente lo que separa un documento de hipertexto de un archivo de texto suelto. El elemento `<a>` (de *anchor*, ancla) y su atributo `href` conectan una página con otra, con un archivo, con un correo o con un punto dentro de la misma página. Parece la etiqueta más simple de HTML, pero cómo escribas la ruta, el texto visible y un par de atributos concretos cambia bastante lo bien (o mal) que funciona para quien no navega con ratón.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién depende de que el enlace esté bien escrito",
  "roles": [
    { "etiqueta": "Lector de pantalla", "rol": "Saltar entre enlaces por su texto", "descripcion": "Mucha gente navega listando solo los enlaces de la página — \"haz clic aquí\" repetido veinte veces no dice nada fuera de contexto." },
    { "etiqueta": "Buscador", "rol": "Entender de qué trata el destino", "descripcion": "El texto del enlace es una señal de SEO real — enlazar con palabras relevantes ayuda a indexar mejor la página a la que apunta." },
    { "etiqueta": "Quien navega con teclado", "rol": "Ver el foco y activar con Enter", "descripcion": "Un enlace real (con href) es accesible por teclado de fábrica — Tab para llegar, Enter para activarlo, sin una línea de JavaScript." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando enlazas a otra página de tu propio sitio",
  "contenido": "Usa una ruta relativa — así el sitio entero se puede mover de dominio (de un dominio de pruebas al definitivo, por ejemplo) sin que se rompa ni un enlace interno."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando enlazas a un recurso externo",
  "contenido": "Ahí sí hace falta la URL absoluta completa, con el esquema https:// incluido — una ruta relativa no tiene sentido fuera de tu propio dominio."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el destino no es una página web normal",
  "contenido": "Descargar un PDF, abrir el cliente de correo, marcar un teléfono, saltar a una sección de la misma página — para cada caso hay un href especializado: download, mailto:, tel: o un fragmento con #."
}
```

## Cómo se usa: el atributo href

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<a href=\"https://developer.mozilla.org/\">MDN Web Docs</a>\n<a href=\"/tecnologias\">Ver tecnologías</a>\n<a href=\"contacto.html\">Contacto</a>",
  "anotaciones": [
    { "fragmento": "href=\"https://developer.mozilla.org/\"", "nota": "URL absoluta: esquema, dominio y ruta completos. Funciona igual sin importar desde qué página o qué sitio la uses." },
    { "fragmento": "href=\"/tecnologias\"", "nota": "Ruta relativa a la raíz: empieza siempre desde el dominio actual, sin importar en qué carpeta esté la página que la contiene." },
    { "fragmento": "href=\"contacto.html\"", "nota": "Ruta relativa al archivo: solo funciona si contacto.html está en la misma carpeta que la página que enlaza." }
  ]
}
```

## Rutas relativas: cómo moverse por las carpetas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<!-- Escrito dentro de proyectos/index.html -->\n<a href=\"detalle.html\">Detalle</a>\n<a href=\"../index.html\">Volver al inicio</a>\n<a href=\"../recursos/guia.pdf\">Guía en PDF</a>",
  "anotaciones": [
    { "fragmento": "href=\"detalle.html\"", "nota": "Mismo directorio: sin ../ ni /, busca el archivo justo al lado del que contiene el enlace." },
    { "fragmento": "href=\"../index.html\"", "nota": "../ sube un nivel de carpeta antes de buscar el archivo — se pueden encadenar varios ../ seguidos para subir más de un nivel." },
    { "fragmento": "href=\"../recursos/guia.pdf\"", "nota": "Sube un nivel y entra en una carpeta hermana — combina subir y bajar en la misma ruta." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<!-- La página vive en https://ejemplo.com/proyectos (SIN barra final) -->\n<a href=\"contacto.html\">Contacto</a>",
  "opciones": [
    "Apunta a https://ejemplo.com/proyectos/contacto.html",
    "Apunta a https://ejemplo.com/contacto.html",
    "Dependen del navegador — no hay una regla fija"
  ],
  "correcta": 1,
  "explicacion": "Sin la barra final, el navegador trata \"proyectos\" como un ARCHIVO, no como una carpeta — así que la ruta relativa se resuelve un nivel por encima, no dentro de \"proyectos\". Con https://ejemplo.com/proyectos/ (con barra) el mismo enlace sí apuntaría dentro de esa carpeta. Es una causa real y muy común de enlaces rotos en producción."
}
```

Así se ve la diferencia en el propio texto del enlace — mismo destino, muy distinta utilidad para quien navega por la lista de enlaces de una página:

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p><a href=\"https://firefox.com\">Haz clic aquí</a> para descargar Firefox.</p>",
  "despues": "<p><a href=\"https://firefox.com\">Descarga Firefox</a>.</p>",
  "nota": "El destino es idéntico en los dos casos. Lo que cambia es qué se lee si alguien navega solo por la lista de enlaces de la página, algo habitual con lector de pantalla — \"haz clic aquí\" no dice nada fuera de contexto; \"Descarga Firefox\" sí, aunque se lea aislado del resto de la frase."
}
```

## Enlazar dentro de la misma página: fragmentos con id

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<h2 id=\"formularios\">Formularios</h2>\n<p>…</p>\n\n<p>Salta directo a <a href=\"#formularios\">la sección de formularios</a>.</p>\n\n<a href=\"leccion-17.html#formularios\">Ver formularios en otra página</a>",
  "anotaciones": [
    { "fragmento": "id=\"formularios\"", "nota": "El id que sirve de ancla — cualquier etiqueta puede llevarlo, no hace falta que sea justo un h2." },
    { "fragmento": "href=\"#formularios\"", "nota": "Un # solo, sin nada delante, busca ese id en la MISMA página." },
    { "fragmento": "href=\"leccion-17.html#formularios\"", "nota": "Combina ruta y fragmento: primero navega a esa página, luego salta directo a esa sección concreta." }
  ]
}
```

## Enlaces de correo y teléfono: mailto y tel

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<a href=\"mailto:soporte@ejemplo.com\">Escríbenos</a>\n<a href=\"tel:+34911234567\">Llámanos</a>",
  "anotaciones": [
    { "fragmento": "href=\"mailto:soporte@ejemplo.com\"", "nota": "Abre el cliente de correo del usuario con el destinatario ya relleno." },
    { "fragmento": "href=\"tel:+34911234567\"", "nota": "En un móvil, ofrece marcar directamente ese número — el signo + y el prefijo de país evitan ambigüedad sobre desde dónde se llama." }
  ]
}
```

`mailto:` acepta parámetros extra en la propia URL, con la misma sintaxis `?clave=valor&clave=valor` de cualquier query string:

```laboratorio
{
  "tipo": "diagrama-etiqueta",
  "titulo": "Un mailto con asunto y cuerpo, parte por parte",
  "partes": [
    { "texto": "mailto:", "rol": "apertura" },
    { "texto": "soporte@ejemplo.com", "rol": "contenido" },
    { "texto": "?", "rol": "simbolo" },
    { "texto": "subject", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "Ayuda", "rol": "atributo-valor" },
    { "texto": "&", "rol": "simbolo" },
    { "texto": "body", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "Hola", "rol": "atributo-valor" }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Los espacios hay que codificarlos",
  "contenido": "Un espacio literal dentro de subject o body rompe o trunca la URL — hace falta escribirlo como %20 (o + en algunos clientes). \"Necesito ayuda\" se convierte en \"Necesito%20ayuda\"."
}
```

## target=\"_blank\" y un riesgo de seguridad real

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<a href=\"https://sitio-externo.com\" target=\"_blank\" rel=\"noopener noreferrer\">\n  Ver sitio externo\n</a>",
  "anotaciones": [
    { "fragmento": "target=\"_blank\"", "nota": "Abre el enlace en una pestaña nueva — útil para no perder la página actual al enlazar a un sitio externo, pero desorienta a quien está acostumbrado a usar el botón atrás." },
    { "fragmento": "rel=\"noopener noreferrer\"", "nota": "Sin esto, la página que se abre puede acceder a window.opener y REDIRIGIR la pestaña original a otra URL sin que nadie lo note — una técnica de phishing real llamada \"tabnabbing\". noopener la bloquea; noreferrer evita además enviar la URL de origen." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Los navegadores actuales ya aplican noopener por defecto",
  "contenido": "Desde 2020-2021, Chrome y Firefox tratan target=\"_blank\" como si llevara rel=\"noopener\" implícito, salvo que se indique lo contrario. Escribirlo a mano sigue siendo buena práctica: documenta la intención y protege en configuraciones o navegadores más antiguos que no lo aplican solos."
}
```

## El atributo download

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<a href=\"/informes/ventas-2026.pdf\" download>\n  Descargar el informe (PDF, 4 MB)\n</a>\n\n<a href=\"/plantilla.docx\" download=\"plantilla-formulario.docx\">\n  Descargar plantilla\n</a>",
  "anotaciones": [
    { "fragmento": "download", "nota": "Sin valor: fuerza la descarga en vez de navegar al archivo, conservando su nombre original del servidor." },
    { "fragmento": "download=\"plantilla-formulario.docx\"", "nota": "Con un valor: además renombra el archivo descargado, sea cual sea su nombre real en el servidor." }
  ]
}
```

## Lo que un enlace NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "target=\"_blank\" siempre es lo más cómodo para quien lee",
      "realidad": "Abre una pestaña nueva sin que se haya pedido, lo que descoloca a quien usa el botón atrás por costumbre y puede confundir a quien usa lector de pantalla si no se avisa en el propio texto. Resérvalo para enlaces externos, y avisa cuando lo uses."
    },
    {
      "mito": "Un <a> sin href sigue siendo un enlace de verdad",
      "realidad": "Sin href, no es focuseable con Tab ni activable con Enter por defecto — es solo un fragmento de texto con estilo de enlace, no uno funcional. Necesitaría tabindex y manejo de teclado añadidos a mano para comportarse como uno real."
    },
    {
      "mito": "Una URL relativa es menos fiable que una absoluta",
      "realidad": "Al contrario: para enlaces dentro de tu propio sitio la relativa es la más robusta — sigue funcionando si el sitio cambia de dominio, mientras que una absoluta quedaría apuntando para siempre al dominio antiguo."
    },
    {
      "mito": "El atributo title hace un enlace más accesible",
      "realidad": "title solo se ve al pasar el ratón por encima — invisible para quien usa teclado o una pantalla táctil. Si la información es importante de verdad, tiene que estar en el propio texto visible del enlace, no escondida en title."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Repetir el mismo texto de enlace para destinos distintos.", "texto": "Dos \"Leer más\" en la misma página que llevan a artículos diferentes confunden a quien navega por la lista de enlaces — cada uno necesita distinguirse por sí solo." },
    { "titulo": "Enlazar la página actual a sí misma en un menú.", "texto": "En vez de un enlace circular, lo habitual es dejar ese elemento sin href (o marcado con aria-current=\"page\") como recordatorio visual de dónde está el usuario." },
    { "titulo": "Usar target=\"_blank\" sin avisar en el texto.", "texto": "Que se abra una pestaña nueva sin ningún aviso descoloca a quien no lo espera — un \"(se abre en una pestaña nueva)\" evita la sorpresa." },
    { "titulo": "Escribir espacios sin codificar en mailto.", "texto": "Los espacios y caracteres especiales de subject y body deben ir como %20 y similares, o el enlace se rompe o se trunca a mitad de frase." }
  ]
}
```

## Ejercicios

1. Escribe tres enlaces sobre el mismo tema con textos claramente distintos entre sí, evitando "haz clic aquí" en los tres casos.
2. Crea un enlace mailto con asunto y cuerpo predefinidos para pedir soporte técnico, codificando bien los espacios.
3. Piensa en una barra de navegación de 4 secciones y escribe su HTML marcando la sección activa sin usar un enlace circular a sí misma.
4. Busca en una web real un enlace que abra en pestaña nueva — ¿avisa de alguna forma en el texto? Si inspeccionas el código, ¿lleva rel="noopener"?
5. Escribe un enlace de descarga a un PDF ficticio usando download, indicando el tamaño del archivo directamente en el texto visible del enlace.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Creating links",
      "descripcion": "Guía de referencia de MDN sobre rutas absolutas y relativas, texto de enlace, mailto, target y el atributo download.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Creating_links",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Links",
      "descripcion": "Curso de web.dev sobre enlaces, con más detalle en los valores de target, tel y buenas prácticas de accesibilidad al distinguir enlaces visualmente.",
      "url": "https://web.dev/learn/html/links",
      "etiqueta": "web.dev"
    }
  ]
}
```
