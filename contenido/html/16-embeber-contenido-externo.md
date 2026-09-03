# Embeber contenido externo: iframe, embed y object

- **Módulo:** Multimedia
- **Slug:** `embeber-contenido-externo-iframe-embed-y-object` (autogenerado del título)
- **Orden:** 75
- **Fuentes:** [From object to iframe (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/General_embedding_technologies) + [iframe, embed, object (WHATWG spec)](https://html.spec.whatwg.org/multipage/iframe-embed-object.html) — ver `contenido/html/TEMARIO.md` #16

---

## Qué es y para qué sirve

`<iframe>` incrusta un documento HTML completo dentro de otro — un vídeo de YouTube, un mapa de Google, un widget de comentarios son, por debajo, una página entera ajena viviendo dentro de la tuya. `<embed>` y `<object>` hacen algo parecido pero para un recurso concreto (sobre todo PDFs hoy en día), no un documento entero. Los tres comparten un mismo riesgo real: estás dejando entrar contenido que no controlas — por eso esta lección tiene tanto de seguridad como de sintaxis.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se juega algo al incrustar contenido ajeno",
  "roles": [
    { "etiqueta": "Lector de pantalla", "rol": "Saber qué es ese iframe", "descripcion": "Sin title, un iframe se anuncia sin ningún contexto — igual que una imagen sin alt, deja fuera a quien no puede verlo para deducirlo por sí mismo." },
    { "etiqueta": "El propio sitio", "rol": "No ser víctima de clickjacking", "descripcion": "Un iframe invisible superpuesto puede engañar a alguien para que haga clic en algo que no pretendía — la razón de fondo de por qué sandbox y X-Frame-Options existen." },
    { "etiqueta": "Quien visita tu página", "rol": "Que el contenido embebido no la controle", "descripcion": "Sin sandbox, el documento embebido puede ejecutar scripts, abrir popups o navegar la pestaña entera — cosas que probablemente no quieres que un tercero haga desde tu página." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando necesitas contenido de un servicio externo",
  "contenido": "Un vídeo de YouTube, un mapa de Google Maps, un tuit incrustado — cuando el propio servicio te da un fragmento de iframe ya preparado, esa es la forma normal de usarlo."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres mostrar un PDF sin forzar la descarga",
  "contenido": "object (con contenido de respaldo) es la opción más robusta — aunque, salvo que tengas una razón de peso, suele ser mejor enlazar el PDF para que se abra o descargue aparte."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cuando el contenido no es tuyo, trátalo como no confiable",
  "contenido": "Si no lo hiciste tú, da por hecho que es peligroso hasta que se demuestre lo contrario — sandbox, HTTPS y solo los permisos estrictamente necesarios, siempre."
}
```

## Cómo se usa: un iframe básico

```laboratorio
{
  "tipo": "diagrama-etiqueta",
  "titulo": "Un iframe con sandbox, parte por parte",
  "partes": [
    { "texto": "<", "rol": "simbolo" },
    { "texto": "iframe", "rol": "apertura" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "src", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"...\"", "rol": "atributo-valor" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "title", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"...\"", "rol": "atributo-valor" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "sandbox", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"allow-scripts\"", "rol": "atributo-valor" },
    { "texto": ">", "rol": "simbolo" }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<iframe\n  src=\"https://ejemplo.com/mapa\"\n  title=\"Mapa de ubicación de la oficina\"\n  width=\"600\"\n  height=\"400\"\n  loading=\"lazy\"\n  sandbox=\"allow-scripts\">\n</iframe>",
  "anotaciones": [
    { "fragmento": "title=\"Mapa de ubicación de la oficina\"", "nota": "Obligatorio por accesibilidad — sin él, un lector de pantalla no tiene forma de saber de qué trata el documento embebido." },
    { "fragmento": "loading=\"lazy\"", "nota": "Retrasa la carga de este iframe hasta que esté a punto de entrar en el viewport — el mismo mecanismo que loading=\"lazy\" en una imagen." },
    { "fragmento": "sandbox=\"allow-scripts\"", "nota": "Aplica todas las restricciones de seguridad por defecto y reactiva SOLO la ejecución de scripts — cada permiso extra se añade a mano, uno por uno, según haga falta de verdad." }
  ]
}
```

## sandbox: la postura segura por defecto

Sin ningún valor, `sandbox` ya es la opción más restrictiva posible: sin scripts, sin formularios, sin popups, con el contenido tratado como si viniera de un origen distinto al real. Cada permiso se reactiva explícitamente, token a token:

| Token | Qué reactiva |
|---|---|
| `allow-scripts` | Ejecutar JavaScript dentro del iframe |
| `allow-forms` | Enviar formularios |
| `allow-popups` | Abrir ventanas o pestañas nuevas |
| `allow-same-origin` | Tratar el contenido como si viniera de su origen real, no de uno opaco |
| `allow-top-navigation` | Navegar la pestaña completa, no solo el propio iframe |

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "allow-scripts y allow-same-origin juntos anulan el sandbox",
  "contenido": "Por separado son razonablemente seguros. Combinados, el contenido embebido puede ejecutar JavaScript Y acceder a su origen real al mismo tiempo — lo que le permite quitarse el sandbox a sí mismo. Nunca se deberían usar los dos a la vez salvo que confíes por completo en el origen."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<iframe\n  src=\"https://sitio-no-confiable.com\"\n  sandbox=\"allow-scripts allow-same-origin\">\n</iframe>",
  "anotaciones": [
    { "fragmento": "src=\"https://sitio-no-confiable.com\"", "nota": "Un origen que no controlas ni conoces — exactamente el escenario para el que existe sandbox." },
    { "fragmento": "allow-scripts", "nota": "Por sí solo, con el origen tratado como opaco, un script de ahí dentro podría ejecutarse pero sin acceso a cookies, almacenamiento ni el resto de recursos de su propio origen real." },
    { "fragmento": "allow-same-origin", "nota": "Combinado con allow-scripts, el contenido recupera su origen real — el script ya no está aislado: puede acceder a todo lo que ese origen tendría normalmente, incluida la capacidad de modificar sus propios atributos. Es prácticamente equivalente a no tener sandbox." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "¿Por qué no hay una vista previa en vivo aquí?",
  "contenido": "El editor de esta plataforma ya vive dentro de su propio iframe con sandbox=\"\" (todo bloqueado) por seguridad. Un iframe anidado con allow-scripts allow-same-origin dentro de ese contenedor sigue bloqueado igualmente — un hijo nunca puede tener más permisos que su padre, sea cual sea la URL. Por eso este ejemplo se explica con anotaciones en vez de una demo en vivo que nunca podría funcionar aquí (aunque sí lo haría en una página normal, fuera de este editor)."
}
```

## Un ataque real: clickjacking y X-Frame-Options

Clickjacking es superponer un iframe invisible (o casi) sobre una página, de forma que un clic que la persona cree que va dirigido a un botón normal en realidad activa algo distinto dentro del iframe oculto — como un botón de "seguir" o una transferencia bancaria. Por eso muchos sitios bloquean directamente que se les incruste, con una cabecera HTTP:

```
X-Frame-Options: DENY
```

MDN, por ejemplo, la usa — si intentas meter una página de MDN dentro de un iframe, el navegador se niega a mostrarla y lo dice explícitamente en la consola.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Si un iframe se ve en blanco, puede que sea intencionado",
  "contenido": "No siempre es un error de tu código — muchos sitios bloquean activamente ser embebidos con X-Frame-Options o una Content-Security-Policy con frame-ancestors. Es su forma de protegerse del clickjacking, no un fallo tuyo."
}
```

## embed y object: para un recurso concreto, no un documento

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<embed src=\"informe.pdf\" type=\"application/pdf\" width=\"800\" height=\"600\">\n\n<object data=\"informe.pdf\" type=\"application/pdf\" width=\"800\" height=\"600\">\n  <p>No se pudo mostrar el PDF. <a href=\"informe.pdf\">Descárgalo directamente</a>.</p>\n</object>",
  "anotaciones": [
    { "fragmento": "<embed src=\"informe.pdf\" type=\"application/pdf\" width=\"800\" height=\"600\">", "nota": "embed es un elemento vacío, sin contenido de respaldo posible — si el navegador no puede mostrar el PDF, simplemente no hay nada." },
    { "fragmento": "<object data=\"informe.pdf\" type=\"application/pdf\" width=\"800\" height=\"600\">\n  <p>No se pudo mostrar el PDF. <a href=\"informe.pdf\">Descárgalo directamente</a>.</p>\n</object>", "nota": "object sí acepta contenido de respaldo dentro de sus etiquetas — se muestra solo si el recurso no llega a cargar, igual que la p de respaldo dentro de un video." }
  ]
}
```

## Lo que iframe NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "sandbox sin ningún valor dentro deja el iframe inútil",
      "realidad": "Es la posición más segura por defecto — sin scripts, sin formularios, con origen opaco. Los permisos se reactivan uno a uno, con tokens concretos, solo los que hagan falta de verdad."
    },
    {
      "mito": "Cualquier iframe es peligroso solo por ser un iframe",
      "realidad": "El riesgo real está en incrustar contenido en el que no confías — un iframe de tu propio dominio, o de un servicio de confianza con sandbox, es una herramienta normal y segura."
    },
    {
      "mito": "sandbox=\"allow-scripts allow-same-origin\" es simplemente más permisivo",
      "realidad": "Esa combinación concreta anula la protección del sandbox por completo — el contenido embebido puede acceder al documento real y quitarse las restricciones a sí mismo mediante JavaScript."
    },
    {
      "mito": "object y embed sirven exactamente para lo mismo que iframe",
      "realidad": "iframe incrusta un documento HTML completo; object y embed están pensados para un recurso concreto, en la práctica casi siempre un PDF — no son intercambiables."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Incrustar un iframe sin el atributo title.", "texto": "Un lector de pantalla necesita ese title para anunciar de qué trata el contenido embebido, igual que necesita el alt de una imagen." },
    { "titulo": "Combinar allow-scripts con allow-same-origin sin necesitarlo de verdad.", "texto": "Esa combinación concreta permite que el contenido embebido se quite el sandbox a sí mismo — solo se justifica confiando por completo en el origen." },
    { "titulo": "Embeber un PDF entero en vez de enlazarlo.", "texto": "Los PDF embebidos son difíciles de leer en pantallas pequeñas y suelen tener peor accesibilidad que un enlace de descarga directo." },
    { "titulo": "No comprobar si un sitio permite ser embebido antes de intentarlo.", "texto": "Muchos sitios bloquean el embebido con X-Frame-Options — el iframe aparecerá en blanco, y no es un fallo de tu código." }
  ]
}
```

## Ejercicios

1. Escribe un iframe embebiendo un vídeo de una plataforma real (usa una URL de ejemplo), con title, sandbox y allowfullscreen.
2. Escribe dos sandbox distintos, uno con allow-scripts y otro con allow-forms por separado, y explica con tus palabras qué gana cada uno.
3. Escribe un object para un PDF ficticio, con un enlace de descarga como contenido de respaldo dentro.
4. Busca una web real que use X-Frame-Options o una Content-Security-Policy para bloquear ser embebida — ¿qué pasa si intentas meterla en un iframe de prueba?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "From object to iframe",
      "descripcion": "Guía de referencia de MDN sobre iframe, embed y object, con un apartado extenso dedicado a seguridad y buenas prácticas al embeber contenido externo.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/General_embedding_technologies",
      "etiqueta": "MDN"
    },
    {
      "titulo": "iframe, embed, object",
      "descripcion": "La especificación normativa del WHATWG con la lista completa de tokens válidos del atributo sandbox y el atributo loading.",
      "url": "https://html.spec.whatwg.org/multipage/iframe-embed-object.html",
      "etiqueta": "WHATWG"
    }
  ]
}
```
