# Cobertura de código

- **Módulo:** El test runner nativo
- **Slug:** `cobertura-de-codigo` (autogenerado del título)
- **Orden:** 470
- **Fuentes:** [Collecting code coverage in Node.js](https://nodejs.org/en/learn/test-runner/collecting-code-coverage) — ver `contenido/nodejs/TEMARIO.md` #47

---

## Qué es y para qué sirve

La cobertura de código mide qué porcentaje de las líneas (o ramas, o funciones) de un proyecto se ejecutaron realmente durante los tests — una forma objetiva de detectar código que ningún test toca todavía, aunque no garantiza por sí sola que los tests existentes sean buenos.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// Ejecutar los tests con cobertura:\n// node --test --experimental-test-coverage\n\nfunction clasificar(edad) {\n  if (edad < 18) return 'menor';\n  if (edad < 65) return 'adulto';\n  return 'mayor'; // si ningún test prueba edad >= 65, esta línea aparece sin cubrir\n}\n</script>",
  "anotaciones": [
    { "fragmento": "// node --test --experimental-test-coverage", "nota": "La cobertura sigue siendo una funcionalidad experimental del test runner nativo (a diferencia del propio test runner, que ya es estable) — el flag --experimental-test-coverage lo deja claro en el propio nombre." },
    { "fragmento": "return 'mayor'; // si ningún test prueba edad >= 65, esta línea aparece sin cubrir", "nota": "El informe de cobertura señalaría esta línea concreta como no ejecutada por ningún test — una forma directa de encontrar huecos reales en la suite, no solo una cifra global." }
  ]
}
```

## Un número alto de cobertura no es el objetivo en sí mismo

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "100% de cobertura significa que el código está bien testeado",
      "realidad": "Cobertura solo mide que una línea SE EJECUTÓ, no que el test comprobó de verdad que su resultado es correcto — un test sin ninguna aserción real puede dar 100% de cobertura sin verificar nada útil."
    },
    {
      "mito": "Un porcentaje de cobertura bajo siempre significa tests insuficientes",
      "realidad": "Puede significar eso, o puede significar que hay código muerto que ya no se usa en ningún sitio — la cobertura señala DÓNDE mirar, no dice automáticamente cuál es el problema real."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Perseguir un número de cobertura sin revisar qué comprueban realmente los tests.", "texto": "Un test que ejecuta código sin ninguna aserción sube la cobertura sin aportar ninguna garantía real de que el comportamiento sea correcto." },
    { "titulo": "Olvidar que la cobertura del test runner nativo sigue siendo experimental.", "texto": "El propio flag --experimental-test-coverage lo indica — puede cambiar de comportamiento entre versiones de Node.js con menos garantías de estabilidad que el resto del test runner." }
  ]
}
```

## Ejercicios

1. Ejecuta `node --test --experimental-test-coverage` sobre un proyecto con al menos una rama de código sin testear, y observa qué señala el informe.
2. Explica por qué un 100% de cobertura no garantiza que el código esté bien testeado.
3. ¿Qué tres unidades distintas puede medir un informe de cobertura (además de líneas)?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Collecting code coverage in Node.js",
      "descripcion": "Guía oficial sobre cobertura de código con el test runner nativo.",
      "url": "https://nodejs.org/en/learn/test-runner/collecting-code-coverage",
      "etiqueta": "Node.js"
    }
  ]
}
```
