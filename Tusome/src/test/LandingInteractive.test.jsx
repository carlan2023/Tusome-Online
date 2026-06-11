/**
 * Feature: landing page interactivity
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  )
}

describe('Given the landing page', () => {
  it('when a category chip is clicked, then only matching courses show', async () => {
    renderLanding()
    expect(screen.getByText(/advanced data science/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Business' }))

    expect(screen.getByText(/business analytics pro/i)).toBeInTheDocument()
    expect(screen.queryByText(/advanced data science/i)).not.toBeInTheDocument()
  })

  it('when the next-story arrow is clicked, then the testimonial changes', async () => {
    renderLanding()
    expect(screen.getByText('Julia Nankya')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /next story/i }))

    expect(screen.getByText('Amina Achen')).toBeInTheDocument()
    expect(screen.queryByText('Julia Nankya')).not.toBeInTheDocument()
  })

  it('when an FAQ question is clicked, then its answer toggles open', async () => {
    renderLanding()
    expect(screen.queryByText(/works on mobile browsers/i)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /can i learn on my phone/i }))

    expect(screen.getByText(/works on mobile browsers/i)).toBeInTheDocument()
  })
})
