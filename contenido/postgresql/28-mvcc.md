# MVCC: cómo Postgres deja leer y escribir a la vez sin bloquearse

- **Módulo:** Concurrencia real: MVCC
- **Slug:** `mvcc` (autogenerado del título)
- **Orden:** 280
- **Fuentes:** [13. Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html) — ver `contenido/postgresql/TEMARIO.md` #11

---

## Qué es y para qué sirve

**MVCC** (*Multiversion Concurrency Control*) es la técnica que usa Postgres para que las lecturas nunca bloqueen a las escrituras, ni al revés: en vez de bloquear una fila mientras alguien la lee, Postgres guarda VARIAS versiones de cada fila a la vez, y cada transacción ve la versión que le corresponde según cuándo empezó. Es lo que hace posible que, con cientos de conexiones simultáneas, unas puedan seguir leyendo mientras otras escriben, sin turnos ni colas.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Las columnas de sistema que hacen posible MVCC, visibles de verdad",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, nombre text, precio numeric);\nINSERT INTO productos (nombre, precio) VALUES ('Teclado', 45.99);\nUPDATE productos SET precio = 39.99 WHERE id = 1;",
  "consulta": "SELECT id, nombre, precio, xmin, xmax FROM productos",
  "anotaciones": [
    { "fragmento": "xmin", "nota": "El id de la transacción que CREÓ esta versión de la fila — cada UPDATE en Postgres no modifica la fila en el sitio: crea una versión NUEVA con un xmin nuevo, y marca la vieja como obsoleta. Es la base real de MVCC, normalmente invisible, pero está ahí en cada fila." },
    { "fragmento": "xmax", "nota": "El id de la transacción que INVALIDÓ esta versión (o 0 si sigue siendo la versión vigente). Las versiones viejas no se borran al momento — el próximo módulo de este temario (VACUUM) explica qué las limpia de verdad." }
  ]
}
```

## Por qué esto importa de verdad (aunque no lo veas nunca directamente)

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Un SELECT nunca espera a un UPDATE en curso, ni viceversa",
  "contenido": "Con un motor que bloquea filas para leerlas, una consulta larga de solo lectura podría hacer esperar a una escritura real (o al revés) — un cuello de botella real en cualquier aplicación con tráfico. MVCC evita esa espera: cada transacción trabaja sobre su propia \"foto\" consistente de los datos, sin pisar a las demás."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Límite real de este entorno: no hay dos conexiones a la vez",
  "contenido": "MVCC se nota de verdad cuando DOS transacciones distintas leen y escriben al mismo tiempo — algo que este editor, con una única conexión por ejecución, no puede demostrar en vivo. Lo que sí acabas de ver es la base mecánica real (xmin/xmax) que hace posible ese comportamiento — el resto de este módulo describe el comportamiento resultante con ejemplos conceptuales, no ejecutables."
}
```

## Ejercicios

1. Ejecuta el bloque de arriba: el `UPDATE` cambió el precio — ¿el `xmin` que ves corresponde a la transacción del `INSERT` o a la del `UPDATE`?
2. En tus propias palabras: ¿por qué "cada UPDATE crea una fila nueva en vez de modificar la existente" tiene un coste real en espacio de disco, que alguien tiene que limpiar tarde o temprano?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "13. Concurrency Control",
      "descripcion": "Capítulo completo de MVCC en la documentación oficial de PostgreSQL.",
      "url": "https://www.postgresql.org/docs/current/mvcc.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
