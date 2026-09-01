# Rebase interactivo: reescribir, combinar y reordenar commits

- **Módulo:** Reescribir historia: rebase, amend y cherry-pick
- **Slug:** `rebase-interactivo-reescribir-combinar-y-reordenar-commits` (autogenerado del título)
- **Orden:** 200
- **Fuentes:** [git-rebase](https://git-scm.com/docs/git-rebase) — ver `contenido/git/TEMARIO.md` #20

---

## Limpiar un historial de "voy probando"

Es habitual confirmar varios commits pequeños mientras resuelves algo — "wip: primer intento", "wip: sigo intentando", "wip: ya funciona" — que no aportan nada por separado una vez terminado. `git rebase -i` (interactivo) deja reescribir esos commits antes de compartirlos: combinarlos, reordenarlos, cambiar sus mensajes o incluso borrarlos.

```text
$ git log --oneline
a08b41b wip: ya funciona
638ea71 wip: sigo intentando
3ac2af4 wip: primer intento
0c564a3 base
```

`git rebase -i HEAD~3` abre un editor con una lista de los 3 últimos commits, cada uno con la palabra `pick` delante. Cambiar `pick` por `squash` en los dos últimos le dice a Git "combina este commit con el anterior":

```text
pick 3ac2af4 wip: primer intento
squash 638ea71 wip: sigo intentando
squash a08b41b wip: ya funciona
```

## El resultado real, tras confirmar

```text
$ git log --oneline
7f8db0a wip: primer intento
0c564a3 base

$ git show --stat HEAD
commit 7f8db0abee359990baf969234bb2f37a59c522f8
Author: Ana <ana@example.com>
Date:   Tue Sep 1 18:24:49 2026 +0200

    wip: primer intento

    wip: sigo intentando

    wip: ya funciona

 wip.txt | 3 +++
 1 file changed, 3 insertions(+)
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Tres commits se convirtieron en uno.", "texto": "El fichero final (wip.txt con sus 3 líneas) es idéntico al que había antes de combinar — squash no pierde ningún cambio, solo agrupa varios commits en una sola fotografía." },
    { "titulo": "Los tres mensajes originales quedan concatenados por defecto.", "texto": "Git no elige uno y descarta los otros dos — junta los tres, y te deja editar el resultado antes de confirmar. En la práctica, casi siempre se reescribe a mano con un único mensaje limpio." }
  ]
}
```

## Otras operaciones del mismo editor

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué más se puede hacer cambiando la palabra delante de cada commit",
  "roles": [
    { "etiqueta": "reword", "rol": "Cambiar solo el mensaje", "descripcion": "El commit se mantiene igual — Git para a pedir un mensaje nuevo, sin tocar el contenido." },
    { "etiqueta": "drop", "rol": "Eliminar el commit por completo", "descripcion": "Ese cambio desaparece del historial final, como si nunca se hubiera confirmado." },
    { "etiqueta": "reordenar líneas", "rol": "Cambiar el orden en que se aplican", "descripcion": "El orden de las líneas en el editor es el orden final de los commits — mover una línea arriba o abajo cambia el orden en que Git los reaplica." }
  ]
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "git-rebase",
      "descripcion": "Referencia oficial de git rebase, incluida la sección sobre el modo interactivo.",
      "url": "https://git-scm.com/docs/git-rebase",
      "etiqueta": "Git Reference"
    }
  ]
}
```
