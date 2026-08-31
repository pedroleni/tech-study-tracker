# Caso real: un updated_at automático

- **Módulo:** Triggers
- **Slug:** `caso-real-updated-at` (autogenerado del título)
- **Orden:** 390
- **Fuentes:** [37. Triggers](https://www.postgresql.org/docs/current/triggers.html) — ver `contenido/postgresql/TEMARIO.md` #14

---

## Qué es y para qué sirve

El caso de trigger más común en aplicaciones reales, sin excepción: mantener una columna `updated_at` siempre al día, automáticamente, en cada `UPDATE` — sin depender de que cada parte del código que actualiza una fila se acuerde de fijarla a mano. Es, de hecho, exactamente el mismo patrón que ya usan las propias migraciones de este proyecto (tech-study-tracker).

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "El patrón real de updated_at automático",
  "esquemaSql": "CREATE TABLE tareas (id serial primary key, titulo text, updated_at timestamptz default now());\nINSERT INTO tareas (titulo) VALUES ('Revisar informe');\nCREATE FUNCTION set_updated_at() RETURNS trigger AS $$\nBEGIN\n  NEW.updated_at = now();\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\nCREATE TRIGGER trg_tareas_updated_at\n  BEFORE UPDATE ON tareas\n  FOR EACH ROW\n  EXECUTE FUNCTION set_updated_at();",
  "consulta": "UPDATE tareas SET titulo = 'Revisar informe (urgente)' WHERE id = 1 RETURNING titulo, updated_at",
  "anotaciones": [
    { "fragmento": "BEFORE UPDATE ON tareas", "nota": "BEFORE, no AFTER — el trigger necesita modificar NEW.updated_at ANTES de que la fila se escriba de verdad, para que el nuevo valor forme parte del propio UPDATE, no de uno adicional." },
    { "fragmento": "NEW.updated_at = now();", "nota": "Modifica directamente la fila que está a punto de guardarse — el UPDATE original solo cambió titulo, pero el trigger añade el updated_at real sin que quien escribió ese UPDATE tuviera que acordarse de incluirlo." },
    { "fragmento": "RETURNING titulo, updated_at", "nota": "Confirma en el propio resultado que updated_at cambió de verdad, aunque el UPDATE original nunca lo mencionó." }
  ]
}
```

## Por qué esto es mejor que confiar en la aplicación

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Ninguna ruta de escritura puede olvidarse de actualizarlo",
  "contenido": "Si updated_at dependiera de que cada UPDATE en cada parte del código de la aplicación lo fijara a mano, bastaría con UN solo sitio que se olvidara para que esa columna mintiera. Con el trigger, es literalmente imposible hacer un UPDATE sobre la tabla sin que updated_at se actualice — la garantía vive en la base de datos, no en la disciplina de quien escribe la aplicación."
}
```

## Ejercicios

1. Ejecuta el bloque de arriba y confirma que `updated_at` cambió a un valor real y reciente, aunque el `UPDATE` solo mencionó `titulo`.
2. ¿Por qué este mismo patrón (un trigger `BEFORE UPDATE` genérico) se puede reutilizar en CUALQUIER tabla que tenga una columna `updated_at`, sin reescribir la función cada vez?

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
