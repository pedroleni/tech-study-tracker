import {
  useCallback,
  useRef,
  useState,
  type ClipboardEvent,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
} from 'react'
import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form'

import type { LeccionFields } from '@/components/leccion/leccionFormSchema'
import { supabase } from '@/lib/supabaseClient'
import type { BloqueImagenEncontrado } from '@/lib/utils/extraerImagenesDeLaboratorio'
import type { Leccion } from '@/types'

function validarImagen(archivo: File) {
  // Mismo conjunto que api/imagenes.ts — SVG queda fuera a propósito
  // (riesgo de XSS vía script embebido si alguien visita /img/<hash>.svg
  // directo, no como <img>).
  const tiposPermitidos = ['image/png', 'image/jpeg', 'image/webp']
  if (!tiposPermitidos.includes(archivo.type)) {
    return 'Solo se admiten imágenes PNG, JPEG o WebP.'
  }
  if (archivo.size > 4 * 1024 * 1024) {
    return 'La imagen no puede superar 4 MB.'
  }
  return ''
}

async function obtenerTokenSesion() {
  const { data: sesion } = await supabase.auth.getSession()
  const token = sesion.session?.access_token
  if (!token) throw new Error('No hay sesión activa.')
  return token
}

async function subirImagen(archivo: File) {
  const token = await obtenerTokenSesion()

  const respuesta = await fetch('/api/imagenes', {
    method: 'POST',
    headers: { 'content-type': archivo.type, authorization: `Bearer ${token}` },
    body: archivo,
  })
  if (!respuesta.ok) {
    throw new Error(`La función devolvió ${respuesta.status}`)
  }
  const { publicUrl } = await respuesta.json()
  return publicUrl as string
}

function crearBloqueImagen(archivo: File, publicUrl: string) {
  return `\`\`\`laboratorio\n${JSON.stringify(
    { tipo: 'imagen', src: publicUrl, alt: archivo.name.replace(/\.[^.]+$/, '') },
    null,
    2,
  )}\n\`\`\`\n`
}

async function borrarImagenRemota(imagen: BloqueImagenEncontrado, leccionId?: string) {
  const clave = imagen.datos.src.slice(imagen.datos.src.lastIndexOf('/') + 1)
  const token = await obtenerTokenSesion()

  const respuesta = await fetch('/api/imagenes', {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ clave, leccionId }),
  })
  if (!respuesta.ok) {
    throw new Error(`La función devolvió ${respuesta.status}`)
  }

  const { borradoDeR2 } = (await respuesta.json()) as { borradoDeR2: boolean }
  return borradoDeR2
}

function crearManejadorBorradoImagen({
  leccion,
  getValues,
  setValue,
  setErrorImagen,
  setMensajeImagen,
  setImagenBorrandose,
}: {
  leccion?: Leccion
  getValues: UseFormGetValues<LeccionFields>
  setValue: UseFormSetValue<LeccionFields>
  setErrorImagen: Dispatch<SetStateAction<string>>
  setMensajeImagen: Dispatch<SetStateAction<string>>
  setImagenBorrandose: Dispatch<SetStateAction<string>>
}) {
  return async (imagen: BloqueImagenEncontrado) => {
    if (!window.confirm(`¿Borrar la imagen "${imagen.datos.alt}"? Esta acción no se puede deshacer.`)) {
      return
    }

    setErrorImagen('')
    setMensajeImagen('')
    setImagenBorrandose(imagen.bloqueCompleto)

    try {
      const borradoDeR2 = await borrarImagenRemota(imagen, leccion?.id)
      const nuevoValor = getValues('contenido').replace(imagen.bloqueCompleto, '')
      setValue('contenido', nuevoValor, { shouldDirty: true })

      if (!borradoDeR2) {
        setMensajeImagen(
          'Imagen quitada de esta lección — sigue en uso en otra, así que no se ha borrado del almacenamiento.',
        )
      }
    } catch (error) {
      setErrorImagen(error instanceof Error ? error.message : 'No se pudo borrar la imagen.')
    } finally {
      setImagenBorrandose('')
    }
  }
}

export function useImagenesLeccionForm({
  leccion,
  getValues,
  setValue,
}: {
  leccion?: Leccion
  getValues: UseFormGetValues<LeccionFields>
  setValue: UseFormSetValue<LeccionFields>
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [errorImagen, setErrorImagen] = useState('')
  const [mensajeImagen, setMensajeImagen] = useState('')
  const [imagenBorrandose, setImagenBorrandose] = useState('')

  const subirImagenEnCursor = useCallback(
    async (archivo: File) => {
      setErrorImagen('')
      const errorValidacion = validarImagen(archivo)
      if (errorValidacion) {
        setErrorImagen(errorValidacion)
        return
      }

      setSubiendoImagen(true)
      try {
        const publicUrl = await subirImagen(archivo)
        const bloque = crearBloqueImagen(archivo, publicUrl)
        const textarea = textareaRef.current
        const valorActual = textarea?.value ?? ''
        const inicio = textarea?.selectionStart ?? valorActual.length
        const fin = textarea?.selectionEnd ?? valorActual.length
        const nuevoValor = valorActual.slice(0, inicio) + bloque + valorActual.slice(fin)
        setValue('contenido', nuevoValor, { shouldDirty: true })
      } catch (error) {
        setErrorImagen(error instanceof Error ? error.message : 'No se pudo subir la imagen.')
      } finally {
        setSubiendoImagen(false)
      }
    },
    [setValue],
  )

  // El navegador solo trata este elemento como una zona de soltar válida si
  // dragover llama a preventDefault() — sin esto, al soltar el archivo el
  // navegador ejecuta su acción por defecto (abrir/navegar al archivo) en
  // vez de disparar drop con los datos utilizables. jsdom no reproduce esta
  // negociación, así que un test con fireEvent.drop no detecta su ausencia.
  const manejarDragOver = useCallback((event: DragEvent<HTMLTextAreaElement>) => {
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault()
    }
  }, [])

  const manejarDrop = useCallback(
    (event: DragEvent<HTMLTextAreaElement>) => {
      const archivo = event.dataTransfer.files[0]
      if (!archivo) return
      event.preventDefault()
      void subirImagenEnCursor(archivo)
    },
    [subirImagenEnCursor],
  )

  const manejarPaste = useCallback(
    (event: ClipboardEvent<HTMLTextAreaElement>) => {
      const archivo = [...event.clipboardData.items]
        .find((item) => item.type.startsWith('image/'))
        ?.getAsFile()
      if (!archivo) return
      event.preventDefault()
      void subirImagenEnCursor(archivo)
    },
    [subirImagenEnCursor],
  )

  const borrarImagen = crearManejadorBorradoImagen({
    leccion,
    getValues,
    setValue,
    setErrorImagen,
    setMensajeImagen,
    setImagenBorrandose,
  })

  return {
    textareaRef, subiendoImagen, errorImagen, mensajeImagen, imagenBorrandose,
    manejarDragOver, manejarDrop, manejarPaste, borrarImagen,
  }
}

export type GestionImagenesLeccion = ReturnType<typeof useImagenesLeccionForm>
