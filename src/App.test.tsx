import { render, screen } from '@testing-library/react'

import App from './App'

describe('App', () => {
  it('muestra el nombre de la aplicación', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /tech study tracker/i }),
    ).toBeInTheDocument()
  })
})
