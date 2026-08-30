# Primeros pasos con node:test

- **Módulo:** El test runner nativo
- **Slug:** `primeros-pasos-node-test` (autogenerado del título)
- **Orden:** 450
- **Fuentes:** [Discovering Node.js's test runner](https://nodejs.org/en/learn/test-runner/introduction) + [Test runner](https://nodejs.org/api/test.html) — ver `contenido/nodejs/TEMARIO.md` #45

---

## Qué es y para qué sirve

Node.js incluye su propio test runner desde la versión 20 (`node:test`, estable, no experimental) — se pueden escribir y ejecutar tests reales sin instalar Vitest, Jest, ni ninguna otra dependencia externa.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// suma.test.js\nimport { test } from 'node:test';\nimport assert from 'node:assert';\n\nfunction sumar(a, b) {\n  return a + b;\n}\n\ntest('sumar dos números positivos', () => {\n  assert.strictEqual(sumar(2, 3), 5);\n});\n\ntest('sumar con un número negativo', () => {\n  assert.strictEqual(sumar(5, -2), 3);\n});\n</script>",
  "anotaciones": [
    { "fragmento": "import assert from 'node:assert';", "nota": "node:assert es el módulo de aserciones que viene con Node.js — assert.strictEqual compara con === (estricta), a diferencia de assert.equal, que usa == (con conversión de tipos)." },
    { "fragmento": "test('sumar dos números positivos', () => {", "nota": "Ejecutar node --test detecta automáticamente los ficheros de test del proyecto (por convención, *.test.js) y corre cada test() que encuentre, sin necesitar ninguna configuración adicional." }
  ]
}
```

## Agrupar tests con describe

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { describe, test } from 'node:test';\nimport assert from 'node:assert';\n\ndescribe('sumar', () => {\n  test('dos números positivos', () => {\n    assert.strictEqual(sumar(2, 3), 5);\n  });\n\n  test('un número negativo', () => {\n    assert.strictEqual(sumar(5, -2), 3);\n  });\n});\n</script>",
  "anotaciones": [
    { "fragmento": "describe('sumar', () => {", "nota": "describe agrupa tests relacionados bajo un nombre común — puramente organizativo, no cambia cómo se ejecutan, solo cómo se presentan en el resultado." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir assert.equal (con conversión de tipos) con assert.strictEqual (sin conversión).", "texto": "assert.equal(1, '1') pasa porque compara con ==; assert.strictEqual(1, '1') falla porque compara con === — para tests, la versión estricta es casi siempre la más segura por defecto." },
    { "titulo": "Pensar que hace falta instalar una librería externa para tener tests reales en Node.js.", "texto": "node:test es estable desde la versión 20 — para proyectos que no necesitan características muy específicas de Vitest/Jest, ya no hace falta ninguna dependencia externa." }
  ]
}
```

## Ejercicios

1. Escribe una función simple y al menos dos tests para ella usando `node:test` y `node:assert`.
2. Agrupa esos tests bajo un `describe`.
3. Explica la diferencia entre `assert.equal` y `assert.strictEqual`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Discovering Node.js's test runner",
      "descripcion": "Guía oficial de introducción al test runner nativo.",
      "url": "https://nodejs.org/en/learn/test-runner/introduction",
      "etiqueta": "Node.js"
    },
    {
      "titulo": "Test runner",
      "descripcion": "Referencia oficial completa del módulo node:test.",
      "url": "https://nodejs.org/api/test.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
