# cluster: aprovechar varios núcleos

- **Módulo:** Concurrencia real
- **Slug:** `cluster` (autogenerado del título)
- **Orden:** 410
- **Fuentes:** [Comparing Node.js concurrency models](https://nodejs.org/en/learn/concurrency/comparing-nodejs-concurrency-models) + [Cluster](https://nodejs.org/api/cluster.html) — ver `contenido/nodejs/TEMARIO.md` #41

---

## Qué es y para qué sirve

Un único proceso de Node.js usa, como mucho, un núcleo de la CPU para ejecutar JavaScript — en una máquina con varios núcleos, eso deja capacidad real sin aprovechar. `cluster` permite lanzar varios procesos de Node.js (uno por núcleo, típicamente), todos escuchando el MISMO puerto, repartiendo las peticiones entrantes entre ellos.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport cluster from 'node:cluster';\nimport { createServer } from 'node:http';\nimport { availableParallelism } from 'node:os';\n\nif (cluster.isPrimary) {\n  const numeroDeNucleos = availableParallelism();\n  for (let i = 0; i < numeroDeNucleos; i++) {\n    cluster.fork(); // lanza un proceso trabajador por cada núcleo\n  }\n} else {\n  // Este código corre en cada proceso trabajador, no en el principal\n  createServer((req, res) => res.end('Hola')).listen(3000);\n}\n</script>",
  "anotaciones": [
    { "fragmento": "if (cluster.isPrimary) {", "nota": "El proceso PRIMARIO no atiende peticiones directamente — su trabajo es lanzar y supervisar a los procesos trabajadores (workers)." },
    { "fragmento": "cluster.fork(); // lanza un proceso trabajador por cada núcleo", "nota": "Cada fork() crea un proceso de Node.js COMPLETAMENTE INDEPENDIENTE, cada uno con su propia memoria — a diferencia de worker_threads, no comparten nada por defecto, ni siquiera el mismo proceso del sistema operativo." },
    { "fragmento": "createServer((req, res) => res.end('Hola')).listen(3000);", "nota": "Aunque varios procesos trabajadores llaman a .listen(3000) cada uno, el sistema operativo reparte las conexiones entrantes entre ellos — no hay conflicto de puerto ocupado, cluster lo gestiona." }
  ]
}
```

## cluster frente a worker_threads: cuál usar

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos herramientas de concurrencia, para problemas distintos",
  "roles": [
    { "etiqueta": "cluster", "rol": "Repartir peticiones HTTP entre varios procesos", "descripcion": "Aprovecha varios núcleos para atender MÁS peticiones a la vez — cada worker es un servidor HTTP completo e independiente." },
    { "etiqueta": "worker_threads", "rol": "Mover un cálculo pesado fuera del hilo principal", "descripcion": "No reparte peticiones — mueve trabajo puntual de CPU a otro hilo, dentro del MISMO proceso, para no bloquear mientras se calcula." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que los workers de cluster compartan memoria entre sí.", "texto": "Son procesos completamente independientes — una variable en memoria de un worker no es visible para otro, a diferencia de threads dentro del mismo proceso." },
    { "titulo": "Usar cluster para un problema de cálculo puntual pesado, en vez de worker_threads.", "texto": "cluster está pensado para repartir PETICIONES entre procesos, no para paralelizar un cálculo aislado — worker_threads es la herramienta correcta para eso." }
  ]
}
```

## Ejercicios

1. Escribe un servidor HTTP básico usando `cluster` que lance un worker por núcleo disponible.
2. Explica la diferencia real entre `cluster` y `worker_threads` en cuanto a qué comparten entre sí los distintos "trabajadores".
3. ¿Por qué varios procesos de `cluster` pueden escuchar el mismo puerto sin dar un error de "puerto ocupado"?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Comparing Node.js concurrency models",
      "descripcion": "Comparación oficial de cluster, worker_threads y child_process.",
      "url": "https://nodejs.org/en/learn/concurrency/comparing-nodejs-concurrency-models",
      "etiqueta": "Node.js"
    },
    {
      "titulo": "Cluster",
      "descripcion": "Referencia oficial completa del módulo cluster.",
      "url": "https://nodejs.org/api/cluster.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
