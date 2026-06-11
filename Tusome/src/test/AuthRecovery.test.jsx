/**
 * Feature: account confirmation & password recovery
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import VerifyAccount from '../pages/VerifyAccount'

function at(path, extra = null) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/login" element={<h1>Login Page</h1>} />
        {extra}
      </Routes>
    </MemoryRouter>
  )
}

describe('Given a user who forgot their password', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('when they enter an email, then the inbox notice is shown', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({}) })))
    at('/forgot-password')

    await userEvent.type(screen.getByLabelText(/email or phone/i), 'p@t.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset/i }))

    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument()
  })

  it('when they enter a phone number, then they continue to the code form', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({}) })))
    at('/forgot-password')

    await userEvent.type(screen.getByLabelText(/email or phone/i), '+256700111222')
    await userEvent.click(screen.getByRole('button', { name: /send reset/i }))

    expect(await screen.findByText(/enter the code we sent/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/reset code/i)).toBeInTheDocument()
  })
})

describe('Given a user on the reset password page', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('when passwords do not match, then an inline error appears', async () => {
    at('/reset-password?token=abc')

    await userEvent.type(screen.getByLabelText('New password'), 'GoodPass123!')
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'Different!')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it('when the token and password are valid, then success links to login', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true, json: async () => ({ detail: 'Password updated.' }),
    })))
    at('/reset-password?token=abc')

    await userEvent.type(screen.getByLabelText('New password'), 'GoodPass123!')
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'GoodPass123!')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText(/password updated/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go to login/i })).toBeInTheDocument()
  })
})

describe('Given account confirmation', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('when an emailed link token is valid, then the email is confirmed', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true, json: async () => ({ detail: 'Email verified.' }),
    })))
    at('/verify-account?token=good-token')

    expect(await screen.findByText(/email confirmed/i)).toBeInTheDocument()
  })

  it('when a registered phone user enters the right OTP, then the phone is verified', async () => {
    localStorage.setItem('tu_access', 'token')
    localStorage.setItem('tu_user', JSON.stringify({ phone: '+256700111222', role: 'student' }))
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true, json: async () => ({ detail: 'Phone number verified.' }),
    })))
    at('/verify-account')

    await userEvent.type(await screen.findByLabelText(/verification code/i), '482913')
    await userEvent.click(screen.getByRole('button', { name: /verify phone/i }))

    expect(await screen.findByText(/phone verified/i)).toBeInTheDocument()
  })
})
