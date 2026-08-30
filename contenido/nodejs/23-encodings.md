# Encodings: utf8, base64, hex

- **Módulo:** Buffers y datos binarios
- **Slug:** `encodings` (autogenerado del título)
- **Orden:** 230
- **Fuentes:** [Buffer](https://nodejs.org/api/buffer.html) — ver `contenido/nodejs/TEMARIO.md` #23

---

## Qué es y para qué sirve

Un encoding es una forma concreta de representar los mismos bytes como texto legible. `Buffer` soporta varios, cada uno con un uso real distinto — elegir el correcto no es un detalle cosmético, es lo que hace que los datos se interpreten correctamente al otro lado.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nconst datos = Buffer.from('Hola mundo', 'utf8');\n\nconsole.log(datos.toString('utf8')); // 'Hola mundo' - texto legible normal\nconsole.log(datos.toString('base64')); // 'SG9sYSBtdW5kbw==' - seguro para JSON/URLs\nconsole.log(datos.toString('hex')); // '486f6c61206d756e646f' - dos caracteres por byte\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(datos.toString('base64')); // 'SG9sYSBtdW5kbw==' - seguro para JSON/URLs", "nota": "base64 convierte datos binarios en un texto que solo usa letras, números y unos pocos símbolos — seguro para meter en JSON, una URL, o un campo de texto que no acepta cualquier byte crudo. Es una CODIFICACIÓN, no un cifrado: cualquiera puede revertirlo, no oculta nada." },
    { "fragmento": "console.log(datos.toString('hex')); // '486f6c61206d756e646f' - dos caracteres por byte", "nota": "hex representa cada byte como dos dígitos hexadecimales — habitual para mostrar hashes o firmas criptográficas de forma legible (se ve en los proyectos de este mismo temario que usan node:crypto)." }
  ]
}
```

## base64 no es cifrado

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Codificar algo en base64 lo hace seguro o lo oculta",
      "realidad": "base64 es reversible sin ninguna clave — cualquiera puede decodificarlo de vuelta al texto original con una sola función. Sirve para REPRESENTAR datos binarios como texto, nunca para protegerlos."
    },
    {
      "mito": "hex y base64 sirven para lo mismo",
      "realidad": "hex es más largo (dos caracteres por byte) pero más legible a simple vista para depurar; base64 es más compacto (unos 4 caracteres por cada 3 bytes) y es el estándar para meter datos binarios en contextos de texto como JSON o una URL."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Pensar que base64 protege información sensible.", "texto": "Es solo una representación de texto de los mismos bytes — para proteger datos de verdad hace falta cifrado real (node:crypto), no una codificación reversible sin clave." },
    { "titulo": "Mezclar encodings al codificar y decodificar.", "texto": "Buffer.from(datos, 'hex').toString('base64') es válido (decodifica como hex, luego codifica como base64) — pero asumir que un texto en base64 se puede leer directamente como hex sin decodificarlo primero produce basura." }
  ]
}
```

## Ejercicios

1. Convierte un mismo `Buffer` a `utf8`, `base64` y `hex`, y compara las tres salidas.
2. Explica por qué `base64` no es una forma de seguridad, aunque el texto resultante no sea legible a simple vista.
3. ¿Cuándo tiene más sentido usar `hex` que `base64`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Buffer",
      "descripcion": "Referencia oficial de los encodings soportados por Buffer.",
      "url": "https://nodejs.org/api/buffer.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
