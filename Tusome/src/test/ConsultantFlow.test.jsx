/**
 * Feature: consultant onboarding flow
 * BDD specs — registration and login route consultants to verification,
 * and the consultant portal stays locked until an admin approves.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import RegisterPage from '../pages/Register'
import Login from '../pages/Login'
import Portal from '../pages/Portal'

const VERIFY_STUB = <h1>Verification Screen</h1>

function routes(initial, element, path) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path={path} element={element} />
        <Route path="/consultant/verify" element={VERIFY_STUB} />
        <Route path="/verify-account" element={<h1>Confirm Account Screen</h1>} />
        <Route path="/consultant" element={<Portal role="consultant" />} />
        <Route path="/login" element={<h1>Login Page</h1>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Given the consultant onboarding flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('when a visitor registers as a consultant, then they land on the account confirmation screen', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (url.includes('/auth/register/')) {
        return { ok: true, json: async () => ({ id: 9, role: 'consultant' }) }
      }
      return {
        ok: true,
        json: async () => ({
          access: 'a', refresh: 'r',
          user: { email: 'c@t.com', role: 'consultant', is_verified: false },
        }),
      }
    }))
    routes('/register', <RegisterPage />, '/register')

    await userEvent.type(screen.getByPlaceholderText(/full name/i), 'Carla Consultant')
    await userEvent.type(screen.getByPlaceholderText(/example@email.com/i), 'c@t.com')
    await userEvent.type(screen.getByPlaceholderText(/at least 8 characters/i), 'GoodPass123!')
    await userEvent.selectOptions(screen.getByRole('combobox'), 'consultant')
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/confirm account screen/i)).toBeInTheDocument()
  })

  it('when an unverified consultant logs in, then they are sent to verification', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        access: 'a', refresh: 'r',
        user: { email: 'c@t.com', role: 'consultant', is_verified: false },
      }),
    })))
    routes('/login-page', <Login />, '/login-page')

    await userEvent.type(screen.getByLabelText(/email or phone/i), 'c@t.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'GoodPass123!')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/verification screen/i)).toBeInTheDocument()
  })

  it('when an unapproved consultant opens the portal directly, then they are bounced to verification', async () => {
    localStorage.setItem('tu_access', 'token')
    localStorage.setItem('tu_user', JSON.stringify({ email: 'c@t.com', role: 'consultant' }))
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ status: 'pending' }),
    })))
    routes('/consultant', <Portal role="consultant" />, '/consultant-x')

    expect(await screen.findByText(/verification screen/i)).toBeInTheDocument()
  })

  it('when an approved consultant opens the portal, then the dashboard renders', async () => {
    localStorage.setItem('tu_access', 'token')
    localStorage.setItem('tu_user', JSON.stringify({ email: 'c@t.com', full_name: 'Carla', role: 'consultant' }))
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ status: 'approved' }),
    })))
    routes('/consultant', <Portal role="consultant" />, '/consultant-x')

    expect(await screen.findByRole('heading', { name: /consultant portal/i })).toBeInTheDocument()
    expect(screen.getByText(/verified ✓/i)).toBeInTheDocument()
  })
})
