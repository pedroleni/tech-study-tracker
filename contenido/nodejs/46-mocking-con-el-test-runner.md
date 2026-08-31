# Mocking con el test runner nativo

- **Módulo:** El test runner nativo
- **Slug:** `mocking-con-el-test-runner` (autogenerado del título)
- **Orden:** 460
- **Fuentes:** [Mocking in tests](https://nodejs.org/en/learn/test-runner/mocking) — ver `contenido/nodejs/TEMARIO.md` #46

---

## Qué es y para qué sirve

Un mock sustituye una función real por una versión falsa y controlada — necesario para testear código que depende de algo lento, costoso o externo (una llamada de red, la hora actual, un número aleatorio) sin depender de verdad de esas cosas durante el test. `node:test` incluye su propio objeto `mock`, sin librerías externas.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { test, mock } from 'node:test';\nimport assert from 'node:assert';\n\ntest('llama a la función mockeada con los argumentos correctos', () => {\n  const funcionFalsa = mock.fn((a, b) => a + b);\n\n  const resultado = funcionFalsa(2, 3);\n\n  assert.strictEqual(resultado, 5);\n  assert.strictEqual(funcionFalsa.mock.callCount(), 1);\n  assert.deepStrictEqual(funcionFalsa.mock.calls[0].arguments, [2, 3]);\n});\n</script>",
  "anotaciones": [
    { "fragmento": "const funcionFalsa = mock.fn((a, b) => a + b);", "nota": "mock.fn() envuelve una función (real o vacía) y registra cada llamada — sigue ejecutando la lógica que se le pase, pero además permite comprobar CUÁNTAS veces se llamó y CON QUÉ argumentos." },
    { "fragmento": "assert.strictEqual(funcionFalsa.mock.callCount(), 1);", "nota": "callCount() da el número de veces que se llamó a la función mockeada — útil para comprobar que un callback se ejecuta exactamente el número de veces esperado, ni más ni menos." }
  ]
}
```

## Mockear el reloj del sistema: mock.timers

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Testear código que depende de setTimeout sin esperar de verdad",
  "contenido": "mock.timers permite \"avanzar\" el tiempo artificialmente dentro de un test — un test que depende de un setTimeout de 5 segundos no tiene que esperar 5 segundos reales para comprobar que el callback se ejecutó: se avanza el reloj simulado y se comprueba el resultado al instante."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Mockear una función y olvidar comprobar cómo se llamó, no solo su resultado.", "texto": "El valor de retorno es solo una parte de lo que un mock puede verificar — callCount() y mock.calls[i].arguments comprueban el COMPORTAMIENTO real, no solo el resultado final." },
    { "titulo": "Usar setTimeout real (esperando de verdad) en vez de mock.timers en un test.", "texto": "Hace que la suite de tests sea innecesariamente lenta — un test que espera 5 segundos reales por cada ejecución, multiplicado por muchos tests así, hace la suite entera lenta de verdad." }
  ]
}
```

## Ejercicios

1. Escribe un test que use `mock.fn()` para comprobar que una función se llamó exactamente una vez.
2. Usa `funcionFalsa.mock.calls[0].arguments` para comprobar con qué argumentos se llamó una función mockeada.
3. Explica qué problema real resuelve `mock.timers` al testear código con `setTimeout`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Mocking in tests",
      "descripcion": "Guía oficial de mocking con el test runner nativo.",
      "url": "https://nodejs.org/en/learn/test-runner/mocking",
      "etiqueta": "Node.js"
    }
  ]
}
```
