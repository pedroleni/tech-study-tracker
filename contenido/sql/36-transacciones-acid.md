# Qué es una transacción y las propiedades ACID

- **Módulo:** Transacciones
- **Slug:** `transacciones-acid` (autogenerado del título)
- **Orden:** 360
- **Fuentes:** [Transaction](https://sqlite.org/lang_transaction.html) — ver `contenido/sql/TEMARIO.md` #36

---

## Qué es y para qué sirve

Una transacción agrupa varias sentencias SQL para que se apliquen **todas juntas, o ninguna** — un requisito real cuando una operación de negocio necesita más de un cambio a la vez, como una transferencia bancaria.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Una transferencia real: dos UPDATE que deben ir juntos",
  "esquemaSql": "CREATE TABLE cuentas (id INTEGER PRIMARY KEY, titular TEXT, saldo REAL);\nINSERT INTO cuentas VALUES (1, 'Ana', 100), (2, 'Luis', 50);",
  "consulta": "BEGIN;\nUPDATE cuentas SET saldo = saldo - 30 WHERE id = 1;\nUPDATE cuentas SET saldo = saldo + 30 WHERE id = 2;\nCOMMIT;\nSELECT * FROM cuentas;",
  "anotaciones": [
    { "fragmento": "BEGIN;", "nota": "Empieza la transacción — a partir de aquí, los cambios no son definitivos hasta un COMMIT." },
    { "fragmento": "UPDATE cuentas SET saldo = saldo - 30 WHERE id = 1;\nUPDATE cuentas SET saldo = saldo + 30 WHERE id = 2;", "nota": "Los dos UPDATE tienen que aplicarse juntos — si solo se restara a Ana sin sumarle a Luis, el dinero desaparecería del sistema sin más." },
    { "fragmento": "COMMIT;", "nota": "Confirma la transacción entera — verificado ejecutándolo: Ana queda en 70, Luis en 80. Sin este COMMIT, ninguno de los dos cambios sería permanente." }
  ]
}
```

## Las cuatro garantías de ACID

```laboratorio
{
  "tipo": "roles",
  "titulo": "El acrónimo que resume qué promete una transacción",
  "roles": [
    { "etiqueta": "Atomicidad", "rol": "Todo o nada", "descripcion": "Si algo falla a mitad de la transacción, se deshace ENTERA — nunca queda a medias." },
    { "etiqueta": "Consistencia", "rol": "Las reglas del esquema se respetan siempre", "descripcion": "Una transacción nunca deja la base de datos en un estado que viole un CHECK o una clave foránea activa." },
    { "etiqueta": "Aislamiento", "rol": "Una transacción no ve los cambios a medias de otra", "descripcion": "Mientras una transacción está en curso, otra conexión no ve sus cambios hasta que se confirme con COMMIT." },
    { "etiqueta": "Durabilidad", "rol": "Lo confirmado sobrevive incluso a un fallo del sistema", "descripcion": "Una vez hecho COMMIT, el cambio persiste aunque el proceso se cierre inmediatamente después." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Ejecutar varias sentencias relacionadas sin una transacción explícita.", "texto": "Sin BEGIN/COMMIT, cada sentencia individual se confirma por su cuenta — si la segunda falla, la primera ya se aplicó, y el sistema queda en un estado a medias." },
    { "titulo": "Olvidar el COMMIT al final de una transacción.", "texto": "Sin COMMIT, los cambios quedan pendientes — dependiendo de cómo se cierre la conexión, podrían perderse por completo." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Transfiere 20 de la cuenta de Luis (id 2) a la de Ana (id 1), dentro de una transacción con BEGIN/COMMIT, y comprueba el resultado con un SELECT.",
  "esquemaSql": "CREATE TABLE cuentas (id INTEGER PRIMARY KEY, titular TEXT, saldo REAL);\nINSERT INTO cuentas VALUES (1, 'Ana', 100), (2, 'Luis', 50);",
  "consultaInicial": "",
  "consultaSolucion": "BEGIN; UPDATE cuentas SET saldo = saldo + 20 WHERE id = 1; UPDATE cuentas SET saldo = saldo - 20 WHERE id = 2; COMMIT; SELECT * FROM cuentas;"
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
      "descripcion": "Referencia oficial de las transacciones en SQLite.",
      "url": "https://sqlite.org/lang_transaction.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
