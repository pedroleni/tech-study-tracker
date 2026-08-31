# Deadlocks: cómo ocurren y cómo Postgres los detecta

- **Módulo:** Concurrencia real: MVCC
- **Slug:** `deadlocks` (autogenerado del título)
- **Orden:** 310
- **Fuentes:** [13. Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html) — ver `contenido/postgresql/TEMARIO.md` #11

---

## Qué es y para qué sirve

Un **deadlock** (interbloqueo) ocurre cuando dos transacciones se bloquean mutuamente en un ciclo del que ninguna puede salir sola: la transacción A tiene bloqueada una fila que B necesita, y B tiene bloqueada una fila que A necesita — las dos esperando para siempre, salvo que algo externo intervenga.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Esta lección es conceptual — un deadlock necesita dos transacciones reales, en paralelo",
  "contenido": "Un deadlock, por definición, requiere DOS transacciones activas al mismo tiempo, cada una esperando a la otra — algo que este editor, con una única conexión por ejecución, no puede reproducir en vivo. El código de abajo es real (se ejecutaría tal cual contra un Postgres normal, en dos conexiones distintas), pero aquí se muestra como referencia, no como un bloque ejecutable."
}
```

## El escenario clásico, paso a paso

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n-- Conexión A                          -- Conexión B\nBEGIN;                                  BEGIN;\nUPDATE cuentas SET saldo = saldo - 100  UPDATE cuentas SET saldo = saldo - 50\n  WHERE id = 1;  -- bloquea fila 1        WHERE id = 2;  -- bloquea fila 2\n-- (A ya tiene la fila 1 bloqueada)      -- (B ya tiene la fila 2 bloqueada)\n</script>",
  "despues": "<script>\n-- Conexión A (sigue)                    -- Conexión B (sigue)\nUPDATE cuentas SET saldo = saldo + 100  UPDATE cuentas SET saldo = saldo + 50\n  WHERE id = 2;  -- espera a B...         WHERE id = 1;  -- espera a A...\n-- A espera la fila 2 (que tiene B)      -- B espera la fila 1 (que tiene A)\n-- ¡CICLO! Ninguna de las dos puede seguir sola.\n</script>",
  "nota": "Cada transacción ya tiene lo que la otra necesita, y necesita lo que la otra tiene — un ciclo cerrado. Sin ninguna intervención externa, las dos esperarían para siempre."
}
```

## Cómo lo resuelve Postgres de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Postgres detecta el ciclo automáticamente — no espera para siempre.", "texto": "Un proceso interno revisa periódicamente si existe un ciclo de espera real entre transacciones. En cuanto lo detecta, aborta UNA de las dos (la víctima) con un error real de deadlock, dejando a la otra continuar." },
    { "titulo": "La aplicación debe estar preparada para ese error y reintentar.", "texto": "Un deadlock no es un fallo del programador que lo sufre — es un riesgo estructural real de cualquier sistema con bloqueos y transacciones concurrentes. El código de aplicación que hace UPDATEs dentro de transacciones debería capturar ese error concreto y reintentar la transacción entera desde el principio." },
    { "titulo": "Se puede reducir el riesgo real: bloquear siempre en el mismo orden.", "texto": "Si TODAS las transacciones de tu aplicación bloquean las filas siempre en el mismo orden (por ejemplo, siempre por id ascendente), un ciclo como el de arriba no puede formarse — es la mitigación más efectiva, y no depende de que Postgres detecte nada." }
  ]
}
```

## Ejercicios

1. En el escenario de arriba, si ambas transacciones hubieran actualizado las cuentas en el MISMO orden (primero la 1, luego la 2, las dos), ¿se habría formado el ciclo?
2. ¿Por qué "simplemente esperar más tiempo" nunca sería una solución real para un deadlock genuino (a diferencia de una espera normal por un bloqueo, que sí termina cuando la otra transacción libera lo que bloqueaba)?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "13. Concurrency Control",
      "descripcion": "Capítulo completo de control de concurrencia, incluida la sección de deadlocks.",
      "url": "https://www.postgresql.org/docs/current/mvcc.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
