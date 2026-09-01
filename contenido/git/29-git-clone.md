# `git clone`: traerte un repositorio completo, no solo su último estado

- **Módulo:** Remotos
- **Slug:** `git-clone-traerte-un-repositorio-completo-no-solo-su-ultimo-estado` (autogenerado del título)
- **Orden:** 290
- **Fuentes:** [git-clone](https://git-scm.com/docs/git-clone) — ver `contenido/git/TEMARIO.md` #29

---

## Todo el historial, de una vez

`git clone` no descarga solo "el estado actual" del proyecto — trae **todo** el historial: cada commit, cada objeto, todo lo que hace falta para que tu copia sea, desde el primer segundo, un repositorio completo por derecho propio (Módulo 1: cada clon es una copia completa, no un simple checkout).

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Dos commits ya existentes, vistos justo después de clonar",
  "esquemaGit": [
    "init --bare /remoto",
    "clone /remoto /repo",
    { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } },
    "add a.txt",
    "commit -m 'v1'",
    { "escribir": { "ruta": "a.txt", "contenido": "v2\n" } },
    "add a.txt",
    "commit -m 'v2'",
    "push",
    "clone /remoto /copia-nueva"
  ],
  "comando": "--git-dir=/copia-nueva/.git log --oneline",
  "anotaciones": [
    { "fragmento": "log", "nota": "Esta es una copia que se acaba de clonar — y ya tiene los dos commits completos, con sus mensajes originales. Nada de \"descargar el historial más tarde\": llega entero de golpe." }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Por eso puedes trabajar sin conexión después de clonar.", "texto": "git log, git diff entre dos commits antiguos, git checkout a cualquier punto del pasado — todo funciona sin red, porque el historial completo ya está en tu disco." },
    { "titulo": "Un clon configura automáticamente el remoto \"origin\".", "texto": "Es justo lo que se vio en la lección anterior con remote show — clone no solo trae los objetos, también deja preparada la conexión con el repositorio del que viniste." }
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
      "titulo": "git-clone",
      "descripcion": "Referencia oficial de git clone.",
      "url": "https://git-scm.com/docs/git-clone",
      "etiqueta": "Git Reference"
    }
  ]
}
```
