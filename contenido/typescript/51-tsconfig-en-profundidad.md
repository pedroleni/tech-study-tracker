# tsconfig.json en profundidad: strict, target, module, lib

- **Módulo:** Módulos, declaraciones y configuración
- **Slug:** `tsconfig-en-profundidad` (autogenerado del título)
- **Orden:** 510
- **Fuentes:** [TSConfig Reference](https://www.typescriptlang.org/tsconfig/) + [Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html) — ver `contenido/typescript/TEMARIO.md` #51

---

## Qué es y para qué sirve

La lección 2 mostró un `tsconfig.json` mínimo. Esta lección profundiza en las cuatro opciones que más afectan al comportamiento real del compilador: qué comprobaciones activa `strict`, qué versión de JavaScript genera `target`, qué formato de módulos usa `module`, y qué APIs conoce `lib` — la misma opción que el editor en vivo de este curso configura internamente para saber que `document.querySelector` existe.

## strict: un interruptor que activa varias comprobaciones a la vez

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que strict activa de golpe",
  "roles": [
    { "etiqueta": "strictNullChecks", "rol": "null/undefined no se cuelan en cualquier tipo", "descripcion": "Ya visto en la lección 6 — sin esto, cualquier tipo admitiría null o undefined sin ningún aviso." },
    { "etiqueta": "noImplicitAny", "rol": "Un parámetro sin tipo es un error, no any silencioso", "descripcion": "Obliga a anotar explícitamente los parámetros de función en vez de dejar que se conviertan en any por defecto." },
    { "etiqueta": "strictPropertyInitialization", "rol": "Las propiedades de clase deben inicializarse", "descripcion": "Ya visto en la lección 32 — una propiedad sin inicializar ni en su declaración ni en el constructor da un error." },
    { "etiqueta": "strictFunctionTypes", "rol": "Comprobación más precisa de la compatibilidad de funciones", "descripcion": "Detecta casos límite donde asignar una función a un tipo de función distinto podría ser inseguro, algo que sin este flag pasaría sin aviso." }
  ]
}
```

## target: a qué versión de JavaScript se compila

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "target decide qué sintaxis moderna se transforma",
  "contenido": "Con target: 'ES5', código que usa async/await se REESCRIBE a una forma compatible con motores muy antiguos — generando bastante más código del que se escribió. Con target: 'ES2020' o más reciente, esa sintaxis se deja tal cual, porque se asume que el entorno de ejecución ya la soporta de forma nativa. Elegir un target más moderno de lo necesario para el público real de la aplicación puede producir código que no funcione en navegadores antiguos; elegir uno más antiguo de lo necesario genera código más grande y menos legible sin ninguna ganancia real."
}
```

## lib: qué APIs conoce el compilador

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"target\": \"ES2020\",\n    \"lib\": [\"ES2020\", \"DOM\", \"DOM.Iterable\"]\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "\"lib\": [\"ES2020\", \"DOM\", \"DOM.Iterable\"]", "nota": "lib no cambia qué código se GENERA — solo qué declaraciones de tipo conoce el compilador. Sin 'DOM' en esta lista, usar document o window daría un error de \"no se encuentra el nombre\", aunque el código funcionara perfectamente en un navegador real: el compilador simplemente no sabría que esas APIs existen." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Desactivar strict en un proyecto nuevo \"para que compile antes\".", "texto": "strict: true es la recomendación oficial para cualquier proyecto nuevo — desactivarlo renuncia a la mayoría de las comprobaciones que hacen valioso usar TypeScript en primer lugar." },
    { "titulo": "Omitir 'DOM' de lib en un proyecto que sí corre en el navegador.", "texto": "Da errores de \"no se encuentra el nombre 'document'\" (o similar) aunque el código sea perfectamente correcto — el problema no es el código, es que el compilador no tiene declaradas esas APIs." }
  ]
}
```

## Ejercicios

1. Explica qué comprobación añade `strictNullChecks` que no existiría sin `strict` activo.
2. ¿Por qué elegir un `target` demasiado antiguo puede generar código innecesariamente grande?
3. Un proyecto que usa `fetch` y `Promise` pero da un error de "no se encuentra el nombre 'fetch'" — ¿qué opción del `tsconfig.json` es la primera sospechosa?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "TSConfig Reference",
      "descripcion": "Referencia completa y oficial de todas las opciones de tsconfig.json.",
      "url": "https://www.typescriptlang.org/tsconfig/",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "Choosing Compiler Options",
      "descripcion": "Guía oficial sobre cómo elegir target, module y moduleResolution según el entorno real del proyecto.",
      "url": "https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
