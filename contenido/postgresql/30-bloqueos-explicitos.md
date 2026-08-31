# Bloqueos explícitos: FOR UPDATE, FOR SHARE

- **Módulo:** Concurrencia real: MVCC
- **Slug:** `bloqueos-explicitos` (autogenerado del título)
- **Orden:** 300
- **Fuentes:** [13. Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html) — ver `contenido/postgresql/TEMARIO.md` #11

---

## Qué es y para qué sirve

MVCC (lección anterior de este módulo) resuelve la mayoría de la concurrencia sin bloqueos — pero a veces sí hace falta bloquear una fila explícitamente: "quiero leer esta fila y estar seguro de que nadie más la modifica hasta que yo termine". `SELECT ... FOR UPDATE` hace exactamente eso.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Reservar una fila para modificarla, sin que otra transacción se cuele",
  "esquemaSql": "CREATE TABLE cuentas (id serial primary key, titular text, saldo numeric);\nINSERT INTO cuentas (titular, saldo) VALUES ('Ana', 1000), ('Roberto', 500);",
  "consulta": "SELECT id, titular, saldo FROM cuentas WHERE id = 1 FOR UPDATE",
  "anotaciones": [
    { "fragmento": "FOR UPDATE", "nota": "Bloquea la fila seleccionada — cualquier otra transacción que intente un FOR UPDATE, UPDATE o DELETE sobre esta misma fila tendría que ESPERAR a que la transacción actual termine (COMMIT o ROLLBACK), en vez de proceder de inmediato." }
  ]
}
```

## `FOR UPDATE` frente a `FOR SHARE`

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "FOR UPDATE: bloqueo exclusivo, pensado para modificar.", "texto": "El caso típico: leer el saldo de una cuenta antes de restarle una cantidad, garantizando que nadie más lo lea con intención de modificarlo también mientras tanto — el patrón real detrás de una transferencia bancaria segura." },
    { "titulo": "FOR SHARE: bloqueo compartido, pensado solo para leer con garantías.", "texto": "Varias transacciones pueden tener un FOR SHARE sobre la misma fila a la vez (todas solo quieren leerla sin que cambie) — pero ninguna puede obtener un FOR UPDATE mientras haya un FOR SHARE activo de otra." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Límite real de este entorno: el bloqueo en sí no se puede DEMOSTRAR sin una segunda conexión",
  "contenido": "El SELECT ... FOR UPDATE de arriba se ejecuta perfectamente aquí (adquiere el bloqueo dentro de su propia transacción implícita), pero ver a una SEGUNDA transacción esperando de verdad a que la primera libere el bloqueo necesita dos conexiones simultáneas — algo que este editor, con una única conexión por ejecución, no puede reproducir en vivo."
}
```

## Ejercicios

1. Ejecuta el bloque de arriba y confirma que devuelve el saldo real de Ana (1000) sin ningún error — el bloqueo no impide leer dentro de la MISMA transacción que lo adquirió.
2. En una transferencia bancaria real (restar de una cuenta, sumar a otra), ¿por qué tendría sentido usar `FOR UPDATE` al leer el saldo de origen antes de calcular la resta?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "13. Concurrency Control",
      "descripcion": "Capítulo completo de control de concurrencia, incluidos los bloqueos explícitos de fila.",
      "url": "https://www.postgresql.org/docs/current/mvcc.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
