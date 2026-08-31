# Niveles de aislamiento de transacción

- **Módulo:** Concurrencia real: MVCC
- **Slug:** `niveles-de-aislamiento` (autogenerado del título)
- **Orden:** 290
- **Fuentes:** [13. Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html) — ver `contenido/postgresql/TEMARIO.md` #11

---

## Qué es y para qué sirve

El **nivel de aislamiento** de una transacción decide cuánto puede "ver" de los cambios que otras transacciones concurrentes van haciendo mientras ella todavía está en curso. Postgres soporta los cuatro niveles del estándar SQL, aunque implementa dos de ellos (*Read Uncommitted* y *Read Committed*) de forma idéntica — nunca permite leer datos no confirmados (*dirty reads*), a diferencia de otros motores.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Fijar y comprobar el nivel de aislamiento real de esta sesión",
  "esquemaSql": "SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL SERIALIZABLE;",
  "consulta": "SHOW transaction_isolation",
  "anotaciones": [
    { "fragmento": "SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL SERIALIZABLE;", "nota": "SET TRANSACTION ISOLATION LEVEL a secas solo afectaría a la transacción ACTUAL (termina en cuanto esa transacción acaba) — SET SESSION CHARACTERISTICS fija el nivel por defecto para TODAS las transacciones que arranquen después, en esta misma sesión, que es lo que hace falta para que el SHOW de abajo lo confirme." },
    { "fragmento": "SHOW transaction_isolation", "nota": "Confirma, con un valor real leído del propio servidor, que el nivel se aplicó — nunca asumas que un SET funcionó sin comprobarlo." }
  ]
}
```

## Los cuatro niveles, de más permisivo a más estricto

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Read Committed (el nivel por defecto de Postgres).", "texto": "Cada sentencia dentro de la transacción ve los datos confirmados hasta ESE momento — si otra transacción confirma un cambio a mitad de la tuya, tu siguiente SELECT ya lo verá. El equilibrio real entre seguridad y rendimiento que casi todas las aplicaciones usan sin pensarlo." },
    { "titulo": "Repeatable Read.", "texto": "Toda la transacción ve una única \"foto\" fija de los datos, tomada al empezar — aunque otra transacción confirme cambios mientras tanto, tú no los ves hasta que tu propia transacción termine." },
    { "titulo": "Serializable.", "texto": "El nivel más estricto: garantiza que el resultado final es EQUIVALENTE a si todas las transacciones se hubieran ejecutado una detrás de otra, nunca en paralelo — a costa de que Postgres pueda rechazar (con un error real) una transacción si detecta que ese orden no se puede garantizar." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Límite real de este entorno: la diferencia de COMPORTAMIENTO necesita dos transacciones a la vez",
  "contenido": "Puedes fijar y comprobar el nivel (como arriba), pero ver la diferencia REAL entre Read Committed y Repeatable Read — que una lectura repetida dentro de la misma transacción cambie o no según lo que otra transacción concurrente confirme mientras tanto — necesita dos conexiones simultáneas, algo que este editor no puede demostrar en vivo con una única conexión por ejecución."
}
```

## Ejercicios

1. Ejecuta el bloque de arriba y confirma el valor real que devuelve `SHOW transaction_isolation`.
2. Si el `esquemaSql` de arriba dijera `REPEATABLE READ` en vez de `SERIALIZABLE`, ¿qué valor exacto esperarías que confirmara `SHOW transaction_isolation`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "13. Concurrency Control",
      "descripcion": "Capítulo completo de niveles de aislamiento en la documentación oficial.",
      "url": "https://www.postgresql.org/docs/current/mvcc.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
