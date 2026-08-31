# Alta disponibilidad y replicación: panorama conceptual

- **Módulo:** Carga masiva y operación
- **Slug:** `alta-disponibilidad-y-replicacion-panorama-conceptual` (autogenerado del título)
- **Orden:** 590
- **Fuentes:** [26. High Availability, Load Balancing, and Replication](https://www.postgresql.org/docs/current/high-availability.html) + [29. Logical Replication](https://www.postgresql.org/docs/current/logical-replication.html) — ver `contenido/postgresql/TEMARIO.md` #18

---

## Qué es y para qué sirve

Un solo servidor Postgres es un punto único de fallo: si se cae, la aplicación entera se cae con él. **Replicación** significa mantener una o más copias adicionales, actualizadas en tiempo real — y Postgres soporta dos formas, con propósitos distintos: **física** (streaming replication, copia byte a byte del WAL) y **lógica** (replica cambios de filas decodificados, selectivamente). Ya conoces el WAL de los módulos de particionado y RLS — aquí es donde su otro propósito real entra en juego.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "CREATE PUBLICATION: la mitad \"origen\" de la replicación lógica, real",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, nombre text);\nCREATE PUBLICATION productos_pub FOR TABLE productos;",
  "consulta": "SELECT pubname, puballtables FROM pg_publication",
  "anotaciones": [
    { "fragmento": "CREATE PUBLICATION productos_pub FOR TABLE productos;", "nota": "Una publicación declara QUÉ tablas está dispuesto este servidor a replicar hacia fuera — el mismo mecanismo, a nivel de SQL normal, que usa internamente Realtime de Supabase (visto en el módulo anterior) para decidir qué cambios transmitir." },
    { "fragmento": "SELECT pubname, puballtables FROM pg_publication", "nota": "La publicación es un objeto real, consultable — pero le falta su otra mitad: CREATE SUBSCRIPTION en OTRO servidor Postgres, apuntando a este, es quien realmente empieza a recibir los cambios. Esa segunda mitad necesita una conexión de red a un servidor real, algo que este laboratorio de un solo navegador no puede ofrecer." }
  ]
}
```

## Cómo un servidor sabe si es el primario o una réplica

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "pg_is_in_recovery(): la pregunta que hace cualquier balanceador de carga real",
  "esquemaSql": "SELECT 1",
  "consulta": "SELECT pg_is_in_recovery() AS es_una_replica_en_espera",
  "anotaciones": [
    { "fragmento": "pg_is_in_recovery()", "nota": "En un servidor primario (como este, siempre) devuelve false. En un standby físico real — un servidor que solo está reproduciendo el WAL que le llega del primario — devuelve true. Un balanceador de carga real consulta exactamente esta función para decidir a qué servidor mandar una escritura (siempre al primario) y a cuáles puede mandar lecturas (cualquier réplica)." }
  ]
}
```

## Física frente a lógica: cuándo usar cada una

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Física: copia exacta, byte a byte, de TODA la base de datos.", "texto": "Un standby físico reproduce el WAL tal cual — no puede replicar \"solo una tabla\", y exige la misma versión mayor de Postgres en ambos lados. Es la base de la alta disponibilidad real: si el primario cae, un standby físico se puede promover a primario en segundos." },
    { "titulo": "Lógica: selectiva, y entre versiones distintas.", "texto": "Una publicación puede cubrir una sola tabla (como en el bloque de arriba); el suscriptor puede incluso correr una versión de Postgres distinta a la del origen — la base real de una migración con downtime casi cero: replicar en caliente hacia el servidor nuevo, y solo entonces cambiar el tráfico." },
    { "titulo": "Réplicas de lectura: el otro beneficio real de la física.", "texto": "Además de la alta disponibilidad, un standby físico puede atender consultas de SOLO LECTURA mientras se mantiene al día — repartir la carga de lectura entre varios servidores sin tocar nada del primario, que sigue siendo el único que acepta escrituras." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que `productos_pub` aparece en `pg_publication`.
2. Ejecuta el segundo bloque — ¿por qué el resultado tiene sentido, dado que este laboratorio siempre crea un servidor Postgres nuevo y aislado?
3. Si tu aplicación tiene un 95% de tráfico de lectura y un 5% de escritura, ¿qué tipo de replicación usarías para repartir esa carga entre varios servidores? ¿Y si en cambio necesitaras migrar de Postgres 14 a Postgres 17 sin apagar la aplicación?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "26. High Availability, Load Balancing, and Replication",
      "descripcion": "Capítulo oficial completo sobre alta disponibilidad, replicación física (streaming) y balanceo de carga.",
      "url": "https://www.postgresql.org/docs/current/high-availability.html",
      "etiqueta": "PostgreSQL"
    },
    {
      "titulo": "29. Logical Replication",
      "descripcion": "Capítulo oficial de replicación lógica: publicaciones, suscripciones, y sus casos de uso reales.",
      "url": "https://www.postgresql.org/docs/current/logical-replication.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
