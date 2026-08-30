# Por qué una transacción falla a medias (y qué se deshace)

- **Módulo:** Transacciones
- **Slug:** `savepoint` (autogenerado del título)
- **Orden:** 380
- **Fuentes:** [Transaction](https://sqlite.org/lang_transaction.html) + [SAVEPOINT](https://sqlite.org/lang_savepoint.html) — ver `contenido/sql/TEMARIO.md` #38

---

## Qué es y para qué sirve

Un `SAVEPOINT` marca un punto intermedio dentro de una transacción — permite deshacer **solo una parte** de lo que ha pasado, sin perder los cambios anteriores al punto marcado.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Deshacer un cambio concreto, conservando el anterior",
  "esquemaSql": "CREATE TABLE cuentas (id INTEGER PRIMARY KEY, saldo REAL);\nINSERT INTO cuentas VALUES (1, 100);",
  "consulta": "BEGIN;\nUPDATE cuentas SET saldo = saldo - 10 WHERE id = 1;\nSAVEPOINT antes_de_bono;\nUPDATE cuentas SET saldo = saldo + 1000 WHERE id = 1;\nROLLBACK TO antes_de_bono;\nCOMMIT;\nSELECT * FROM cuentas;",
  "anotaciones": [
    { "fragmento": "SAVEPOINT antes_de_bono;", "nota": "Marca un punto con nombre dentro de la transacción — todo lo que pase DESPUÉS se puede deshacer sin tocar lo de antes." },
    { "fragmento": "ROLLBACK TO antes_de_bono;", "nota": "Deshace solo el +1000 (el bono, aplicado por error) — verificado ejecutándolo: el saldo queda en 90, no en 100 (se conserva el -10 anterior al SAVEPOINT) ni en 1090 (se descarta el bono)." }
  ]
}
```

## `ROLLBACK` frente a `ROLLBACK TO savepoint`

```laboratorio
{
  "tipo": "roles",
  "titulo": "Uno deshace todo, el otro deshace desde un punto concreto",
  "roles": [
    { "etiqueta": "ROLLBACK", "rol": "Deshace la transacción entera", "descripcion": "Vuelve al estado de antes del BEGIN — nada de lo ocurrido dentro sobrevive." },
    { "etiqueta": "ROLLBACK TO nombre", "rol": "Deshace solo hasta ese SAVEPOINT", "descripcion": "La transacción sigue abierta después — se puede seguir operando, o hacer COMMIT normalmente." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar que ROLLBACK TO no cierra la transacción por sí solo.", "texto": "Después de un ROLLBACK TO, sigue haciendo falta un COMMIT (o un ROLLBACK completo) para terminar la transacción — el ROLLBACK TO solo deshace una parte, no la cierra." },
    { "titulo": "Usar nombres de SAVEPOINT poco descriptivos en transacciones largas y complejas.", "texto": "Con varios SAVEPOINT anidados, un nombre como antes_de_bono es mucho más fácil de seguir que sp1, sp2 — sobre todo si la transacción crece con el tiempo." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Dentro de una transacción: resta 5 al saldo, crea un SAVEPOINT llamado punto1, resta 200 más (un error), deshaz solo ese último cambio con ROLLBACK TO punto1, y haz COMMIT. Comprueba el resultado con un SELECT.",
  "esquemaSql": "CREATE TABLE cuentas (id INTEGER PRIMARY KEY, saldo REAL);\nINSERT INTO cuentas VALUES (1, 100);",
  "consultaInicial": "",
  "consultaSolucion": "BEGIN; UPDATE cuentas SET saldo = saldo - 5 WHERE id = 1; SAVEPOINT punto1; UPDATE cuentas SET saldo = saldo - 200 WHERE id = 1; ROLLBACK TO punto1; COMMIT; SELECT * FROM cuentas;"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "SAVEPOINT",
      "descripcion": "Referencia oficial completa de SAVEPOINT y RELEASE.",
      "url": "https://sqlite.org/lang_savepoint.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
