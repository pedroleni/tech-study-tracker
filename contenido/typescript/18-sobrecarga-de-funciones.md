# Sobrecarga de funciones

- **Módulo:** Funciones tipadas
- **Slug:** `sobrecarga-de-funciones` (autogenerado del título)
- **Orden:** 180
- **Fuentes:** [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) — ver `contenido/typescript/TEMARIO.md` #18

---

## Qué es y para qué sirve

La sobrecarga de funciones deja declarar varias FIRMAS distintas para una misma función — combinaciones concretas de parámetros y retorno — cuando el comportamiento cambia de forma que una única firma con uniones no expresaría con precisión. Solo la última declaración lleva implementación real; las anteriores son firmas que TypeScript usa para comprobar cómo se llama la función desde fuera.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction crearFecha(timestamp: number): Date;\nfunction crearFecha(anio: number, mes: number, dia: number): Date;\nfunction crearFecha(a: number, mes?: number, dia?: number): Date {\n  if (mes !== undefined && dia !== undefined) {\n    return new Date(a, mes, dia);\n  }\n  return new Date(a);\n}\n\ncrearFecha(1700000000000); // válido: coincide con la primera firma\ncrearFecha(2026, 0, 15); // válido: coincide con la segunda firma\ncrearFecha(2026, 0); // Error: ninguna firma acepta exactamente dos argumentos\n</script>",
  "anotaciones": [
    { "fragmento": "function crearFecha(timestamp: number): Date;", "nota": "Primera firma: llamar con un único number. Sin cuerpo — es solo la declaración de una forma válida de llamar a la función." },
    { "fragmento": "function crearFecha(anio: number, mes: number, dia: number): Date;", "nota": "Segunda firma: llamar con tres numbers. Tampoco tiene cuerpo." },
    { "fragmento": "function crearFecha(a: number, mes?: number, dia?: number): Date {", "nota": "La IMPLEMENTACIÓN real, más permisiva que cualquiera de las firmas públicas — quien llama a la función solo ve las dos firmas de arriba, nunca esta." },
    { "fragmento": "crearFecha(2026, 0); // Error: ninguna firma acepta exactamente dos argumentos", "nota": "Aunque la implementación técnicamente aceptaría dos argumentos (mes y dia son opcionales ahí), las firmas PÚBLICAS no incluyen esa combinación — TypeScript solo valida contra las firmas declaradas, no contra la implementación." }
  ]
}
```

## Cuándo una unión ya basta, sin necesitar sobrecarga

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La sobrecarga no siempre es necesaria",
  "contenido": "Si el comportamiento no cambia según la combinación de argumentos, una unión de tipos en un único parámetro suele ser más simple que una sobrecarga: function procesar(valor: string | number) es preferible a dos firmas separadas cuando el CUERPO trata ambos casos de forma parecida. La sobrecarga aporta más cuando el TIPO DE RETORNO cambia según qué firma se usó, como en el ejemplo de crearFecha."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar sobrecarga cuando una unión de tipos ya sería suficiente.", "texto": "Añade complejidad sin necesidad si el tipo de retorno y el comportamiento no cambian realmente según qué firma se use." },
    { "titulo": "Olvidar que la implementación no es una firma pública más.", "texto": "La última declaración (con cuerpo) no se ofrece como una forma válida de llamar a la función desde fuera — solo las firmas anteriores, sin cuerpo, son las que ve quien la usa." }
  ]
}
```

## Ejercicios

1. Explica por qué la implementación de una función sobrecargada no cuenta como una firma pública más.
2. Escribe dos firmas sobrecargadas para una función `combinar` que acepte dos `string` (y devuelva `string`) o dos `number` (y devuelva `number`).
3. ¿Cuándo conviene más una unión de tipos en un solo parámetro que declarar varias firmas sobrecargadas?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "More on Functions",
      "descripcion": "Capítulo del Handbook sobre sobrecarga de funciones.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/functions.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
