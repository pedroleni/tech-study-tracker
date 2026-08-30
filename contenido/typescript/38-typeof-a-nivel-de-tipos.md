# typeof a nivel de tipos

- **Módulo:** Operadores de manipulación de tipos
- **Slug:** `typeof-a-nivel-de-tipos` (autogenerado del título)
- **Orden:** 380
- **Fuentes:** [Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html) — ver `contenido/typescript/TEMARIO.md` #38

---

## Qué es y para qué sirve

`typeof` ya se conocía de JavaScript, comprobando en tiempo de ejecución si un valor es `'string'`, `'number'`, etc. (módulo de Narrowing). En una POSICIÓN DE TIPO — dentro de una anotación, no de una expresión — `typeof` significa algo distinto: "el tipo que TypeScript ya infirió para este valor". Es la herramienta para reutilizar, como tipo, la forma de algo que ya existe como valor.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "El tipo de una variable, extraído con typeof",
  "consigna": "Cambia `otraConfiguracion.puerto` por un string y observa el error — su tipo se extrajo directamente de `configuracion`.",
  "ts": "const configuracion = {\n  puerto: 3000,\n  host: 'localhost',\n};\n\ntype Configuracion = typeof configuracion; // { puerto: number; host: string }\n\nconst otraConfiguracion: Configuracion = {\n  puerto: 8080,\n  host: '0.0.0.0',\n};\n\nconsole.log(otraConfiguracion);",
  "pestañaInicial": "ts"
}
```

## keyof typeof: las claves de un valor concreto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nconst colores = {\n  rojo: '#ff0000',\n  verde: '#00ff00',\n  azul: '#0000ff',\n};\n\ntype NombreColor = keyof typeof colores; // 'rojo' | 'verde' | 'azul'\n\nfunction obtenerColor(nombre: NombreColor): string {\n  return colores[nombre];\n}\n</script>",
  "anotaciones": [
    { "fragmento": "type NombreColor = keyof typeof colores; // 'rojo' | 'verde' | 'azul'", "nota": "keyof necesita un TIPO, no un valor — typeof colores convierte el valor colores en su tipo inferido, y keyof extrae de ahí las claves. Este patrón, keyof typeof, es extremadamente común para derivar un tipo directamente de un objeto real ya existente, como el patrón as const de la lección 27." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir el typeof de tipos con el typeof de valores.", "texto": "typeof x === 'string' (en una expresión, comprobación en tiempo de ejecución) y type T = typeof x (en una posición de tipo, extrae el tipo inferido) son dos usos distintos del mismo símbolo — el contexto decide cuál aplica." },
    { "titulo": "Usar keyof directamente sobre un valor.", "texto": "keyof colores no es válido — colores es un valor, no un tipo. Hace falta keyof typeof colores." }
  ]
}
```

## Ejercicios

1. Declara un objeto `opciones` con al menos tres propiedades, y extrae su tipo con `typeof`.
2. Combina `keyof` y `typeof` para obtener la unión de claves de ese mismo objeto.
3. ¿Por qué `keyof miObjeto` (sin `typeof`) da un error si `miObjeto` es un valor, no un tipo?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Typeof Type Operator",
      "descripcion": "Capítulo del Handbook sobre typeof en posición de tipo.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/typeof-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
