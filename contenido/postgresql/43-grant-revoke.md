# GRANT/REVOKE: control de acceso real que SQLite no tiene

- **Módulo:** Roles, privilegios y control de acceso real
- **Slug:** `grant-revoke-control-de-acceso-real-que-sqlite-no-tiene` (autogenerado del título)
- **Orden:** 430
- **Fuentes:** [5.8. Privileges](https://www.postgresql.org/docs/current/ddl-priv.html) — ver `contenido/postgresql/TEMARIO.md` #13

---

## Qué es y para qué sirve

En SQLite, si un proceso puede abrir el fichero, puede hacer lo que quiera con toda la base de datos — no existe "puede leer esta tabla pero no aquella otra". En Postgres, cada tabla (y cada secuencia, función, esquema...) tiene su propia lista de privilegios por rol: `SELECT`, `INSERT`, `UPDATE`, `DELETE` se conceden y se retiran de forma independiente, y por defecto un rol nuevo **no tiene ninguno** sobre las tablas de otro dueño.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un rol con exactamente los privilegios que necesita, ni uno más",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, nombre text, precio numeric);\nCREATE ROLE vendedor NOSUPERUSER;\nGRANT vendedor TO current_user;\nGRANT SELECT, INSERT ON productos TO vendedor;\nGRANT USAGE, SELECT ON SEQUENCE productos_id_seq TO vendedor;\nSET ROLE vendedor;",
  "consulta": "INSERT INTO productos (nombre, precio) VALUES ('Teclado', 45.99) RETURNING id",
  "anotaciones": [
    { "fragmento": "GRANT SELECT, INSERT ON productos TO vendedor;", "nota": "Privilegios explícitos y mínimos: vendedor puede leer e insertar, pero nada dijo nunca que pudiera borrar o modificar filas ajenas — el principio de mínimo privilegio, literal en el propio SQL." },
    { "fragmento": "GRANT USAGE, SELECT ON SEQUENCE productos_id_seq TO vendedor;", "nota": "Detalle real y fácil de olvidar: una columna serial usa una secuencia por debajo, y esa secuencia TAMBIÉN tiene sus propios privilegios — sin este GRANT, el INSERT fallaría al no poder generar el siguiente id." },
    { "fragmento": "SET ROLE vendedor;", "nota": "A partir de aquí, la consulta se ejecuta literalmente como vendedor, no como el superusuario que creó todo esto — la prueba real de que los privilegios concedidos (y solo esos) son los que se están usando." }
  ]
}
```

## El otro lado: lo que NO se concedió, falla de verdad

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "vendedor tiene SELECT e INSERT sobre productos, pero nunca se le concedió DELETE. Intenta borrar la fila con id = 1 y lee el error real de Postgres.",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, nombre text, precio numeric);\nINSERT INTO productos (nombre, precio) VALUES ('Teclado', 45.99);\nCREATE ROLE vendedor NOSUPERUSER;\nGRANT vendedor TO current_user;\nGRANT SELECT, INSERT ON productos TO vendedor;\nSET ROLE vendedor;",
  "consultaInicial": "DELETE FROM productos WHERE id = 1",
  "consultaSolucion": "SELECT nombre FROM productos"
}
```

## `REVOKE` es lo contrario, no un permiso especial nuevo

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "REVOKE quita exactamente lo que GRANT dio.", "texto": "REVOKE SELECT ON productos FROM vendedor; deshace un GRANT SELECT anterior. No es un comando de \"prohibir\" aparte — Postgres por defecto ya empieza sin privilegios; REVOKE solo tiene sentido para retirar algo que se concedió antes (a ese rol, o a PUBLIC)." },
    { "titulo": "PUBLIC es el rol implícito \"todo el mundo\".", "texto": "GRANT ... TO PUBLIC concede el privilegio a cualquier rol, presente o futuro. Postgres moderno ya NO concede privilegios a PUBLIC por defecto en tablas nuevas — algo que versiones antiguas sí hacían para el esquema public, y que fue una fuente real de brechas de seguridad." },
    { "titulo": "El dueño de la tabla siempre puede — no necesita GRANT.", "texto": "Quien ejecuta CREATE TABLE es su dueño, y el dueño tiene automáticamente todos los privilegios sobre su propia tabla, sin necesidad de ningún GRANT explícito hacia sí mismo." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que el `INSERT` como `vendedor` funciona y devuelve un `id` real.
2. Resuelve el segundo bloque y lee el mensaje de error exacto del `DELETE` denegado — ¿menciona el nombre de la tabla?
3. Si quisieras que `vendedor` también pudiera actualizar el precio de un producto pero nunca borrar filas, ¿qué `GRANT` añadirías al `esquemaSql` de arriba?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "5.8. Privileges",
      "descripcion": "Capítulo oficial sobre el sistema de privilegios de Postgres: qué privilegios existen por tipo de objeto y cómo funciona PUBLIC.",
      "url": "https://www.postgresql.org/docs/current/ddl-priv.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
