# Uniones discriminadas: el patrón central de TypeScript

- **Módulo:** Narrowing y uniones discriminadas
- **Slug:** `uniones-discriminadas` (autogenerado del título)
- **Orden:** 230
- **Fuentes:** [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — ver `contenido/typescript/TEMARIO.md` #23

---

## Qué es y para qué sirve

Una unión discriminada es una unión de tipos de objeto donde cada miembro comparte una propiedad con un tipo literal distinto — el "discriminante" — que identifica sin ambigüedad de cuál de los casos se trata. Es, con diferencia, el patrón más importante de todo este temario: convierte estados que en JavaScript se representan con campos independientes (y por tanto pueden combinarse de formas que no tienen sentido) en un tipo donde los estados imposibles **no se pueden ni construir**.

## El problema real que resuelve

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// JavaScript: campos independientes\nlet cargando = false;\nlet error = null;\nlet datos = null;\n\n// Nada impide esto, aunque no tenga sentido:\ncargando = true;\nerror = 'Fallo de red';\n// ¿está cargando, o ha fallado? Los dos a la vez no es un estado real.\n</script>",
  "despues": "<script>\n// TypeScript: una unión discriminada\ntype EstadoPeticion =\n  | { estado: 'inicial' }\n  | { estado: 'cargando' }\n  | { estado: 'listo'; datos: string[] }\n  | { estado: 'error'; mensaje: string };\n\n// Solo puede ser UNO de los cuatro casos. 'error' y 'cargando' a la vez\n// ni siquiera es un valor que se pueda construir con este tipo.\n</script>",
  "nota": "No es \"más seguro\" en un sentido vago — es una estructura de datos que estructuralmente no permite el estado inconsistente. La propiedad estado (el discriminante) tiene un valor literal distinto en cada caso, y eso es lo que TypeScript usa para saber, en cada rama, con cuál de los cuatro objetos se está trabajando de verdad."
}
```

## El discriminante habilita narrowing automático

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "El switch estrecha el tipo en cada case",
  "consigna": "Dentro del case 'listo', intenta acceder a `resultado.mensaje` (que no existe ahí) para ver el error — y compáralo con acceder a `resultado.datos`, que sí existe en ese caso.",
  "ts": "type EstadoPeticion =\n  | { estado: 'inicial' }\n  | { estado: 'cargando' }\n  | { estado: 'listo'; datos: string[] }\n  | { estado: 'error'; mensaje: string };\n\nfunction describir(resultado: EstadoPeticion): string {\n  switch (resultado.estado) {\n    case 'inicial':\n      return 'Todavía no se ha pedido nada';\n    case 'cargando':\n      return 'Cargando…';\n    case 'listo':\n      return `${resultado.datos.length} resultados`;\n    case 'error':\n      return `Error: ${resultado.mensaje}`;\n  }\n}\n\nconsole.log(describir({ estado: 'listo', datos: ['a', 'b'] }));",
  "pestañaInicial": "ts"
}
```

## Por qué el discriminante tiene que ser un tipo literal

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "estado: string no discrimina nada",
  "contenido": "Si el campo discriminante se tipara como estado: string en vez de un literal ('inicial', 'cargando'...), TypeScript no podría relacionar el valor concreto de estado con la forma del resto del objeto — perdería toda la capacidad de estrechar el tipo dentro de cada case. El discriminante SIEMPRE tiene que ser un tipo literal (o una unión de literales), nunca el tipo general string."
}
```

## Lo que las uniones discriminadas no son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Una unión discriminada es solo una interfaz con muchos campos opcionales",
      "realidad": "Esa es justo la alternativa que el patrón evita — campos opcionales permiten combinaciones sin sentido (cargando y error a la vez). Cada miembro de la unión discriminada es un objeto COMPLETO y cerrado para ese caso concreto."
    },
    {
      "mito": "El nombre del discriminante tiene que ser \"estado\" o \"type\"",
      "realidad": "Puede llamarse como se quiera (kind, tipo, tag...) — lo único que importa es que sea un tipo literal distinto en cada miembro de la unión, y que se use consistentemente para narrowing."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Tipar el discriminante como string en vez de un literal.", "texto": "Sin un tipo literal, TypeScript no puede relacionar el valor del discriminante con la forma del resto del objeto — el narrowing automático deja de funcionar por completo." },
    { "titulo": "Mezclar campos que deberían pertenecer a un solo caso, fuera de la unión.", "texto": "Si mensaje o datos se declaran como propiedades opcionales compartidas por todos los casos en vez de exclusivas de 'error'/'listo', se reintroduce el mismo problema que la unión discriminada existe para evitar." }
  ]
}
```

## Ejercicios

1. Diseña una unión discriminada para el estado de una descarga de archivo: `'pendiente'`, `'descargando'` (con un campo `progreso: number`), `'completada'` (con un campo `ruta: string`) y `'fallida'` (con un campo `motivo: string`).
2. Escribe una función que reciba ese tipo y devuelva un mensaje distinto según el caso, usando un `switch` sobre el discriminante.
3. Explica por qué `estado: string` en vez de `estado: 'a' | 'b' | 'c'` rompe el narrowing automático.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Narrowing",
      "descripcion": "Capítulo del Handbook sobre uniones discriminadas y el patrón de estado.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
