export const queryKeys = {
  categories: ['categories'] as const,
  technologies: ['technologies'] as const,
  technologiesForViewer: (viewerId: string | null) =>
    ['technologies', viewerId ?? 'public'] as const,
  technology: (viewerId: string | null, technologyId: string) =>
    ['technologies', viewerId ?? 'public', technologyId] as const,
  lecciones: ['lecciones'] as const,
  leccionesForTechnology: (viewerId: string | null, technologyId: string) =>
    ['lecciones', viewerId ?? 'public', 'technology', technologyId] as const,
  leccionById: (viewerId: string | null, leccionId: string) =>
    ['lecciones', viewerId ?? 'public', 'id', leccionId] as const,
  leccionBySlug: (viewerId: string | null, technologyId: string, slug: string) =>
    ['lecciones', viewerId ?? 'public', 'slug', technologyId, slug] as const,
  profile: ['profile'] as const,
  comments: (leccionId: string) => ['comments', leccionId] as const,
  favorites: ['favorites'] as const,
  progress: ['progress'] as const,
  myProgress: (userId: string, technologyId: string) =>
    ['progress', userId, technologyId] as const,
}
