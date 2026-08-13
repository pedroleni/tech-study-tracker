export const queryKeys = {
  categories: ['categories'] as const,
  technologies: ['technologies'] as const,
  technologiesForViewer: (viewerId: string | null) =>
    ['technologies', viewerId ?? 'public'] as const,
  technology: (viewerId: string | null, technologyId: string) =>
    ['technologies', viewerId ?? 'public', technologyId] as const,
  profile: ['profile'] as const,
  comments: (technologyId: string) => ['comments', technologyId] as const,
  favorites: ['favorites'] as const,
}
