import { validateResourceUrl } from './validateResourceUrl'

describe('validateResourceUrl', () => {
  it.each([
    'http://example.com',
    'https://example.com/docs?section=security#urls',
    'HTTPS://EXAMPLE.COM',
  ])('acepta la URL web %s', (url) => {
    expect(validateResourceUrl(url)).toBe(true)
  })

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    '//example.com/path',
    'example.com/path',
    '/relative/path',
    '',
    'not a url',
  ])('rechaza la URL no segura o inválida %s', (url) => {
    expect(validateResourceUrl(url)).toBe(false)
  })
})
