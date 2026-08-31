# CREATE TRIGGER: BEFORE/AFTER, por fila o por sentencia

- **Módulo:** Triggers
- **Slug:** `create-trigger` (autogenerado del título)
- **Orden:** 370
- **Fuentes:** [37. Triggers](https://www.postgresql.org/docs/current/triggers.html) — ver `contenido/postgresql/TEMARIO.md` #14

---

## Qué es y para qué sirve

Un **trigger** ejecuta una función automáticamente cuando ocurre un evento sobre una tabla — un `INSERT`, `UPDATE` o `DELETE` — sin que la aplicación tenga que acordarse de llamarlo. Un trigger siempre está formado por dos piezas: la función que se ejecuta (escrita en PL/pgSQL, como ya viste) y el propio `CREATE TRIGGER` que la conecta a un evento concreto.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un trigger real, disparado automáticamente por un INSERT",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, nombre text, precio numeric);\nCREATE TABLE auditoria (id serial primary key, mensaje text, ocurrido_en timestamptz default now());\nCREATE FUNCTION registrar_insercion() RETURNS trigger AS $$\nBEGIN\n  INSERT INTO auditoria (mensaje) VALUES ('Producto insertado: ' || NEW.nombre);\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\nCREATE TRIGGER trg_auditar_insercion\n  AFTER INSERT ON productos\n  FOR EACH ROW\n  EXECUTE FUNCTION registrar_insercion();\nINSERT INTO productos (nombre, precio) VALUES ('Teclado', 45.99);",
  "consulta": "SELECT mensaje FROM auditoria",
  "anotaciones": [
    { "fragmento": "CREATE FUNCTION registrar_insercion() RETURNS trigger AS $$", "nota": "Una función de trigger SIEMPRE devuelve trigger (un tipo especial), nunca un tipo normal — y nunca se llama directamente con SELECT, solo Postgres la invoca cuando el evento ocurre." },
    { "fragmento": "AFTER INSERT ON productos\n  FOR EACH ROW", "nota": "AFTER INSERT: se dispara DESPUÉS de que la fila ya se insertó. FOR EACH ROW: una vez por cada fila afectada (frente a FOR EACH STATEMENT, una sola vez por sentencia entera, sin importar cuántas filas tocó)." },
    { "fragmento": "INSERT INTO productos (nombre, precio) VALUES ('Teclado', 45.99);", "nota": "Nadie llamó a registrar_insercion() directamente — el propio INSERT disparó el trigger solo, sin que la aplicación tuviera que saber que existe." }
  ]
}
```

## `BEFORE` frente a `AFTER`

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "BEFORE: se ejecuta ANTES de que el cambio se aplique — puede modificarlo o cancelarlo.", "texto": "Un trigger BEFORE puede cambiar los valores que se van a insertar (modificando NEW, próxima lección) o incluso impedir la operación por completo (devolviendo NULL en vez de NEW)." },
    { "titulo": "AFTER: se ejecuta DESPUÉS — ya no puede cambiar la fila, solo reaccionar.", "texto": "El caso de arriba: auditoría, notificaciones, actualizar una tabla relacionada — acciones que dependen de que el cambio original YA ocurrió de verdad." },
    { "titulo": "FOR EACH ROW frente a FOR EACH STATEMENT.", "texto": "Un INSERT que añade 100 filas de golpe dispara un trigger FOR EACH ROW 100 veces (una por fila) — pero un trigger FOR EACH STATEMENT solo una vez, sin acceso a filas individuales, útil para acciones que solo necesitan saber \"algo cambió\", no qué exactamente." }
  ]
}
```

## Ejercicios

1. Ejecuta el bloque de arriba y confirma que la tabla `auditoria` tiene un mensaje real, generado solo por el trigger, sin que ningún código lo escribiera directamente.
2. ¿Por qué un trigger que valida datos (por ejemplo, "el precio no puede ser negativo") tendría que ser `BEFORE`, no `AFTER`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "37. Triggers",
      "descripcion": "Capítulo completo de triggers en la documentación oficial de PostgreSQL.",
      "url": "https://www.postgresql.org/docs/current/triggers.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
