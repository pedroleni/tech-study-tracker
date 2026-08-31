# LISTEN/NOTIFY: pub/sub real dentro de la propia base de datos

- **Módulo:** Comunicación entre sesiones: LISTEN/NOTIFY
- **Slug:** `listen-notify-pub-sub-real-dentro-de-la-propia-base-de-datos` (autogenerado del título)
- **Orden:** 550
- **Fuentes:** [LISTEN](https://www.postgresql.org/docs/current/sql-listen.html) + [NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html) — ver `contenido/postgresql/TEMARIO.md` #17

---

## Qué es y para qué sirve

Postgres trae un sistema de publicación/suscripción integrado, sin ninguna herramienta externa: una sesión se suscribe a un "canal" con `LISTEN`, y cualquier otra sesión (o la misma) puede publicar un mensaje en ese canal con `NOTIFY` — quien esté escuchando lo recibe. SQLite, al ser un fichero sin sesiones ni conexiones concurrentes reales, no tiene ni puede tener nada parecido.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "LISTEN registra la suscripción — y es consultable con SQL normal",
  "esquemaSql": "LISTEN eventos_ventas;",
  "consulta": "SELECT pg_listening_channels()",
  "anotaciones": [
    { "fragmento": "LISTEN eventos_ventas;", "nota": "A partir de aquí, esta sesión concreta queda suscrita al canal eventos_ventas — cualquier NOTIFY sobre ese canal, desde cualquier sesión, le llegaría." },
    { "fragmento": "pg_listening_channels()", "nota": "Una función real que devuelve los canales a los que la sesión ACTUAL está suscrita — útil para comprobar el estado de la suscripción sin depender de recordarlo aparte." }
  ]
}
```

## `NOTIFY` es \"dispara y olvida\": no falla aunque nadie escuche

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "pg_notify(), UNLISTEN, y varios canales a la vez",
  "esquemaSql": "LISTEN canal_a;\nLISTEN canal_b;\nSELECT pg_notify('canal_a', 'primer mensaje');\nUNLISTEN canal_a;",
  "consulta": "SELECT pg_listening_channels()",
  "anotaciones": [
    { "fragmento": "SELECT pg_notify('canal_a', 'primer mensaje');", "nota": "pg_notify(canal, payload) es la forma de función de NOTIFY canal, 'payload' — hace exactamente lo mismo, útil cuando el nombre del canal o el mensaje se arman dinámicamente en vez de escribirse literal." },
    { "fragmento": "UNLISTEN canal_a;", "nota": "Cancela la suscripción a un canal concreto — UNLISTEN * (sin nombrar ninguno) cancelaría todas de golpe." },
    { "fragmento": "SELECT pg_listening_channels()", "nota": "Tras el UNLISTEN, solo queda canal_b en la lista — canal_a se suscribió, se usó, y se dio de baja, todo en la misma sesión." }
  ]
}
```

## El límite real de este mecanismo aquí: el mensaje no llega como resultado de una consulta

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "NOTIFY no entrega el mensaje en ningún SELECT — llega por fuera, de forma asíncrona",
  "contenido": "Ni siquiera en Postgres real hay una tabla que puedas consultar con SELECT para \"ver los mensajes pendientes\" — recibir exige mantener la conexión abierta y registrar un callback, fuera de las consultas normales. PGlite (el motor de este laboratorio) lo soporta aparte: expone db.listen(canal, callback), un método JavaScript distinto de exec()/query(), cuyo callback sí recibe el payload real. Es el mismo patrón que node-postgres o psycopg2 — por eso este bloque solo puede demostrar la suscripción y el envío, no la recepción."
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que `pg_listening_channels()` devuelve `eventos_ventas`.
2. Ejecuta el segundo bloque y confirma que, tras el `UNLISTEN`, solo queda `canal_b` en la lista.
3. Si dos sesiones distintas hacen `LISTEN mismo_canal;` cada una, y una tercera sesión (sin escuchar nada) ejecuta `NOTIFY mismo_canal, 'hola'`, ¿cuántas de las tres reciben el mensaje?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "LISTEN",
      "descripcion": "Referencia oficial de LISTEN: cómo funciona la suscripción a un canal.",
      "url": "https://www.postgresql.org/docs/current/sql-listen.html",
      "etiqueta": "PostgreSQL"
    },
    {
      "titulo": "NOTIFY",
      "descripcion": "Referencia oficial de NOTIFY, incluido el límite de tamaño del payload y su comportamiento transaccional.",
      "url": "https://www.postgresql.org/docs/current/sql-notify.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
