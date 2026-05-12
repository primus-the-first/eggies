// COMPONENT TEST
// Tests that a React component renders correctly for different inputs.
// React Testing Library's rule: test what the USER sees, not implementation details.

import { render, screen } from '@testing-library/react'
import Badge from '../components/Badge'

describe('Badge', () => {
  it('renders the label text', () => {
    render(<Badge type="cash" label="Cash" />)
    expect(screen.getByText('Cash')).toBeInTheDocument()
  })

  it('renders MoMo label', () => {
    render(<Badge type="momo" label="MoMo" />)
    expect(screen.getByText('MoMo')).toBeInTheDocument()
  })

  it('renders a Delivery badge', () => {
    render(<Badge type="delivery" label="Delivery" />)
    expect(screen.getByText('Delivery')).toBeInTheDocument()
  })
})
