# Almacenamiento en el cliente: localStorage y sessionStorage

- **Módulo:** APIs del navegador
- **Slug:** `almacenamiento-en-el-cliente-localstorage-y-sessionstorage` (autogenerado del título)
- **Orden:** 185
- **Fuentes:** [Client-side storage (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Client-side_storage) — ver `contenido/javascript/TEMARIO.md` #62

---

## Qué es y para qué sirve

Abre el módulo de APIs del navegador. `localStorage` y `sessionStorage` guardan datos directamente en el navegador, sin servidor — con la misma API sencilla (`setItem`/`getItem`/`removeItem`) y una diferencia clave: cuánto sobrevive lo guardado.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita guardar algo en el navegador",
  "roles": [
    { "etiqueta": "Quien guarda algo duradero", "rol": "localStorage", "descripcion": "Sobrevive a cerrar y volver a abrir el navegador — no tiene fecha de caducidad." },
    { "etiqueta": "Quien guarda algo temporal", "rol": "sessionStorage", "descripcion": "Se pierde en cuanto se cierra esa pestaña o el navegador." },
    { "etiqueta": "Quien necesita guardar un objeto", "rol": "JSON.stringify() / JSON.parse()", "descripcion": "Ambos solo guardan strings — cualquier otro tipo necesita convertirse antes." }
  ]
}
```

## setItem() y getItem(): guardar y leer

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  localStorage.setItem('nombre', 'Ana');\n  const nombreGuardado = localStorage.getItem('nombre');\n  console.log(nombreGuardado); // 'Ana'\n</script>",
  "anotaciones": [
    { "fragmento": "localStorage.setItem('nombre', 'Ana');", "nota": "setItem(clave, valor) guarda un par clave-valor; getItem(clave) lo recupera después — incluso tras recargar la página, porque localStorage sobrevive a eso." }
  ]
}
```

## removeItem(): borrar, y null en vez de error

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  localStorage.removeItem('nombre');\n  console.log(localStorage.getItem('nombre')); // null — ya no existe\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(localStorage.getItem('nombre')); // null — ya no existe", "nota": "removeItem(clave) borra esa entrada — getItem() sobre una clave que no existe (o que ya se borró) siempre devuelve null, nunca undefined ni un error." }
  ]
}
```

## localStorage frente a sessionStorage

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  localStorage.setItem('tema', 'oscuro');     // sobrevive a cerrar el navegador\n  sessionStorage.setItem('paso', '3');        // se borra al cerrar la pestaña/navegador\n</script>",
  "anotaciones": [
    { "fragmento": "localStorage.setItem('tema', 'oscuro');     // sobrevive a cerrar el navegador", "nota": "localStorage persiste incluso después de cerrar y volver a abrir el navegador — no tiene ninguna fecha de caducidad automática." },
    { "fragmento": "sessionStorage.setItem('paso', '3');        // se borra al cerrar la pestaña/navegador", "nota": "sessionStorage solo dura mientras esa pestaña (o el navegador) sigue abierto — se pierde en cuanto se cierra." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Solo strings, sin excepción",
  "contenido": "Web Storage solo guarda STRINGS — cualquier otro tipo de valor se convierte a texto automáticamente al guardarlo. Un número guardado con setItem() se recupera como string, no como número; un objeto se convierte en el texto '[object Object]', prácticamente inútil."
}
```

## Guardar un objeto: JSON.stringify() y JSON.parse()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const usuario = { nombre: 'Ana', edad: 32 };\n\n  localStorage.setItem('usuario', JSON.stringify(usuario)); // objeto → texto JSON\n  const guardado = JSON.parse(localStorage.getItem('usuario')); // texto JSON → objeto\n\n  console.log(guardado.nombre); // 'Ana' — un objeto real, no un string\n</script>",
  "anotaciones": [
    { "fragmento": "localStorage.setItem('usuario', JSON.stringify(usuario)); // objeto → texto JSON", "nota": "JSON.stringify() (visto en su propia lección) convierte el objeto en un string antes de guardarlo — sin este paso, se guardaría el inútil texto '[object Object]'." },
    { "fragmento": "const guardado = JSON.parse(localStorage.getItem('usuario')); // texto JSON → objeto", "nota": "JSON.parse() hace lo contrario al leerlo — reconstruye el objeto real a partir del texto JSON guardado." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Un almacén separado por dominio",
  "contenido": "Cada dominio tiene su propio almacén de datos, completamente aislado — lo guardado en un sitio nunca es visible desde otro dominio distinto, aunque ambos usen exactamente las mismas claves."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  localStorage.setItem('cantidad', 5);\n  const valor = localStorage.getItem('cantidad');\n\n  console.log(typeof valor);\n  console.log(valor === 5);\n</script>",
  "opciones": [
    "'string' y false — Web Storage convierte cualquier valor a texto; '5' (string) nunca es === a 5 (número)",
    "'number' y true — Web Storage conserva el tipo original del valor guardado",
    "'string' y true — === compara valores sin importar el tipo cuando vienen de localStorage"
  ],
  "correcta": 0,
  "explicacion": "setItem() convierte CUALQUIER valor a string antes de guardarlo — el número 5 se guarda como '5'. getItem() siempre devuelve un string: typeof valor es 'string'. Y '5' === 5 es false, porque === compara también el tipo, no solo el valor aparente."
}
```

## Lo que Web Storage NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "localStorage y sessionStorage guardan cualquier tipo de dato tal cual",
      "realidad": "Todo se convierte a STRING automáticamente — hace falta JSON.stringify()/JSON.parse() para objetos."
    },
    {
      "mito": "sessionStorage sobrevive a cerrar y reabrir el navegador, igual que localStorage",
      "realidad": "Se pierde en cuanto se cierra la pestaña o el navegador."
    },
    {
      "mito": "getItem() sobre una clave que no existe lanza un error",
      "realidad": "Devuelve null, sin ningún error."
    },
    {
      "mito": "Dos sitios web distintos pueden compartir los mismos datos guardados en localStorage",
      "realidad": "Cada dominio tiene su propio almacén, completamente aislado del resto."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Guardar un objeto directamente sin JSON.stringify().", "texto": "Se obtiene el inútil '[object Object]' al leerlo de vuelta." },
    { "titulo": "Comparar un valor leído de Web Storage con === contra un número.", "texto": "Siempre es un string — la comparación estricta con un número da false." },
    { "titulo": "Confundir localStorage con sessionStorage cuando los datos deben sobrevivir a cerrar el navegador.", "texto": "Solo localStorage lo garantiza." },
    { "titulo": "Esperar undefined (en vez de null) al leer una clave que no existe.", "texto": "getItem() siempre devuelve null en ese caso." }
  ]
}
```

## Ejercicios

1. Guarda un valor con `localStorage.setItem()`, recupéralo con `getItem()`, y bórralo con `removeItem()`.
2. Guarda un objeto usando `JSON.stringify()`, y recupéralo como objeto real con `JSON.parse()`.
3. Compara el comportamiento de `localStorage` y `sessionStorage` cerrando y reabriendo la pestaña.
4. Comprueba que `localStorage.getItem()` sobre una clave inexistente devuelve `null`, no `undefined`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Guarda un valor con localStorage.setItem(), recupéralo y bórralo (ejercicio 1). Este editor vive dentro de un iframe con sandbox=\"allow-scripts\" (sin allow-same-origin) — el mismo mecanismo de seguridad de todos los ejemplos en vivo de este curso. Un efecto secundario real de eso es que localStorage está deshabilitado aquí (origen opaco, sin almacenamiento propio): verás el error real que lanza el navegador. Copia este mismo código en un archivo .html normal en tu ordenador para verlo funcionar de verdad.",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\ntry {\n  localStorage.setItem('color-favorito', 'azul');\n  mostrar('Guardado: ' + localStorage.getItem('color-favorito'));\n  localStorage.removeItem('color-favorito');\n  mostrar('Tras removeItem: ' + localStorage.getItem('color-favorito'));\n} catch (error) {\n  mostrar('No se pudo usar localStorage aquí: ' + error.message);\n  mostrar('(Esto es el sandbox del editor, no un error en tu código)');\n}",
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
      "titulo": "Client-side storage",
      "descripcion": "Guía de MDN sobre setItem()/getItem()/removeItem(), la diferencia de persistencia entre localStorage y sessionStorage, y el aislamiento por dominio.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Client-side_storage",
      "etiqueta": "MDN"
    }
  ]
}
```
