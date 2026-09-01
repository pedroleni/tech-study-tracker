# Proyecto avanzado: auditoría automática con triggers y particionado

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-auditoria-automatica-con-triggers-y-particionado` (autogenerado del título)
- **Orden:** 640
- **Repositorio:** [github.com/pedroleni/postgresql-proyectos-avanzados](https://github.com/pedroleni/postgresql-proyectos-avanzados) (carpeta `auditoria-particionada`)
- **Requiere:** Módulo 11 (Triggers) y Módulo 15 (Particionado de tablas) de este mismo temario

---

## Qué vas a construir

Un sistema de auditoría que registra automáticamente cada `INSERT`/`UPDATE`/`DELETE` sobre una tabla `productos`, vía trigger — sin que el código de la aplicación sepa que la auditoría existe — guardando cada cambio como JSONB en una tabla `auditoria` particionada por mes, contra un Postgres real.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/postgresql-proyectos-avanzados (carpeta auditoria-particionada) — rama main con el esquema particionado, los índices y toda la aplicación completos; solo fn_auditar_cambio() en migrations/003_trigger_auditoria.sql está recortada. Rama solucion con el trigger completo."
}
```

## El punto de partida: un trigger que no registra nada

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nCREATE FUNCTION fn_auditar_cambio()\nRETURNS trigger AS $funcion$\nBEGIN\n  -- TODO: falta el INSERT INTO auditoria en cada rama\n  IF TG_OP = 'INSERT' THEN\n    RETURN NEW;\n  ELSIF TG_OP = 'UPDATE' THEN\n    RETURN NEW;\n  ELSIF TG_OP = 'DELETE' THEN\n    RETURN OLD;\n  END IF;\n  RAISE EXCEPTION 'Operacion no soportada: %', TG_OP;\nEND;\n$funcion$ LANGUAGE plpgsql;\n</script>",
  "anotaciones": [
    { "fragmento": "-- TODO: falta el INSERT INTO auditoria en cada rama", "nota": "El trigger SÍ se dispara en cada cambio (por eso RETURN NEW/OLD sigue ahí, para no romper el INSERT/UPDATE/DELETE original) — pero no escribe nada en auditoria. Los productos se crean/editan/borran con normalidad; solo falta el rastro." },
    { "fragmento": "RETURN OLD;", "nota": "En un trigger AFTER (el caso de este proyecto) Postgres ignora el valor devuelto — pero devolver NEW/OLD sigue siendo la convención correcta, la misma que ya viste en el módulo 11, y evita sorpresas si algún día el trigger pasara a BEFORE." }
  ]
}
```

## La pieza que ya está resuelta: crear particiones futuras bajo demanda

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nexport async function crearParticionParaMes(pool, fecha) {\n  const { inicio, fin, nombre } = limitesUtcDelMes(fecha);\n  await pool.query(\n    `CREATE TABLE IF NOT EXISTS ${nombre}\n       PARTITION OF auditoria\n       FOR VALUES FROM ('${inicio.toISOString()}') TO ('${fin.toISOString()}')`,\n  );\n  return nombre;\n}\n</script>",
  "anotaciones": [
    { "fragmento": "CREATE TABLE IF NOT EXISTS ${nombre}\n       PARTITION OF auditoria", "nota": "Exactamente el mismo comando que ya ejecutaste a mano en el módulo 15 — aquí, calculado dinámicamente a partir de cualquier fecha, para que la auditoría nunca se quede sin partición donde caer, aunque pase un año sin desplegar una migración nueva." }
  ]
}
```

## Pruébalo tú, de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Levanta Postgres y aplica las migraciones.", "texto": "Clona postgresql-proyectos-avanzados, entra en auditoria-particionada/ y ejecuta docker compose up -d, npm install, npm run migrate — crea productos, auditoria particionada (mes anterior/actual/siguiente ya creados) y el trigger." },
    { "titulo": "Ejecuta los tests tal cual — 4 de 5 deben fallar.", "texto": "Los tests que esperan filas de auditoría fallan (array vacío); el test de crearParticionParaMes para un mes futuro pasa igual, porque no depende del trigger." },
    { "titulo": "Completa el INSERT en las tres ramas y confirma los 5.", "texto": "Usa TG_TABLE_NAME, TG_OP, to_jsonb(NEW)/to_jsonb(OLD) tal como viste en el módulo 11, aplica sobre una base limpia y vuelve a correr npm test." }
  ]
}
```

## Un gotcha real de este proyecto

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "La clave primaria de auditoria no es solo id",
  "contenido": "PRIMARY KEY (id, ocurrido_en) — no PRIMARY KEY (id) a secas. Una tabla particionada por RANGE exige que la clave de partición forme parte de cualquier índice único (incluida la primary key), porque Postgres no puede garantizar unicidad global consultando cada partición por separado sin ese requisito. Es una limitación real, documentada, no un capricho de este proyecto."
}
```

## Retos para ampliarlo

1. Añade una función `borrarParticionesAnterioresA(pool, fecha)` que haga `DROP TABLE` de las particiones más viejas que cierta fecha — la operación instantánea de "borrado masivo" que viste en el módulo 15, aplicada de verdad.
2. Extiende `fn_auditar_cambio()` para capturar también quién hizo el cambio, añadiendo una columna `realizado_por` que lea `current_user` dentro del trigger.
3. Combínalo con el proyecto de reservas multi-tenant (lección 62): audita también la tabla `reservas`, y confirma que la auditoría respeta igualmente el aislamiento por organización si consultas como `app_user`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "postgresql-proyectos-avanzados/auditoria-particionada (rama main — punto de partida)",
      "descripcion": "Clona el repo entero y entra en auditoria-particionada/ para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/postgresql-proyectos-avanzados/tree/main/auditoria-particionada",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "postgresql-proyectos-avanzados/auditoria-particionada (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/postgresql-proyectos-avanzados/tree/solucion/auditoria-particionada",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "5.12. Table Partitioning",
      "descripcion": "Referencia oficial de Postgres sobre particionado declarativo, ya usada en el módulo 15 de este track.",
      "url": "https://www.postgresql.org/docs/current/ddl-partitioning.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
