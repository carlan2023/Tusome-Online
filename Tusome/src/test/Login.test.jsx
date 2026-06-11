/**
 * Feature: logging in
 * BDD specs for the Login page — inline field errors and the auth flow.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<h1>Student Dashboard</h1>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Given a visitor on the login page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('when they submit an empty form, then inline errors appear under both fields', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(screen.getByText(/please enter your email or phone number/i)).toBeInTheDocument()
    expect(screen.getByText(/please enter your password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email or phone/i)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('when credentials are wrong, then both fields are flagged and the message shows under the password', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'No active account found with the given credentials' }),
    }))
    renderLogin()

    await userEvent.type(screen.getByLabelText(/email or phone/i), 'p@t.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/no active account/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email or phone/i)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('when credentials are valid, then tokens are stored and the student lands on their dashboard', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access: 'access-token',
        refresh: 'refresh-token',
        user: { email: 'p@t.com', role: 'student' },
      }),
    }))
    renderLogin()

    await userEvent.type(screen.getByLabelText(/email or phone/i), 'p@t.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'GoodPass123!')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(localStorage.getItem('tu_access')).toBe('access-token')
    })
    expect(localStorage.getItem('tu_refresh')).toBe('refresh-token')
    expect(await screen.findByText(/student dashboard/i)).toBeInTheDocument()
  })

  it('when the server is unreachable, then a general error banner appears', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')))
    renderLogin()

    await userEvent.type(screen.getByLabelText(/email or phone/i), 'p@t.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'GoodPass123!')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/could not reach the server/i)).toBeInTheDocument()
  })
})
