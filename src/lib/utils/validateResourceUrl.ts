export function validateResourceUrl(resourceUrl: string): boolean {
  try {
    const { protocol } = new URL(resourceUrl)

    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}
