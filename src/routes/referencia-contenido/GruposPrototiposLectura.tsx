import { Acordeon } from '@/components/referencia-contenido/Acordeon'
import { BannerAlerta } from '@/components/referencia-contenido/BannerAlerta'
import { CitaDestacada } from '@/components/referencia-contenido/CitaDestacada'
import { ComparacionCodigo } from '@/components/referencia-contenido/ComparacionCodigo'
import { GrupoInsignias } from '@/components/referencia-contenido/GrupoInsignias'
import { ListaComprobacion } from '@/components/referencia-contenido/ListaComprobacion'
import { MedidorDificultad } from '@/components/referencia-contenido/MedidorDificultad'
import { Pasos } from '@/components/referencia-contenido/Pasos'
import { Pestanas } from '@/components/referencia-contenido/Pestanas'
import { RequisitosPrevios } from '@/components/referencia-contenido/RequisitosPrevios'
import { ResumenTLDR } from '@/components/referencia-contenido/ResumenTLDR'
import { TablaComparativa } from '@/components/referencia-contenido/TablaComparativa'
import { TarjetaEstadistica } from '@/components/referencia-contenido/TarjetaEstadistica'
import { TarjetaExpandible } from '@/components/referencia-contenido/TarjetaExpandible'
import { TarjetaRecursoExterno } from '@/components/referencia-contenido/TarjetaRecursoExterno'
import { TerminoGlosario } from '@/components/referencia-contenido/TerminoGlosario'

import { GrupoCatalogo } from '@/routes/referencia-contenido/GrupoCatalogo'
import { Referencia } from '@/routes/referencia-contenido/Referencia'

export function GrupoAvisosYAlertas() {
  return (
    <GrupoCatalogo
      titulo="Avisos y alertas"
      descripcion="Mensajes que interrumpen la lectura a propósito porque hay algo que el lector no debería pasar por alto."
    >
      <Referencia nombre="BannerAlerta">
        <BannerAlerta mensaje="Esta lección usa HTML5: no necesitas la barra final de XHTML en etiquetas vacías como br o img." />
      </Referencia>
    </GrupoCatalogo>
  )
}

export function GrupoNavegacionYContenidoExpandible() {
  return (
    <GrupoCatalogo
      titulo="Navegación y contenido expandible"
      descripcion="Contenido que se oculta o se reorganiza bajo demanda, en vez de ocupar espacio todo el tiempo."
    >
      <Referencia nombre="Acordeon">
        <Acordeon
          items={[
            {
              pregunta: '¿Por qué solo puede haber un main visible?',
              respuesta:
                'Porque representa el contenido principal del documento. Dos regiones main harían ambiguo el destino del atajo que usan las tecnologías de asistencia.',
            },
            {
              pregunta: '¿Cuándo debo usar article en vez de section?',
              respuesta:
                'Usa article cuando el contenido conserve su sentido fuera de la página, como una noticia, una receta o una entrada de blog.',
            },
            {
              pregunta: '¿Un div puede sustituir a una etiqueta semántica?',
              respuesta:
                'Visualmente puede parecer igual, pero no comunica ninguna estructura al navegador, al buscador ni al lector de pantalla.',
            },
          ]}
        />
      </Referencia>

      <Referencia nombre="Pestanas">
        <Pestanas
          items={[
            {
              etiqueta: 'head',
              contenido:
                'Contiene metadatos, el título de la pestaña y enlaces a recursos que el navegador necesita antes de pintar la página.',
            },
            {
              etiqueta: 'body',
              contenido:
                'Contiene todo lo que forma parte de la página visible: encabezados, texto, imágenes, navegación y controles.',
            },
            {
              etiqueta: 'footer',
              contenido:
                'Cierra una página o una sección con información complementaria, como autoría, licencia o enlaces relacionados.',
            },
          ]}
        />
      </Referencia>

      <Referencia nombre="TarjetaExpandible">
        <TarjetaExpandible
          titulo="¿Por qué el navegador corrige HTML mal anidado?"
          resumen="Los navegadores intentan mostrar páginas antiguas incluso cuando contienen errores."
          contenido="El parser aplica reglas de recuperación y reconstruye el árbol que considera más probable. Esa tolerancia evita una pantalla en blanco, pero distintos errores pueden producir una estructura inesperada: por eso conviene validar el documento en vez de confiar en la corrección automática."
        />
      </Referencia>
    </GrupoCatalogo>
  )
}

export function GrupoEstructuraSecuencial() {
  return (
    <GrupoCatalogo
      titulo="Estructura secuencial"
      descripcion="Contenido que solo tiene sentido en un orden concreto: un proceso, un progreso, o lo que hace falta saber antes de empezar."
    >
      <Referencia nombre="Pasos">
        <Pasos
          pasoActivo={2}
          pasos={[
            {
              titulo: 'Declara el documento',
              descripcion: 'Empieza con DOCTYPE para activar las reglas modernas de HTML.',
            },
            {
              titulo: 'Define idioma y metadatos',
              descripcion: 'Añade lang="es", charset, viewport y un título descriptivo.',
            },
            {
              titulo: 'Estructura el contenido',
              descripcion: 'Organiza body con header, main y footer según su significado.',
            },
          ]}
        />
      </Referencia>

      <Referencia nombre="RequisitosPrevios">
        <RequisitosPrevios
          titulo="Antes de empezar"
          requisitos={[
            'Un editor de texto para crear un archivo index.html.',
            'Un navegador moderno para abrir el documento.',
            'No necesitas conocer CSS ni JavaScript.',
          ]}
        />
      </Referencia>
    </GrupoCatalogo>
  )
}

export function GrupoEnriquecimientoDeTexto() {
  return (
    <GrupoCatalogo
      titulo="Enriquecimiento de texto"
      descripcion="Anotaciones que se insertan dentro de un párrafo normal, sin romper el flujo de lectura."
    >
      <Referencia nombre="CitaDestacada">
        <CitaDestacada
          cita="Un h1 no es texto grande: es el título de la página."
          atribucion="Principio de HTML semántico"
          fuente="La estructura de una página"
        />
      </Referencia>

      <Referencia nombre="TerminoGlosario">
        <p className="rounded-xl border bg-card p-5 text-sm leading-relaxed shadow-sm">
          El{' '}
          <TerminoGlosario
            termino="DOM"
            definicion="Representación en forma de árbol que el navegador construye a partir de los elementos del documento HTML."
          />{' '}
          conserva las relaciones de anidamiento entre las etiquetas.
        </p>
      </Referencia>
    </GrupoCatalogo>
  )
}

export function GrupoMetadatosYProgreso() {
  return (
    <GrupoCatalogo
      titulo="Metadatos y progreso"
      descripcion="Información sobre la lección misma — cuánto dura, qué la etiqueta, cuánto llevas leído — no sobre HTML."
    >
      <Referencia nombre="TarjetaEstadistica">
        <div className="max-w-sm">
          <TarjetaEstadistica valor={7} sufijo=" min" etiqueta="Lectura estimada de la lección" />
        </div>
      </Referencia>

      <Referencia nombre="GrupoInsignias">
        <GrupoInsignias
          etiquetas={['HTML', 'Semántica', 'Accesibilidad', 'Primeros pasos']}
          ariaLabel="Temas de la lección"
        />
      </Referencia>

      <Referencia nombre="MedidorDificultad">
        <MedidorDificultad nivel={1} etiqueta="Dificultad" />
      </Referencia>

      <Referencia nombre="ResumenTLDR">
        <ResumenTLDR
          titulo="El documento HTML mínimo en 3 ideas"
          puntos={[
            'DOCTYPE activa el modo estándar del navegador.',
            'head describe el documento y body contiene lo que se ve.',
            'Las etiquetas se cierran en el orden inverso al que se abren.',
          ]}
        />
      </Referencia>

      <Referencia nombre="BarraProgresoLectura">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-pretty text-muted-foreground">
            La línea fija en el borde superior de la ventana avanza a medida que recorres este
            catálogo.
          </p>
        </div>
      </Referencia>
    </GrupoCatalogo>
  )
}

export function GrupoComparacionYVerificacion() {
  return (
    <GrupoCatalogo
      titulo="Comparación y verificación"
      descripcion="Dos alternativas o una serie de condiciones puestas una junto a otra para que la diferencia salte a la vista."
    >
      <Referencia nombre="ListaComprobacion">
        <ListaComprobacion
          titulo="Revisa el esqueleto del documento"
          items={[
            { id: 'doctype', texto: 'DOCTYPE aparece en la primera línea', completado: true },
            { id: 'idioma', texto: 'html declara el idioma con lang="es"' },
            { id: 'charset', texto: 'meta charset es el primer elemento de head' },
            { id: 'viewport', texto: 'viewport prepara la página para móviles' },
          ]}
        />
      </Referencia>

      <Referencia nombre="TablaComparativa">
        <TablaComparativa
          caption="Comparación entre div y etiquetas semánticas"
          columnas={['div', 'Etiqueta semántica']}
          filas={[
            { caracteristica: 'Crea una caja visual', valores: [true, true] },
            { caracteristica: 'Comunica su propósito', valores: [false, true] },
            { caracteristica: 'Crea una región accesible', valores: [false, true] },
            { caracteristica: 'Ejemplo', valores: ['<div>', '<main>'] },
          ]}
        />
      </Referencia>

      <Referencia nombre="ComparacionCodigo">
        <ComparacionCodigo
          evitar={{
            etiqueta: 'Evitar',
            codigo: '<div class="nav">\n  <a href="/">Inicio</a>\n</div>',
          }}
          preferir={{
            etiqueta: 'Preferir',
            codigo: '<nav aria-label="Principal">\n  <a href="/">Inicio</a>\n</nav>',
          }}
        />
      </Referencia>
    </GrupoCatalogo>
  )
}

export function GrupoTarjetasDeRecursos() {
  return (
    <GrupoCatalogo
      titulo="Tarjetas de recursos"
      descripcion="Enlaces salientes presentados como una tarjeta, individual o en cuadrícula, en vez de un enlace suelto en el texto."
    >
      <Referencia nombre="TarjetaRecursoExterno">
        <TarjetaRecursoExterno
          titulo="Estándar HTML Living Standard"
          descripcion="Consulta la referencia normativa de los elementos, atributos y algoritmos que implementan los navegadores."
          url="https://html.spec.whatwg.org/"
          dominio="html.spec.whatwg.org"
        />
      </Referencia>
    </GrupoCatalogo>
  )
}
