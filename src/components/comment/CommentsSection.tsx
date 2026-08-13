import { useState } from 'react'
import { Link } from 'react-router-dom'

import { SafeMarkdown } from '@/components/content/SafeMarkdown'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from '@/lib/hooks/useComments'
import { useProfile } from '@/lib/hooks/useProfile'
import { groupComments } from '@/lib/utils/groupComments'
import type { Comment } from '@/types'

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function isValidBody(body: string) {
  const length = body.trim().length
  return length >= 1 && length <= 2000
}

function CommentComposer({
  id,
  initialBody = '',
  submitLabel,
  pending,
  onCancel,
  onSubmit,
}: {
  id: string
  initialBody?: string
  submitLabel: string
  pending: boolean
  onCancel?: () => void
  onSubmit: (body: string) => Promise<void>
}) {
  const [body, setBody] = useState(initialBody)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValidBody(body)) {
      setError('Escribe entre 1 y 2000 caracteres antes de enviar.')
      return
    }

    setError('')
    try {
      await onSubmit(body.trim())
      setBody('')
    } catch {
      setError('No se pudo guardar el comentario. Revisa tu sesión e inténtalo de nuevo.')
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
      <label htmlFor={id} className="text-sm font-medium">
        Comentario
      </label>
      <textarea
        id={id}
        name="comment"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="Comparte una duda o un apunte…"
        className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-describedby={`${id}-help ${id}-error`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span id={`${id}-help`} className="text-xs text-muted-foreground">
          Admite Markdown · {body.length}/2000
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? 'Guardando…' : submitLabel}
          </Button>
        </div>
      </div>
      <p id={`${id}-error`} aria-live="polite" className="text-sm text-destructive">
        {error}
      </p>
    </form>
  )
}

function CommentItem({
  comment,
  technologyId,
  canReply,
  canEdit,
  isAdmin,
  currentUserId,
}: {
  comment: Comment
  technologyId: string
  canReply: boolean
  canEdit: boolean
  isAdmin: boolean
  currentUserId?: string
}) {
  const [editing, setEditing] = useState(false)
  const [replying, setReplying] = useState(false)
  const [actionError, setActionError] = useState('')
  const updateMutation = useUpdateComment()
  const deleteMutation = useDeleteComment()
  const createMutation = useCreateComment()
  const isOwner = currentUserId === comment.userId
  const canDelete = isOwner || isAdmin

  async function handleDelete() {
    if (!window.confirm('¿Quieres borrar este comentario? Esta acción no se puede deshacer.')) {
      return
    }
    setActionError('')
    try {
      await deleteMutation.mutateAsync({ id: comment.id, technologyId })
    } catch {
      setActionError('No se pudo borrar el comentario. Inténtalo de nuevo.')
    }
  }

  return (
    <article className="space-y-3 rounded-lg border bg-card p-4">
      <header className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{isOwner ? 'Tú' : 'Usuario registrado'}</span>
        <time dateTime={comment.createdAt}>{dateFormatter.format(new Date(comment.createdAt))}</time>
      </header>

      {editing ? (
        <CommentComposer
          id={`edit-${comment.id}`}
          initialBody={comment.body}
          submitLabel="Guardar cambios"
          pending={updateMutation.isPending}
          onCancel={() => setEditing(false)}
          onSubmit={async (body) => {
            await updateMutation.mutateAsync({ id: comment.id, body, technologyId })
            setEditing(false)
          }}
        />
      ) : (
        <SafeMarkdown>{comment.body}</SafeMarkdown>
      )}

      {!editing && (canEdit || canDelete || canReply) && (
        <div className="flex flex-wrap gap-2">
          {canReply && (
            <Button type="button" size="sm" variant="ghost" onClick={() => setReplying(true)}>
              Responder
            </Button>
          )}
          {canEdit && (
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Editar
            </Button>
          )}
          {canDelete && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending ? 'Borrando…' : 'Borrar'}
            </Button>
          )}
        </div>
      )}

      <p aria-live="polite" className="text-sm text-destructive">
        {actionError}
      </p>

      {replying && (
        <div className="border-l-2 pl-4">
          <CommentComposer
            id={`reply-${comment.id}`}
            submitLabel="Publicar respuesta"
            pending={createMutation.isPending}
            onCancel={() => setReplying(false)}
            onSubmit={async (body) => {
              await createMutation.mutateAsync({
                technologyId,
                parentCommentId: comment.id,
                body,
              })
              setReplying(false)
            }}
          />
        </div>
      )}
    </article>
  )
}

export function CommentsSection({
  technologyId,
  writable = true,
}: {
  technologyId: string
  writable?: boolean
}) {
  const { user } = useAuth()
  const { isAdmin } = useProfile()
  const commentsQuery = useComments(technologyId)
  const createMutation = useCreateComment()
  const threads = groupComments(commentsQuery.data ?? [])

  return (
    <section aria-labelledby="comments-title" className="space-y-5">
      <div>
        <h2 id="comments-title" className="text-xl font-semibold text-balance">
          Comentarios
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Preguntas, matices y experiencias de la comunidad.
        </p>
      </div>

      {!writable ? (
        <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          Los comentarios se habilitarán cuando se publique la ficha.
        </p>
      ) : user ? (
        <Card>
          <CommentComposer
            id="new-comment"
            submitLabel="Publicar comentario"
            pending={createMutation.isPending}
            onSubmit={(body) => createMutation.mutateAsync({ technologyId, body }).then(() => undefined)}
          />
        </Card>
      ) : (
        <p className="rounded-lg border bg-muted/40 p-4 text-sm">
          <Link to="/login" className="font-medium underline underline-offset-4">
            Inicia sesión
          </Link>{' '}
          para participar en la conversación.
        </p>
      )}

      {commentsQuery.isLoading && <p role="status">Cargando comentarios…</p>}
      {commentsQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          No se pudieron cargar los comentarios. Inténtalo de nuevo.
        </p>
      )}
      {!commentsQuery.isLoading && !commentsQuery.isError && threads.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no hay comentarios.</p>
      )}

      <div className="space-y-4">
        {threads.map(({ comment, replies }) => (
          <div key={comment.id} className="space-y-3">
            <CommentItem
              comment={comment}
              technologyId={technologyId}
              canReply={Boolean(user)}
              canEdit={Boolean(user && user.id === comment.userId && writable)}
              isAdmin={isAdmin}
              currentUserId={user?.id}
            />
            {replies.length > 0 && (
              <div className="ml-4 space-y-3 border-l-2 pl-4 sm:ml-8">
                {replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    technologyId={technologyId}
                    canReply={false}
                    canEdit={Boolean(user && user.id === reply.userId && writable)}
                    isAdmin={isAdmin}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
