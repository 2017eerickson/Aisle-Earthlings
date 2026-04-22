// Homepage Suite — Store Discovery
// Requires an authenticated user: test@t.com / password
// Tests that hit the Kroger API use zip 30318 (Atlanta, GA)

const VALID_ZIP = '92025'

describe('Homepage — Store Discovery', () => {
  beforeEach(() => {
    cy.clearCookies()
  })

  it('redirects to login if unauthenticated', () => {
    cy.visit('/homepage/')
    cy.location('pathname').should('eq', '/')
  })

  it('shows empty state message before searching', () => {
    cy.login()
    cy.visit('/homepage/')
    cy.contains('Enter zip to generate stores closet to you!').should('be.visible')
  })

  it('displays store cards after a valid zipcode search', () => {
    cy.login()
    cy.visit('/homepage/')
    cy.get('[data-testid="zipcode-input"]').type(VALID_ZIP)
    cy.get('[data-testid="zipcode-search-btn"]').click()
    cy.get('[data-testid="store-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0)
    cy.get('[data-testid="empty-state"]').should('not.exist')
  })

  it('triggers search on Enter key press', () => {
    cy.login()
    cy.visit('/homepage/')
    cy.get('[data-testid="zipcode-input"]').type(`${VALID_ZIP}{enter}`)
    cy.get('[data-testid="store-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0)
  })

  it('navigates to the store page when clicking the arrow button on a store card', () => {
    cy.login()
    cy.visit('/homepage/')
    cy.get('[data-testid="zipcode-input"]').type(VALID_ZIP)
    cy.get('[data-testid="zipcode-search-btn"]').click()
    cy.get('[data-testid="store-detail-btn"]', { timeout: 10000 }).first().click()
    cy.location('pathname').should('match', /^\/store\/.+\/$/)
  })

  it('navigates to the compare page when clicking COMPARE on a store card', () => {
    cy.login()
    cy.visit('/homepage/')
    cy.get('[data-testid="zipcode-input"]').type(VALID_ZIP)
    cy.get('[data-testid="zipcode-search-btn"]').click()
    cy.get('[data-testid="store-compare-btn"]', { timeout: 10000 }).first().click()
    cy.location('pathname').should('eq', '/compare')
  })
})
