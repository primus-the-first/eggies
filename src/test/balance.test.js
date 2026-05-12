// UNIT TEST
// Tests a pure function in complete isolation — no database, no React, nothing.
// This is the getBalance logic from Credit.jsx extracted into a testable shape.

function getBalance(transactions) {
  const delivered = transactions
    .filter(t => t.type === 'delivery')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const paid = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  return delivered - paid
}

describe('getBalance', () => {
  it('returns 0 when there are no transactions', () => {
    expect(getBalance([])).toBe(0)
  })

  it('returns the full delivery amount when nothing has been paid', () => {
    const transactions = [
      { type: 'delivery', amount: 100 },
      { type: 'delivery', amount: 50 },
    ]
    expect(getBalance(transactions)).toBe(150)
  })

  it('returns 0 when the customer has paid in full', () => {
    const transactions = [
      { type: 'delivery', amount: 100 },
      { type: 'payment', amount: 100 },
    ]
    expect(getBalance(transactions)).toBe(0)
  })

  it('returns the remaining balance after a partial payment', () => {
    const transactions = [
      { type: 'delivery', amount: 200 },
      { type: 'payment', amount: 80 },
    ]
    expect(getBalance(transactions)).toBe(120)
  })
})
