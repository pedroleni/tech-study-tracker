import type {
  ClipboardEventHandler,
  DragEventHandler,
  RefObject,
} from 'react'
import type { FieldErrors, UseFormRegisterReturn } from 'react-hook-form'

import type { LeccionFields } from '@/components/leccion/LeccionForm'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { BloqueImagenEncontrado } from '@/lib/utils/extraerImagenesDeLaboratorio'

export function ResumenLeccionForm({
  register,
  errors,
}: {
  register: UseFormRegisterReturn<'resumen'>
  errors: FieldErrors<LeccionFields>
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="leccion-resumen">Resumen</Label>
      <textarea
        id="leccion-resumen"
        rows={3}
        maxLength={300}
        placeholder="Resume el objetivo de la lección…"
        className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-invalid={Boolean(errors.resumen)}
        aria-describedby="leccion-resumen-error"
        {...register}
      />
      <p id="leccion-resumen-error" className="text-sm text-destructive">
        {errors.resumen?.message}
      </p>
    </div>
  )
}

export function EditorContenidoLeccion({
  contenidoRegister,
  contenidoRef,
  textareaRef,
  errors,
  subiendoImagen,
  errorImagen,
  mensajeImagen,
  imagenBorrandose,
  imagenes,
  manejarDragOver,
  manejarDrop,
  manejarPaste,
  borrarImagen,
}: {
  contenidoRegister: Omit<UseFormRegisterReturn<'contenido'>, 'ref'>
  contenidoRef: UseFormRegisterReturn<'contenido'>['ref']
  textareaRef: RefObject<HTMLTextAreaElement | null>
  errors: FieldErrors<LeccionFields>
  subiendoImagen: boolean
  errorImagen: string
  mensajeImagen: string
  imagenBorrandose: string
  imagenes: BloqueImagenEncontrado[]
  manejarDragOver: DragEventHandler<HTMLTextAreaElement>
  manejarDrop: DragEventHandler<HTMLTextAreaElement>
  manejarPaste: ClipboardEventHandler<HTMLTextAreaElement>
  borrarImagen: (imagen: BloqueImagenEncontrado) => Promise<void>
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="leccion-contenido">Contenido en Markdown</Label>
      <textarea
        id="leccion-contenido"
        rows={20}
        maxLength={200_000}
        placeholder="Escribe la lección en Markdown…"
        className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-invalid={Boolean(errors.contenido)}
        aria-describedby="leccion-contenido-error leccion-contenido-imagen-ayuda"
        onDragOver={manejarDragOver}
        onDrop={manejarDrop}
        onPaste={manejarPaste}
        ref={(el) => {
          contenidoRef(el)
          textareaRef.current = el
        }}
        {...contenidoRegister}
      />
      {subiendoImagen && (
        <p role="status" className="text-sm text-muted-foreground">
          Subiendo imagen…
        </p>
      )}
      {errorImagen && (
        <p role="alert" className="text-sm text-destructive">
          {errorImagen}
        </p>
      )}
      <p id="leccion-contenido-imagen-ayuda" className="text-xs text-muted-foreground">
        Arrastra o pega una imagen aquí para subirla e insertar el bloque automáticamente.
      </p>
      {imagenes.length > 0 && (
        <section
          aria-labelledby="leccion-imagenes-titulo"
          className="space-y-3 rounded-lg border bg-muted/30 p-4"
        >
          <h3 id="leccion-imagenes-titulo" className="text-sm font-medium">
            Imágenes en esta lección
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {imagenes.map((imagen) => (
              <li
                key={imagen.bloqueCompleto}
                className="flex min-w-0 items-center gap-3 rounded-lg border bg-background p-3"
              >
                <img
                  src={imagen.datos.src}
                  alt={imagen.datos.alt}
                  width={64}
                  height={64}
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded object-cover"
                />
                <p className="min-w-0 flex-1 break-words text-sm">{imagen.datos.alt}</p>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={Boolean(imagenBorrandose)}
                  onClick={() => void borrarImagen(imagen)}
                >
                  {imagenBorrandose === imagen.bloqueCompleto ? 'Borrando…' : 'Borrar'}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {mensajeImagen && (
        <p role="status" className="text-sm text-muted-foreground">
          {mensajeImagen}
        </p>
      )}
      <p id="leccion-contenido-error" className="text-sm text-destructive">
        {errors.contenido?.message}
      </p>
    </div>
  )
}
