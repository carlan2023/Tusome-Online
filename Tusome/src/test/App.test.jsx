/**
 * Feature: routing
 * BDD specs for top-level navigation between pages.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )
}

describe('Given the Tusome app', () => {
  it('when a visitor opens /, then the landing page hero is shown', () => {
    renderAt('/')
    expect(
      screen.getByRole('heading', { name: /empower your future/i })
    ).toBeInTheDocument()
  })

  it('when a visitor opens /login, then the login form is shown', () => {
    renderAt('/login')
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument()
  })

  it('when a visitor opens /register, then the account form is shown', () => {
    renderAt('/register')
    expect(
      screen.getByRole('heading', { name: /create account/i })
    ).toBeInTheDocument()
  })

  it('the landing page CTAs lead to registration', () => {
    renderAt('/')
    const links = screen.getAllByRole('link', { name: /get started/i })
    links.forEach((l) => expect(l).toHaveAttribute('href', '/register'))
  })
})
