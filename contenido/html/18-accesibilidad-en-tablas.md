# Accesibilidad en tablas: caption, scope y thead/tbody/tfoot

- **Módulo:** Tablas
- **Slug:** `accesibilidad-en-tablas-caption-scope-y-thead-tbody-tfoot` (autogenerado del título)
- **Orden:** 85
- **Fuentes:** [HTML table accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Table_accessibility) + [Creating Accessible Tables — Data Tables (WebAIM)](https://webaim.org/techniques/tables/data) — ver `contenido/html/TEMARIO.md` #18

---

## Qué es y para qué sirve

La lección anterior enseñó a construir una tabla que funciona. Esta enseña a construir una que un lector de pantalla puede entender de verdad — algo que no ocurre solo, aunque uses th, thead y tfoot como en la lección 15. La pieza que de verdad conecta cada celda de datos con su cabecera correcta es un atributo concreto: `scope`.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué aporta cada pieza a quien no ve la tabla",
  "roles": [
    { "etiqueta": "th con scope", "rol": "Anunciar la cabecera correcta por celda", "descripcion": "Un lector de pantalla puede decir \"Corte de pelo, Coste: 30\" al llegar a esa celda — sin scope, esa asociación deja de ser automática." },
    { "etiqueta": "caption", "rol": "Decidir de un vistazo si importa", "descripcion": "Da a cualquiera, vea o no la tabla, una forma rápida de saber de qué trata antes de leerla entera." },
    { "etiqueta": "thead/tbody/tfoot", "rol": "Organizar y permitir estilos, no dar accesibilidad", "descripcion": "Ayudan a aplicar CSS distinto a cada sección (repetir cabeceras al imprimir, por ejemplo) — por sí solos no mejoran nada para un lector de pantalla." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Siempre que publiques una tabla con más de una fila de datos",
  "contenido": "scope en cada th no es un extra opcional para tablas \"importantes\" — es lo mínimo para que cualquier tabla real sea utilizable con un lector de pantalla."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando la tabla tiene cabeceras de fila Y de columna a la vez",
  "contenido": "Ahí es donde scope=\"row\" y scope=\"col\" combinados marcan más diferencia — cada celda de datos queda asociada a las dos cabeceras, no solo a una."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cuando la tabla tiene varios niveles de cabecera anidados",
  "contenido": "Antes de complicarla con headers/id, plantéate si se puede simplificar — el soporte real de los lectores de pantalla para tablas muy complejas sigue siendo desigual."
}
```

## Cómo se usa: th con scope

```laboratorio
{
  "tipo": "diagrama-etiqueta",
  "titulo": "Un th con scope, parte por parte",
  "partes": [
    { "texto": "<", "rol": "simbolo" },
    { "texto": "th", "rol": "apertura" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "scope", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"col\"", "rol": "atributo-valor" },
    { "texto": ">", "rol": "simbolo" },
    { "texto": "Coste (€)", "rol": "contenido" },
    { "texto": "<", "rol": "simbolo" },
    { "texto": "/th", "rol": "cierre" },
    { "texto": ">", "rol": "simbolo" }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<table>\n  <tr>\n    <th></th>\n    <th scope=\"col\">Coste (€)</th>\n  </tr>\n  <tr>\n    <th scope=\"row\">Corte de pelo</th>\n    <td>30</td>\n  </tr>\n  <tr>\n    <th scope=\"row\">Cena</th>\n    <td>18</td>\n  </tr>\n</table>",
  "anotaciones": [
    { "fragmento": "scope=\"col\"", "nota": "Esta cabecera aplica a toda la columna que tiene debajo — un lector de pantalla anuncia \"Coste, 30\" al llegar a esa celda de datos." },
    { "fragmento": "scope=\"row\"", "nota": "Esta cabecera aplica a toda la fila a su derecha — combinada con la de columna, cada celda de datos queda asociada a las DOS cabeceras a la vez (\"Corte de pelo, Coste: 30\")." }
  ]
}
```

## caption: el título que ven todos, no solo un lector de pantalla

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<table>\n  <tr><th scope=\"col\">Gasto</th><th scope=\"col\">Coste (€)</th></tr>\n  <tr><td>Corte de pelo</td><td>30</td></tr>\n</table>",
  "despues": "<table>\n  <caption>Cómo me gasté la paga este mes</caption>\n  <tr><th scope=\"col\">Gasto</th><th scope=\"col\">Coste (€)</th></tr>\n  <tr><td>Corte de pelo</td><td>30</td></tr>\n</table>",
  "nota": "El navegador muestra caption como un título visible encima de la tabla, sin que haga falta ningún CSS propio — a diferencia del atributo summary (obsoleto), que era invisible para todo el mundo excepto un lector de pantalla."
}
```

## Cuando scope no basta: tablas con varios niveles

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<table>\n  <tr>\n    <th></th>\n    <th id=\"ropa\" colspan=\"2\">Ropa</th>\n  </tr>\n  <tr>\n    <th></th>\n    <th id=\"pantalones\" headers=\"ropa\">Pantalones</th>\n    <th id=\"vestidos\" headers=\"ropa\">Vestidos</th>\n  </tr>\n  <tr>\n    <th id=\"belgica\">Bélgica</th>\n    <td headers=\"belgica ropa pantalones\">56</td>\n    <td headers=\"belgica ropa vestidos\">43</td>\n  </tr>\n</table>",
  "anotaciones": [
    { "fragmento": "id=\"ropa\"", "nota": "Cada cabecera implicada recibe un id único — la pieza que luego referencian las celdas de datos." },
    { "fragmento": "headers=\"ropa\"", "nota": "La subcabecera \"Pantalones\" declara que también depende de la cabecera \"Ropa\" que la agrupa por encima." },
    { "fragmento": "headers=\"belgica ropa pantalones\"", "nota": "Cada celda de datos lista TODOS los id de sus cabeceras relacionadas, separados por espacios — mucho más explícito que scope, pero también mucho más fácil de escribir mal." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "En la práctica, mejor \"aplanar\" que usar headers/id",
  "contenido": "WebAIM, tras pruebas reales con lectores de pantalla, desaconseja headers/id para la mayoría de casos: es fácil escribir un id que no coincide en algún sitio, y el fallo no se nota visualmente. Cuando sea posible, simplificar la tabla (menos niveles de cabecera, menos celdas fusionadas) suele ser más fiable que confiar en que la técnica más potente sobre el papel funcione perfecta en todos los lectores de pantalla."
}
```

## Lo que las tablas accesibles NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "thead, tbody y tfoot ya hacen la tabla accesible por sí solos",
      "realidad": "Por sí mismos no aportan ninguna mejora directa para quien usa lector de pantalla — son sobre todo ganchos de estilo con CSS. Lo que de verdad hace accesible una tabla es th con scope."
    },
    {
      "mito": "Un scope correcto ya cubre cualquier tabla, por compleja que sea",
      "realidad": "En tablas con varios niveles de cabecera y celdas fusionadas, algunos lectores de pantalla siguen sin soportarlo del todo bien — \"aplanar\" la tabla cuando se pueda es más fiable que confiar en el soporte técnico perfecto."
    },
    {
      "mito": "headers/id es la solución recomendada para tablas complejas",
      "realidad": "WebAIM lo desaconseja para la mayoría de casos — es tan fácil de escribir mal (un id que no coincide, un espacio de más) que scope, aunque menos potente sobre el papel, sale ganando en la práctica."
    },
    {
      "mito": "Una celda de cabecera vacía en la esquina superior izquierda no importa",
      "realidad": "Puede generar ambigüedad real sobre qué representa esa fila o columna — las cabeceras nunca deberían quedar vacías sin motivo."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Dejar th sin scope, confiando en que el lector de pantalla lo deduzca.", "texto": "En tablas con más de una fila o columna de cabecera, la asociación deja de ser obvia sin scope explícito." },
    { "titulo": "Usar el atributo summary en vez de caption.", "texto": "summary no forma parte de HTML5 y su soporte es pobre — caption es la forma moderna, y visible para todo el mundo." },
    { "titulo": "Complicar una tabla sencilla con headers/id sin necesitarlo.", "texto": "Si scope ya resuelve la asociación, añadir headers/id solo aumenta el riesgo de un id mal escrito sin ningún beneficio real." },
    { "titulo": "Fijar el ancho de las columnas en píxeles.", "texto": "Fuerza scroll horizontal en pantallas pequeñas o con el texto ampliado — anchuras relativas (porcentajes) se adaptan mejor." }
  ]
}
```

## Ejercicios

1. Coge una tabla sin caption ni scope de la lección anterior y añade los dos.
2. Escribe una tabla con cabeceras de fila Y de columna a la vez, usando scope="col" y scope="row" donde corresponda.
3. Explica con tus palabras por qué WebAIM recomienda "aplanar" una tabla compleja en vez de usar headers/id casi siempre.
4. Prueba una tabla real de una web que uses con un lector de pantalla o el modo de lectura de tu sistema operativo — ¿anuncia las cabeceras correctamente?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "HTML table accessibility",
      "descripcion": "Guía de referencia de MDN sobre scope, caption y la técnica headers/id para tablas con varios niveles de cabecera.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Table_accessibility",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Creating Accessible Tables — Data Tables",
      "descripcion": "Guía práctica de WebAIM basada en pruebas reales con lectores de pantalla — el motivo de fondo tras recomendar \"aplanar\" tablas complejas en vez de depender de headers/id.",
      "url": "https://webaim.org/techniques/tables/data",
      "etiqueta": "WebAIM"
    }
  ]
}
```
