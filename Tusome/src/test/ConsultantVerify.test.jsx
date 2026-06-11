/**
 * Feature: consultant identity & credentials verification
 * BDD specs — document submission form and the post-submission states.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ConsultantVerify from '../pages/ConsultantVerify'

function loginAsConsultant() {
  localStorage.setItem('tu_access', 'token')
  localStorage.setItem('tu_user', JSON.stringify({ email: 'cons@t.com', role: 'consultant' }))
}

function mockApi({ initialStatus = { status: 'none' }, postResponse } = {}) {
  vi.stubGlobal('fetch', vi.fn(async (url, opts = {}) => {
    if ((opts.method || 'GET') === 'GET') {
      return { ok: true, json: async () => initialStatus }
    }
    return postResponse || {
      ok: true,
      status: 201,
      json: async () => ({ status: 'pending', submitted_at: '2026-06-11T12:00:00Z' }),
    }
  }))
}

function renderVerify() {
  return render(
    <MemoryRouter initialEntries={['/consultant/verify']}>
      <ConsultantVerify />
    </MemoryRouter>
  )
}

const pdf = () => new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' })

describe('Given a consultant on the verification page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('when they submit without documents, then each requirement shows its own message', async () => {
    mockApi()
    loginAsConsultant()
    renderVerify()

    const submit = await screen.findByRole('button', { name: /submit application/i })
    await userEvent.click(submit)

    expect(screen.getByText(/attach your government-issued id/i)).toBeInTheDocument()
    expect(screen.getByText(/attach your academic certificate/i)).toBeInTheDocument()
    expect(screen.getByText(/name a professional reference/i)).toBeInTheDocument()
    expect(screen.getByText(/add their email or phone/i)).toBeInTheDocument()
  })

  it('when they submit complete documents, then the success screen appears', async () => {
    mockApi()
    loginAsConsultant()
    renderVerify()

    await screen.findByRole('button', { name: /submit application/i })
    await userEvent.upload(screen.getByLabelText(/upload government-issued id/i), pdf())
    await userEvent.upload(screen.getByLabelText(/upload academic certificate/i), pdf())
    await userEvent.type(screen.getByPlaceholderText(/dr\. jane doe/i), 'Dr. Jane Doe')
    await userEvent.type(screen.getByPlaceholderText(/email or phone/i), 'jane@x.com')
    await userEvent.click(screen.getByRole('button', { name: /submit application/i }))

    expect(
      await screen.findByText(/application submitted successfully/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/under review/i)).toBeInTheDocument()
  })

  it('when an application is already pending, then the status screen shows instead of the form', async () => {
    mockApi({ initialStatus: { status: 'pending' } })
    loginAsConsultant()
    renderVerify()

    expect(
      await screen.findByText(/application submitted successfully/i)
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /submit application/i })).not.toBeInTheDocument()
  })

  it('when the application was approved, then the verified state is shown', async () => {
    mockApi({ initialStatus: { status: 'approved' } })
    loginAsConsultant()
    renderVerify()

    expect(await screen.findByText(/you're verified/i)).toBeInTheDocument()
  })
})
