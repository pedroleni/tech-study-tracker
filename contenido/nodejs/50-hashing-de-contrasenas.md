# Hashing de contraseñas y comparación segura con node:crypto

- **Módulo:** Depuración, configuración y seguridad
- **Slug:** `hashing-de-contrasenas` (autogenerado del título)
- **Orden:** 500
- **Fuentes:** [Crypto](https://nodejs.org/api/crypto.html) — ver `contenido/nodejs/TEMARIO.md` #50

---

## Qué es y para qué sirve

Una contraseña real **nunca** se guarda en texto plano — se guarda un hash (una transformación de un solo sentido, imposible de revertir) generado con `scrypt`. Y comparar dos hashes tampoco se hace con `===`: `timingSafeEqual` evita un tipo de ataque real basado en medir cuánto tarda la comparación.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';\n\nfunction crearHash(contrasena) {\n  const sal = randomBytes(16);\n  const hash = scryptSync(contrasena, sal, 64);\n  return { sal: sal.toString('hex'), hash: hash.toString('hex') };\n}\n\nfunction verificarContrasena(contrasena, sal, hashGuardado) {\n  const hashCalculado = scryptSync(contrasena, Buffer.from(sal, 'hex'), 64);\n  return timingSafeEqual(hashCalculado, Buffer.from(hashGuardado, 'hex'));\n}\n</script>",
  "anotaciones": [
    { "fragmento": "const sal = randomBytes(16);", "nota": "La \"sal\" es un valor aleatorio distinto por cada usuario — sin ella, dos usuarios con la misma contraseña tendrían el mismo hash, y un atacante con una tabla de hashes ya calculados (rainbow table) podría reconocerlos al instante." },
    { "fragmento": "return timingSafeEqual(hashCalculado, Buffer.from(hashGuardado, 'hex'));", "nota": "Comparar dos buffers con === (o con un bucle normal) puede tardar un poquito menos si el primer byte ya no coincide, que si coinciden los primeros diez — esa diferencia de tiempo, medida con suficiente precisión y muchos intentos, es una vía real de ataque (timing attack). timingSafeEqual siempre tarda el mismo tiempo, sin importar en qué byte difieren." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Guardar contraseñas en texto plano, o con un hash sin sal.", "texto": "Sin sal, contraseñas idénticas producen el mismo hash — con una tabla de hashes ya calculados, un atacante puede reconocer contraseñas comunes de forma instantánea." },
    { "titulo": "Comparar hashes con === en vez de timingSafeEqual.", "texto": "Abre la puerta, en teoría, a un ataque de temporización — aunque explotarlo en la práctica sea difícil, timingSafeEqual existe precisamente para eliminar ese riesgo por completo, sin coste real añadido." }
  ]
}
```

## Ejercicios

1. Escribe una función que genere un hash de una contraseña con `scryptSync` y una sal aleatoria.
2. Escribe una función que verifique una contraseña contra ese hash usando `timingSafeEqual`.
3. Explica con tus palabras qué es un ataque de temporización y por qué `timingSafeEqual` lo evita.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Crypto",
      "descripcion": "Referencia oficial del módulo crypto, incluidos scrypt y timingSafeEqual.",
      "url": "https://nodejs.org/api/crypto.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
