# pgcrypto y uuid-ossp: dos extensiones de uso real

- **Módulo:** Extensiones
- **Slug:** `pgcrypto-y-uuid-ossp-dos-extensiones-de-uso-real` (autogenerado del título)
- **Orden:** 530
- **Fuentes:** [Appendix F. Additional Supplied Modules and Extensions](https://www.postgresql.org/docs/current/contrib.html) — ver `contenido/postgresql/TEMARIO.md` #16

---

## Qué es y para qué sirve

**`pgcrypto`** añade funciones de cifrado y hashing a Postgres — cifrar valores, generar checksums, y sobre todo el patrón real de **guardar y comprobar contraseñas sin guardar la contraseña**. **`uuid-ossp`** añade generadores de UUID más allá del aleatorio que ya trae el núcleo (visto en la lección anterior): variantes deterministas, útiles cuando el mismo UUID debe poder recalcularse a partir de los mismos datos de entrada.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "El patrón real: nunca se guarda la contraseña, solo su hash",
  "extensiones": ["pgcrypto"],
  "esquemaSql": "CREATE EXTENSION pgcrypto;\nCREATE TABLE usuarios (id serial primary key, email text, password_hash text);\nINSERT INTO usuarios (email, password_hash) VALUES ('ana@example.com', crypt('miclave', gen_salt('bf')));",
  "consulta": "SELECT email FROM usuarios WHERE password_hash = crypt('miclave', password_hash)",
  "anotaciones": [
    { "fragmento": "crypt('miclave', gen_salt('bf'))", "nota": "gen_salt('bf') genera una \"sal\" aleatoria (bcrypt); crypt() combina la contraseña con esa sal y devuelve el hash resultante — eso es lo único que se guarda en password_hash, nunca la contraseña en texto plano." },
    { "fragmento": "WHERE password_hash = crypt('miclave', password_hash)", "nota": "El truco real para verificar un login: crypt() reutiliza la sal YA incluida dentro del hash guardado (password_hash como segundo argumento) para volver a calcular el mismo hash a partir del intento — si coinciden, la contraseña introducida era la correcta." }
  ]
}
```

## Checksums reales con `digest()`

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "extensiones": ["pgcrypto"],
  "consigna": "digest() calcula el hash de un valor con el algoritmo que le indiques. Calcula el SHA-256 del texto 'tech-study-tracker' y muéstralo en hexadecimal con encode().",
  "esquemaSql": "CREATE EXTENSION pgcrypto;",
  "consultaInicial": "",
  "consultaSolucion": "SELECT encode(digest('tech-study-tracker', 'sha256'), 'hex')"
}
```

## `uuid-ossp`: UUID deterministas, no solo aleatorios

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "uuid_generate_v5: el mismo nombre siempre produce el mismo UUID",
  "extensiones": ["uuid_ossp"],
  "esquemaSql": "CREATE EXTENSION \"uuid-ossp\";",
  "consulta": "SELECT uuid_generate_v5(uuid_ns_url(), 'https://tech-study-tracker.dev/postgresql') = uuid_generate_v5(uuid_ns_url(), 'https://tech-study-tracker.dev/postgresql') AS mismo_uuid_las_dos_veces",
  "anotaciones": [
    { "fragmento": "uuid_generate_v5(uuid_ns_url(), 'https://tech-study-tracker.dev/postgresql')", "nota": "v5 combina un \"espacio de nombres\" (aquí, el estándar para URLs) con un texto — y siempre produce EL MISMO UUID para la misma combinación. gen_random_uuid() del núcleo, en cambio, es aleatorio: cada llamada da un resultado distinto, sin excepción." },
    { "fragmento": "= uuid_generate_v5(...) AS mismo_uuid_las_dos_veces", "nota": "Esta comparación devuelve true — la misma URL produce el mismo UUID las dos veces, en la misma ejecución o en cualquier otra, en cualquier servidor. Útil para generar un ID estable a partir de un dato externo (una URL, un email) sin tener que guardarlo aparte para \"recordarlo\"." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que el `SELECT` encuentra a `ana@example.com` — la contraseña "adivinada" (`'miclave'`) era la correcta.
2. Resuelve el segundo bloque: ¿cuántos caracteres tiene el hexadecimal resultante de un SHA-256? ¿Por qué ese número concreto, si SHA-256 produce 256 bits?
3. En el tercer bloque, ¿qué pasaría si en vez de `uuid_generate_v5` compararas dos llamadas a `gen_random_uuid()` con el mismo texto de por medio? ¿Por qué la respuesta sería la contraria?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Appendix F. Additional Supplied Modules and Extensions",
      "descripcion": "Índice de extensiones oficiales de Postgres — desde aquí se llega a la documentación completa de pgcrypto y uuid-ossp.",
      "url": "https://www.postgresql.org/docs/current/contrib.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
