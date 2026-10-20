import * as dom from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

globalThis.__pruebasEnVivo = { ...dom, userEvent }
