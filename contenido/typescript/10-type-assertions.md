# Type assertions: as y el operador !

- **Módulo:** Tipos primitivos y valores
- **Slug:** `type-assertions` (autogenerado del título)
- **Orden:** 100
- **Fuentes:** [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — ver `contenido/typescript/TEMARIO.md` #10

---

## Qué es y para qué sirve

Una type assertion (`valor as Tipo`) le dice al compilador "confía en mí, sé que este valor es de este tipo" — sin comprobar nada en tiempo de ejecución. Es una escotilla de escape deliberada para los casos donde el programador tiene información que TypeScript no puede deducir por sí solo (el resultado de `document.querySelector`, por ejemplo). No convierte el valor — es solo una instrucción para el compilador, no código que se ejecute.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "as no comprueba nada — puede mentir",
  "contenido": "'hola' as unknown as number compila sin ningún error, aunque sea absurdo. Una type assertion desactiva la comprobación del compilador para ESE valor concreto — si el programador se equivoca, no hay ningún aviso, y el error solo aparecerá en tiempo de ejecución, exactamente el problema que TypeScript existe para evitar."
}
```

## Un caso de uso legítimo: el DOM

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// querySelector devuelve Element | null: TypeScript no puede saber\n// de antemano que ese selector concreto es un input\nconst campo = document.querySelector('#nombre') as HTMLInputElement;\ncampo.value = 'Ada'; // .value solo existe en HTMLInputElement, no en Element\n</script>",
  "anotaciones": [
    { "fragmento": "const campo = document.querySelector('#nombre') as HTMLInputElement;", "nota": "TypeScript solo conoce el tipo genérico Element | null a partir de la firma de querySelector — no puede saber, mirando el string '#nombre', que ese elemento concreto del HTML es un <input>. Aquí el programador SÍ tiene esa información." }
  ]
}
```

## El operador ! (non-null assertion)

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction buscar(id: number): string | undefined {\n  return id === 1 ? 'Ada' : undefined;\n}\n\nconst resultado = buscar(1)!; // \"confío en que no es undefined aquí\"\nconsole.log(resultado.toUpperCase());\n</script>",
  "anotaciones": [
    { "fragmento": "const resultado = buscar(1)!; // \"confío en que no es undefined aquí\"", "nota": "El operador ! quita undefined/null del tipo, sin comprobar nada en tiempo de ejecución — si el valor SÍ es undefined de verdad, este código explota igual que en JavaScript puro. Es exactamente el mismo tipo de riesgo que as, con sintaxis más corta." }
  ]
}
```

## Lo que las type assertions no son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "as convierte el valor al nuevo tipo, como una función de conversión",
      "realidad": "No ejecuta ninguna conversión — 'as Tipo' solo cambia lo que el COMPILADOR cree sobre el valor, el valor en tiempo de ejecución no cambia en absoluto."
    },
    {
      "mito": "Usar as o ! es siempre una señal de mal código",
      "realidad": "Son herramientas legítimas cuando el programador tiene información real que TypeScript no puede inferir (el DOM es el caso más común) — el problema es usarlas para silenciar un error real sin haber comprobado nada."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar as para silenciar un error de tipos sin comprobar si el valor es correcto de verdad.", "texto": "Convierte un error de COMPILACIÓN (detectado antes de ejecutar) en un error potencial de EJECUCIÓN (detectado, en el mejor caso, en producción) — exactamente lo contrario de para qué existe TypeScript." },
    { "titulo": "Encadenar as unknown as OtroTipo para forzar conversiones imposibles.", "texto": "TypeScript permite este \"doble cast\" a propósito como una escotilla de escape total — es una señal casi segura de que hay un problema de diseño de tipos más de fondo." }
  ]
}
```

## Ejercicios

1. Escribe un ejemplo real (con el DOM) donde una type assertion sea necesaria y razonable.
2. Explica por qué `'hola' as number` da un error, pero `'hola' as unknown as number` compila.
3. ¿Qué diferencia hay entre comprobar `if (valor !== undefined)` y usar el operador `!`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Everyday Types",
      "descripcion": "Capítulo del Handbook, sección sobre type assertions.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
