// INTERACTION TEST
// Tests that a component responds correctly when the user does something.
// userEvent simulates real interactions (click, type) more accurately than fireEvent.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../components/Button'

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Save Sale</Button>)
    expect(screen.getByText('Save Sale')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn() // vi.fn() creates a fake function that tracks calls
    render(<Button onClick={handleClick}>Save Sale</Button>)

    await userEvent.click(screen.getByText('Save Sale'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick} disabled>Save Sale</Button>)

    await userEvent.click(screen.getByText('Save Sale'))

    expect(handleClick).not.toHaveBeenCalled()
  })
})
