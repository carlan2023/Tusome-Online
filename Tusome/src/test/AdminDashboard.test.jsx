/**
 * Feature: admin dashboard
 * BDD specs — live DB-backed stats, user list, and consultant approvals.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AdminDashboard from '../pages/AdminDashboard'

const STATS = {
  total_users: 42,
  students: 30,
  consultants: 11,
  verified_consultants: 7,
  pending_applications: 1,
  new_this_week: 5,
}

const USERS = [
  { id: 1, email: 'admin@t.com', full_name: 'Ada Admin', role: 'admin', is_verified: false, is_active: true, date_joined: '2026-06-01T00:00:00Z' },
  { id: 2, email: 'cons@t.com', full_name: 'Carl Consultant', role: 'consultant', is_verified: false, is_active: true, date_joined: '2026-06-02T00:00:00Z' },
]

const APPLICATIONS = [
  {
    id: 7, email: 'cons@t.com', full_name: 'Carl Consultant',
    id_document: '/media/id.pdf', certificate: '/media/cert.pdf',
    reference_name: 'Dr. Jane', reference_contact: 'jane@x.com', status: 'pending',
  },
]

function ok(data) {
  return { ok: true, json: async () => data }
}

function mockApi() {
  const calls = []
  vi.stubGlobal('fetch', vi.fn(async (url, opts = {}) => {
    calls.push({ url, method: opts.method || 'GET' })
    if (url.includes('/admin/stats/')) return ok(STATS)
    if (url.includes('/admin/users/')) return ok(USERS)
    if (opts.method === 'POST' && url.includes('/admin/applications/')) {
      return ok({ ...APPLICATIONS[0], status: 'approved' })
    }
    if (url.includes('/admin/applications/')) return ok(APPLICATIONS)
    return ok({})
  }))
  return calls
}

function loginAs(role) {
  localStorage.setItem('tu_access', 'token')
  localStorage.setItem('tu_user', JSON.stringify({ email: 'admin@t.com', full_name: 'Ada Admin', role }))
}

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<h1>Login Page</h1>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Given the admin dashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('when a non-admin opens it, then they are sent to login', async () => {
    mockApi()
    loginAs('student')
    renderDashboard()
    expect(await screen.findByText(/login page/i)).toBeInTheDocument()
  })

  it('when an admin opens it, then stats from the database are shown', async () => {
    mockApi()
    loginAs('admin')
    renderDashboard()

    expect(await screen.findByText('42')).toBeInTheDocument()   // total users
    expect(screen.getByText('30')).toBeInTheDocument()          // students
    expect(screen.getByText(/\+5 this week/i)).toBeInTheDocument()
    expect(screen.getByText(/7 verified/i)).toBeInTheDocument()
  })

  it('then registered users are listed with role and status', async () => {
    mockApi()
    loginAs('admin')
    renderDashboard()

    // The consultant appears in both the approvals queue and the users table.
    expect((await screen.findAllByText('cons@t.com')).length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Carl Consultant').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/unverified/i)).toBeInTheDocument()
  })

  it('when the admin clicks Approve, then the decision is POSTed to the API', async () => {
    const calls = mockApi()
    loginAs('admin')
    renderDashboard()

    const approve = await screen.findByRole('button', { name: /approve/i })
    await userEvent.click(approve)

    await waitFor(() => {
      const post = calls.find((c) => c.method === 'POST')
      expect(post).toBeTruthy()
      expect(post.url).toContain('/admin/applications/7/approve/')
    })
  })
})
