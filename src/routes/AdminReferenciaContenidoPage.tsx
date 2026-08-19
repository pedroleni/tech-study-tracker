import type { ReactNode } from 'react'

import { Acordeon } from '@/components/referencia-contenido/Acordeon'
import { BannerAlerta } from '@/components/referencia-contenido/BannerAlerta'
import { BarraProgresoLectura } from '@/components/referencia-contenido/BarraProgresoLectura'
import { Callout } from '@/components/referencia-contenido/Callout'
import { CitaDestacada } from '@/components/referencia-contenido/CitaDestacada'
import { ComparacionCodigo } from '@/components/referencia-contenido/ComparacionCodigo'
import { CuadriculaRecursos } from '@/components/referencia-contenido/CuadriculaRecursos'
import { GrupoInsignias } from '@/components/referencia-contenido/GrupoInsignias'
import { LineaDeTiempo } from '@/components/referencia-contenido/LineaDeTiempo'
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

interface PropiedadesReferencia {
  nombre: string
  children: ReactNode
}

function Referencia({ nombre, children }: PropiedadesReferencia) {
  const tituloId = `referencia-${nombre.toLowerCase()}`

  return (
    <section aria-labelledby={tituloId} className="scroll-mt-6 space-y-3">
      <h2 id={tituloId} className="font-mono text-xs font-semibold text-muted-foreground">
        {nombre}.tsx
      </h2>
      {children}
    </section>
  )
}

export function AdminReferenciaContenidoPage() {
  return (
    <section aria-labelledby="admin-referencia-contenido-title" className="space-y-10">
      <BarraProgresoLectura etiqueta="Progreso por el catálogo de componentes" />

      <header>
        <p className="text-sm font-medium text-muted-foreground">Administración</p>
        <h1
          id="admin-referencia-contenido-title"
          className="mt-1 text-3xl font-semibold tracking-tight text-balance"
        >
          Componentes de contenido
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-pretty text-muted-foreground">
          Catálogo visual de componentes React para futuras lecciones. Estos ejemplos sirven
          para comparar patrones de presentación y todavía no forman parte del pipeline de
          Markdown ni del sistema de laboratorios.
        </p>
      </header>

      <div className="space-y-12">
        <Referencia nombre="Callout">
          <Callout
            variante="aviso"
            titulo="Orden importante"
            contenido="Coloca meta charset antes de cualquier texto con tildes: el navegador necesita conocer la codificación antes de interpretar el título."
          />
        </Referencia>

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

        <Referencia nombre="LineaDeTiempo">
          <LineaDeTiempo
            items={[
              {
                fecha: '1',
                titulo: 'El navegador recibe texto',
                texto: 'Lee el archivo HTML de arriba abajo y reconoce el tipo de documento.',
              },
              {
                fecha: '2',
                titulo: 'Construye la estructura',
                texto: 'Convierte las etiquetas anidadas en un árbol de elementos relacionado.',
              },
              {
                fecha: '3',
                titulo: 'Presenta el contenido',
                texto: 'Interpreta head y pinta en pantalla todo lo que encuentra dentro de body.',
              },
            ]}
          />
        </Referencia>

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

        <Referencia nombre="CitaDestacada">
          <CitaDestacada
            cita="Un h1 no es texto grande: es el título de la página."
            atribucion="Principio de HTML semántico"
            fuente="La estructura de una página"
          />
        </Referencia>

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

        <Referencia nombre="MedidorDificultad">
          <MedidorDificultad nivel={1} etiqueta="Dificultad" />
        </Referencia>

        <Referencia nombre="BannerAlerta">
          <BannerAlerta mensaje="Esta lección usa HTML5: no necesitas la barra final de XHTML en etiquetas vacías como br o img." />
        </Referencia>

        <Referencia nombre="TarjetaExpandible">
          <TarjetaExpandible
            titulo="¿Por qué el navegador corrige HTML mal anidado?"
            resumen="Los navegadores intentan mostrar páginas antiguas incluso cuando contienen errores."
            contenido="El parser aplica reglas de recuperación y reconstruye el árbol que considera más probable. Esa tolerancia evita una pantalla en blanco, pero distintos errores pueden producir una estructura inesperada: por eso conviene validar el documento en vez de confiar en la corrección automática."
          />
        </Referencia>

        <Referencia nombre="CuadriculaRecursos">
          <CuadriculaRecursos
            recursos={[
              {
                titulo: 'Sintaxis de HTML',
                descripcion: 'Reglas del estándar para escribir elementos, atributos y comentarios.',
                url: 'https://html.spec.whatwg.org/multipage/syntax.html',
                etiqueta: 'Estándar WHATWG',
              },
              {
                titulo: 'Regiones de una página',
                descripcion: 'Buenas prácticas para que los landmarks ayuden a navegar el contenido.',
                url: 'https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/',
                etiqueta: 'Guía W3C',
              },
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

        <Referencia nombre="TarjetaRecursoExterno">
          <TarjetaRecursoExterno
            titulo="Estándar HTML Living Standard"
            descripcion="Consulta la referencia normativa de los elementos, atributos y algoritmos que implementan los navegadores."
            url="https://html.spec.whatwg.org/"
            dominio="html.spec.whatwg.org"
          />
        </Referencia>
      </div>
    </section>
  )
}
