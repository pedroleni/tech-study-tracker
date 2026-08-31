# Caso real: por qué Supabase Realtime NO usa LISTEN/NOTIFY (y qué usa en su lugar)

- **Módulo:** Comunicación entre sesiones: LISTEN/NOTIFY
- **Slug:** `caso-real-por-que-supabase-realtime-no-usa-listen-notify-y-que-usa-en-su-lugar` (autogenerado del título)
- **Orden:** 560
- **Fuentes:** [Postgres Changes — Supabase Docs](https://supabase.com/docs/guides/realtime/postgres-changes) + [Realtime: Broadcast from Database — Supabase Blog](https://supabase.com/blog/realtime-broadcast-from-database) + [LISTEN](https://www.postgresql.org/docs/current/sql-listen.html)

---

## Qué es y para qué sirve

Sería fácil suponer que Supabase Realtime (la función que permite a un frontend recibir en vivo los cambios de una tabla) se apoya en `LISTEN`/`NOTIFY` — es justo el tipo de problema para el que existen. Pero no es así, y el motivo real es una limitación concreta de `NOTIFY` que ya puedes deducir de la lección anterior: es un mecanismo de "dispara y olvida", sin ninguna garantía de entrega.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Dos límites reales y documentados de NOTIFY que descartan su uso aquí",
  "contenido": "El payload de un NOTIFY tiene un límite duro de 8000 bytes — una fila completa de una tabla con varias columnas de texto puede superarlo sin esfuerzo. Y más importante: si el cliente que escucha se desconecta un instante (una recarga de página, una red inestable), cualquier NOTIFY enviado durante ese hueco se pierde para siempre — no hay forma de \"recuperar lo que me perdí\". Ninguna de las dos cosas es aceptable para una función que promete que el frontend refleje todos los cambios reales de la base de datos."
}
```

## Lo que sí usa: replicación lógica, leyendo directamente el WAL

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Postgres Changes lee el WAL (write-ahead log), no consultas NOTIFY.", "texto": "Realtime crea un slot de replicación lógica sobre tu base de datos — el mismo mecanismo de bajo nivel que usa Postgres para replicar a un servidor secundario — y decodifica los cambios (INSERT/UPDATE/DELETE) directamente del log de escritura, sin que ninguna tabla ni trigger tenga que \"avisar\" activamente." },
    { "titulo": "El WAL persiste hasta que se consume — por diseño, no hay huecos.", "texto": "A diferencia de NOTIFY, un slot de replicación lógica RETIENE los cambios acumulados si el consumidor se desconecta brevemente; al reconectar, los recibe todos, en orden, sin pérdidas — la garantía exacta que NOTIFY no puede ofrecer." },
    { "titulo": "\"Broadcast from Database\" (mensajes personalizados) usa el mismo mecanismo, no NOTIFY.", "texto": "Incluso la función más parecida a un pub/sub genérico (enviar un mensaje cualquiera desde un trigger) inserta en una tabla realtime.messages y la retransmite por el MISMO slot de replicación lógica — pg_notify() solo se usa internamente para un detalle secundario, reportar errores de logging, nunca para entregar el mensaje real." }
  ]
}
```

## Entonces, ¿para qué sirve LISTEN/NOTIFY en la práctica?

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Bueno para avisos que SÍ toleran perderse alguno",
  "contenido": "LISTEN/NOTIFY sigue siendo real y útil para casos donde perder un mensaje ocasional no rompe nada: invalidar una caché en memoria (\"algo cambió, vuelve a leer cuando puedas\"), avisar a un proceso en segundo plano de que hay trabajo nuevo que revisar, o un relé de \"tiempo real\" casero para una aplicación pequeña, sin las garantías de entrega que exige una plataforma como Supabase Realtime a escala. La pregunta que decide cuál usar es siempre la misma: si se pierde un mensaje, ¿pasa algo grave, o simplemente se refresca un poco tarde?"
}
```

## Ejercicios

1. Explica con tus propias palabras por qué un límite de 8000 bytes en el payload es un problema real para "avisar de un cambio en una fila", concretamente.
2. Si estuvieras diseñando una función interna de "notificar a un worker que hay un email pendiente de enviar", donde perder alguno ocasionalmente no es grave (hay un barrido periódico de respaldo), ¿usarías LISTEN/NOTIFY o replicación lógica? ¿Por qué la respuesta cambia frente al caso de Realtime?
3. Busca en la documentación de Supabase enlazada abajo qué evento de Postgres exactamente dispara el envío por WebSocket en Postgres Changes: ¿un trigger que tú defines, o algo que Realtime instala solo?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Postgres Changes — Supabase Docs",
      "descripcion": "Cómo Realtime usa un slot de replicación lógica para transmitir cambios de tablas por WebSocket.",
      "url": "https://supabase.com/docs/guides/realtime/postgres-changes",
      "etiqueta": "Supabase"
    },
    {
      "titulo": "Realtime: Broadcast from Database — Supabase Blog",
      "descripcion": "El anuncio oficial que detalla por qué Broadcast from Database también usa replicación lógica y no NOTIFY como mecanismo de entrega.",
      "url": "https://supabase.com/blog/realtime-broadcast-from-database",
      "etiqueta": "Supabase"
    },
    {
      "titulo": "LISTEN",
      "descripcion": "Referencia oficial de Postgres, para comparar con el mecanismo real que usa Supabase.",
      "url": "https://www.postgresql.org/docs/current/sql-listen.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
