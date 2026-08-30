# BEGIN, COMMIT, ROLLBACK

- **Módulo:** Transacciones
- **Slug:** `begin-commit-rollback` (autogenerado del título)
- **Orden:** 370
- **Fuentes:** [Transaction](https://sqlite.org/lang_transaction.html) — ver `contenido/sql/TEMARIO.md` #37

---

## Qué es y para qué sirve

`BEGIN` abre una transacción, `COMMIT` la confirma de forma permanente, y `ROLLBACK` la **deshace por completo** — como si nunca hubiera pasado. Es el mecanismo real para corregir a tiempo antes de que un cambio quede definitivo.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Deshacer un cambio que no se llegó a confirmar",
  "esquemaSql": "CREATE TABLE cuentas (id INTEGER PRIMARY KEY, saldo REAL);\nINSERT INTO cuentas VALUES (1, 100);",
  "consulta": "BEGIN;\nUPDATE cuentas SET saldo = saldo - 1000 WHERE id = 1;\nROLLBACK;\nSELECT * FROM cuentas;",
  "anotaciones": [
    { "fragmento": "UPDATE cuentas SET saldo = saldo - 1000 WHERE id = 1;", "nota": "Este UPDATE se ejecuta dentro de la transacción — el saldo pasaría a -900, un valor que no debería existir nunca en un sistema real." },
    { "fragmento": "ROLLBACK;", "nota": "Deshace TODO lo que pasó desde el BEGIN — verificado ejecutándolo: el SELECT final muestra saldo = 100, como si el UPDATE nunca se hubiera escrito." }
  ]
}
```

## Cuándo se usa `ROLLBACK` de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Cuando el código de la aplicación detecta un problema a mitad de una operación.", "texto": "Por ejemplo: se resta dinero de una cuenta, y antes de sumarlo a la otra, una comprobación revela que la cuenta destino no existe — ROLLBACK deshace la resta ya hecha." },
    { "titulo": "SQLite también hace un ROLLBACK automático si una sentencia falla dentro de una transacción explícita, según su configuración.", "texto": "Es buena práctica no confiar en el comportamiento automático y decidir explícitamente cuándo hacer ROLLBACK desde el propio código de la aplicación." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir ROLLBACK con \"deshacer el último cambio\" solamente.", "texto": "ROLLBACK deshace TODO lo ocurrido desde el BEGIN, no solo la última sentencia — si hay tres UPDATE dentro de la transacción, los tres se deshacen juntos." },
    { "titulo": "Dejar una transacción abierta sin COMMIT ni ROLLBACK durante mucho tiempo.", "texto": "Una transacción abierta puede bloquear a otras conexiones que intenten escribir en las mismas tablas — cerrarla cuanto antes (confirmando o deshaciendo) es buena práctica." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Empieza una transacción, resta 200 al saldo (dejándolo negativo, algo que no debería pasar), deshazlo con ROLLBACK, y comprueba con un SELECT que el saldo sigue en 100.",
  "esquemaSql": "CREATE TABLE cuentas (id INTEGER PRIMARY KEY, saldo REAL);\nINSERT INTO cuentas VALUES (1, 100);",
  "consultaInicial": "",
  "consultaSolucion": "BEGIN; UPDATE cuentas SET saldo = saldo - 200 WHERE id = 1; ROLLBACK; SELECT * FROM cuentas;"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Transaction",
      "descripcion": "Referencia oficial de BEGIN, COMMIT y ROLLBACK en SQLite.",
      "url": "https://sqlite.org/lang_transaction.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
