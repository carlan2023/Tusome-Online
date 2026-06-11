/**
 * Feature: creating an account
 * BDD specs for the Register page — validation and server error mapping.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from '../pages/Register'

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <RegisterPage />
    </MemoryRouter>
  )
}

describe('Given a visitor on the register page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('when they submit an empty form, then every required field shows its own message', async () => {
    renderRegister()
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByText(/please enter your full name/i)).toBeInTheDocument()
    expect(screen.getByText(/provide an email address or a phone number/i)).toBeInTheDocument()
    expect(screen.getByText(/please enter a password/i)).toBeInTheDocument()
    expect(screen.getByText(/please agree to the terms/i)).toBeInTheDocument()
  })

  it('when the password is under 8 characters, then a password rule message appears', async () => {
    renderRegister()
    await userEvent.type(screen.getByPlaceholderText(/full name/i), 'Phil Test')
    await userEvent.type(screen.getByPlaceholderText(/example@email.com/i), 'p@t.com')
    await userEvent.type(screen.getByPlaceholderText(/at least 8 characters/i), 'short')
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByText(/at least 8 characters\./i)).toBeInTheDocument()
  })

  it('when the email is already taken, then the server error appears under the email field', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ email: ['user with this email address already exists.'] }),
    }))
    renderRegister()

    await userEvent.type(screen.getByPlaceholderText(/full name/i), 'Phil Test')
    await userEvent.type(screen.getByPlaceholderText(/example@email.com/i), 'taken@t.com')
    await userEvent.type(screen.getByPlaceholderText(/at least 8 characters/i), 'GoodPass123!')
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/example@email.com/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('the password visibility toggle reveals the typed password', async () => {
    renderRegister()
    const pw = screen.getByPlaceholderText(/at least 8 characters/i)
    expect(pw).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: /show password/i }))
    expect(pw).toHaveAttribute('type', 'text')
  })
})
