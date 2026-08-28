# Enviar datos de formulario con fetch

- **Módulo:** Eventos
- **Slug:** `enviar-datos-de-formulario-con-fetch` (autogenerado del título)
- **Orden:** 140
- **Fuentes:** [Sending forms through JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Sending_forms_through_JavaScript) — ver `contenido/javascript/TEMARIO.md` #47

---

## Qué es y para qué sirve

Cierra el módulo de eventos, conectando con lo visto en la lección anterior: una vez interceptado el envío y validado el formulario, `fetch()` es cómo se manda esa información al servidor sin recargar la página — usando `FormData`, la estructura pensada exactamente para esto.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita enviar un formulario sin recargar la página",
  "roles": [
    { "etiqueta": "Quien empaqueta los datos", "rol": "FormData", "descripcion": "Lee automáticamente todos los campos con name de un <form>, o se construye a mano con append()." },
    { "etiqueta": "Quien envía la petición", "rol": "fetch()", "descripcion": "Con method: 'POST' y el FormData como body — configura la cabecera correcta por su cuenta." },
    { "etiqueta": "Quien gestiona un fallo de red", "rol": "try/catch", "descripcion": "Evita que un fallo (sin conexión, servidor caído) rompa el resto del código sin control." }
  ]
}
```

## FormData: construir los datos a mano

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const datos = new FormData();\n  datos.append('nombre', 'Ada');\n  datos.append('email', 'ada@ejemplo.com');\n\n  console.log(datos.get('nombre')); // 'Ada'\n</script>",
  "anotaciones": [
    { "fragmento": "datos.append('nombre', 'Ada');\n  datos.append('email', 'ada@ejemplo.com');", "nota": "FormData es una estructura pensada para enviar datos con el mismo formato que un formulario HTML real — append(clave, valor) añade cada campo, uno por uno." }
  ]
}
```

## FormData a partir de un formulario real

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const formulario = document.querySelector('#formulario-usuario');\n  const datos = new FormData(formulario);\n\n  console.log(datos.get('nombre')); // el valor ACTUAL del campo 'nombre'\n</script>",
  "anotaciones": [
    { "fragmento": "const datos = new FormData(formulario);", "nota": "Pasar el elemento <form> directamente a new FormData() lee automáticamente TODOS sus campos con atributo name, con el valor que tengan en ese momento — sin necesitar un append() manual por cada uno." }
  ]
}
```

## El patrón completo: interceptar, empaquetar, enviar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const formulario = document.querySelector('#formulario-usuario');\n\n  formulario.addEventListener('submit', async (evento) => {\n    evento.preventDefault();\n\n    const datos = new FormData(formulario);\n\n    const respuesta = await fetch('https://api.ejemplo.com/usuarios', {\n      method: 'POST',\n      body: datos,\n    });\n\n    const resultado = await respuesta.json();\n    console.log(resultado);\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "body: datos,", "nota": "El FormData se pasa como body de la petición — fetch() sabe interpretarlo directamente, sin necesitar convertirlo a texto ni a ningún otro formato antes." },
    { "fragmento": "const resultado = await respuesta.json();", "nota": "respuesta.json() interpreta el cuerpo de la respuesta como JSON — devuelve una promesa, por eso necesita su propio await." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "async/await tiene su propia lección justo después",
  "contenido": "async y await aparecen aquí para poder mostrar el patrón completo de principio a fin — su funcionamiento en profundidad tiene su propia lección al comienzo del siguiente módulo. Por ahora basta con seguir el patrón: async delante de la función, await delante de cada operación que tarda."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "fetch() configura Content-Type por su cuenta",
  "contenido": "Al pasar un FormData como body, fetch() configura automáticamente la cabecera Content-Type correcta — incluido el multipart/form-data necesario cuando hay archivos de por medio. No hace falta añadirla a mano, a diferencia de enviar JSON."
}
```

## try/catch: gestionar un fallo de red

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  formulario.addEventListener('submit', async (evento) => {\n    evento.preventDefault();\n    const datos = new FormData(formulario);\n\n    try {\n      const respuesta = await fetch('https://api.ejemplo.com/usuarios', {\n        method: 'POST',\n        body: datos,\n      });\n      console.log(await respuesta.json());\n    } catch (error) {\n      console.error('Algo falló:', error);\n    }\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "try {\n      const respuesta = await fetch('https://api.ejemplo.com/usuarios', {\n        method: 'POST',\n        body: datos,\n      });\n      console.log(await respuesta.json());\n    } catch (error) {\n      console.error('Algo falló:', error);\n    }", "nota": "Envolver la llamada en try/catch evita que un fallo de red (sin conexión, servidor caído) rompa el resto del código sin control — el error se captura en vez de propagarse sin gestionar." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  // HTML: <form id=\"f\"><input name=\"ciudad\" value=\"Madrid\"></form>\n  const formulario = document.querySelector('#f');\n  formulario.querySelector('input').value = 'Barcelona'; // el usuario cambió el valor\n\n  const datos = new FormData(formulario);\n  console.log(datos.get('ciudad'));\n</script>",
  "opciones": [
    "'Barcelona' — new FormData(formulario) lee el valor ACTUAL de cada campo en el momento de crearse, no el valor original del HTML",
    "'Madrid' — FormData siempre usa el valor que tenía el campo al cargar la página",
    "null — FormData no puede leer valores de un input a menos que se use append() manualmente"
  ],
  "correcta": 0,
  "explicacion": "new FormData(formulario) lee los campos del formulario en el momento EXACTO en que se construye — incluido cualquier cambio hecho por el usuario (o por JavaScript) antes de ese instante. datos.get('ciudad') devuelve 'Barcelona', el valor actual, no el original 'Madrid' del atributo value del HTML."
}
```

## Lo que FormData y fetch() NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Hay que usar append() manualmente para cada campo, incluso teniendo el elemento <form>",
      "realidad": "Pasar el <form> directamente a new FormData() lee todos sus campos automáticamente."
    },
    {
      "mito": "Al enviar un FormData con fetch() hay que configurar manualmente la cabecera Content-Type",
      "realidad": "fetch() la configura automáticamente, incluido el multipart/form-data para archivos."
    },
    {
      "mito": "new FormData(formulario) usa los valores que tenía el HTML al cargar la página, no los actuales",
      "realidad": "Lee los valores ACTUALES de cada campo en el momento de construirse."
    },
    {
      "mito": "Sin try/catch, un error de fetch() simplemente se ignora en silencio",
      "realidad": "Sin capturarlo, el error se propaga sin gestionar — try/catch permite manejarlo con control en vez de dejarlo romper el flujo esperado."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Construir un FormData con append() manual, campo por campo, teniendo ya el elemento <form> disponible.", "texto": "new FormData(formulario) hace ese trabajo automáticamente." },
    { "titulo": "Añadir manualmente una cabecera Content-Type al enviar un FormData con fetch().", "texto": "fetch() ya la configura por su cuenta, con el valor correcto." },
    { "titulo": "Olvidar evento.preventDefault() antes de manejar el envío con fetch().", "texto": "Sin él, el navegador también intenta su envío nativo, recargando la página." },
    { "titulo": "No envolver la llamada a fetch() en try/catch.", "texto": "Deja los errores de red sin ninguna gestión propia." }
  ]
}
```

## Ejercicios

1. Construye un `FormData` manualmente con `append()` para dos o tres campos.
2. Construye un `FormData` a partir de un elemento `<form>` real, y lee uno de sus valores con `get()`.
3. Envía un `FormData` con `fetch()` usando `method: 'POST'`, interceptando antes el envío con `preventDefault()`.
4. Envuelve la llamada a `fetch()` en `try/catch`, y provoca un error (por ejemplo, con una URL inválida) para comprobar que se captura.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Sending forms through JavaScript",
      "descripcion": "Guía de MDN sobre FormData (manual y asociado a un <form>), el envío con fetch() usando method: 'POST', y la configuración automática de Content-Type.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Sending_forms_through_JavaScript",
      "etiqueta": "MDN"
    }
  ]
}
```
