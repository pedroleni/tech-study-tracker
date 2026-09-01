# `push --force` ajeno: cuando alguien reescribe una historia que ya tenías

- **Módulo:** Trabajo en equipo: casos reales
- **Slug:** `push-force-ajeno-cuando-alguien-reescribe-una-historia-que-ya-tenias` (autogenerado del título)
- **Orden:** 450
- **Fuentes:** [git-push](https://git-scm.com/docs/git-push) — ver `contenido/git/TEMARIO.md` #45

---

## El rechazo de la lección anterior, forzado a pasar igualmente

`--force` le dice a `push` "sobrescribe el remoto igualmente, aunque mi rama no contenga sus commits". Es exactamente el mecanismo de seguridad de la lección anterior, saltado a propósito — por eso es peligroso cuando el commit que se sobrescribe ya lo tenía alguien más.

> **Nota sobre este módulo:** `push --force` falla en este motor con un bug real, no relacionado con el peligro que enseña esta lección (el mismo bug de `.git/shallow` que afecta a `commit --amend`, documentado en el Módulo 6). Salida real, capturada con `git` de línea de comandos, dos clones reales del mismo remoto.

## Tu compañero reescribe un commit que tú ya tenías

```text
$ git log --oneline
604615c tu: v2
ae77a24 base
```

Mientras tanto, tu compañero (con su propio clon del mismo remoto) reescribe el commit `base` con `commit --amend` y hace `push --force`:

```text
$ git push --force
To /ruta/al/remoto
 + 604615c...8dff18b master -> master (forced update)

$ git log --oneline
8dff18b colega: reescribe el primer commit
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "\"(forced update)\" — el remoto ya no tiene ni base ni tu propio commit v2",
  "contenido": "El force push no combina nada — sustituye por completo el historial de master en el remoto por el del colega. Tu commit \"tu: v2\" ya no existe ahí, aunque tú sigas teniéndolo en tu copia local."
}
```

## Lo que ves tú, sin saber nada de esto

```text
$ git fetch
From /ruta/al/remoto
 + 604615c...8dff18b master -> origin/master  (forced update)

$ git log --oneline
604615c tu: v2
ae77a24 base

$ git log --oneline origin/master
8dff18b colega: reescribe el primer commit
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "\"(forced update)\" en tu propio fetch es la señal de alarma.", "texto": "Un fetch normal solo añade commits nuevos — cuando en su lugar ves \"forced update\", significa que la rama remota ya no es una continuación de lo que tenías: alguien reescribió su historia por debajo de ti." },
    { "titulo": "Tu copia local no se ha perdido nada — pero tu próximo push fallará.", "texto": "Tu rama y origin/master ya no comparten el mismo pasado según el remoto. Intentar un push normal se rechaza de la misma forma que en la lección anterior." }
  ]
}
```

## Un push normal, después de esto, también se rechaza

```text
$ git push
 ! [rejected]        master -> master (non-fast-forward)
error: failed to push some refs to '/ruta/al/remoto'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "No hay una solución automática limpia aquí",
  "contenido": "A diferencia de un push rechazado normal (fetch + merge, lección anterior), integrar tu trabajo con una historia reescrita significa decidir a mano qué hacer con tu propio commit v2 — quizá un cherry-pick (Módulo 6) sobre la nueva base del colega. Es exactamente el motivo por el que reescribir historia ya compartida (Módulo 6, la regla de oro) se considera peligroso: no rompe Git, rompe la coordinación del equipo."
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "git-push",
      "descripcion": "Referencia oficial de git push, incluida la opción --force.",
      "url": "https://git-scm.com/docs/git-push",
      "etiqueta": "Git Reference"
    }
  ]
}
```
