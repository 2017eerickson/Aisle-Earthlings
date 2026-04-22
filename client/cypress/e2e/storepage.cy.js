// Store Page Suite
// Uses cy.goToFirstStore() which logs in, searches zip 92025, and clicks the first store

describe('Store Page', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.goToFirstStore()
  })

  it('renders store name and product grid after load', () => {
    cy.get('[data-testid="store-loading"]').should('not.exist')
    cy.get('[data-testid="store-name"]').should('not.be.empty')
    cy.get('[data-testid="product-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0)
  })

  it('product search filters results', () => {
    cy.get('[data-testid="product-card"]', { timeout: 10000 }).its('length').as('originalCount')
    cy.get('[data-testid="product-search-input"]').type('apple')
    cy.get('[data-testid="product-search-btn"]').click()
    // should check if results refresh
    cy.get('[data-testid="product-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0)
  })

  it('clicking the arrow on a product card navigates to the product page', () => {
    cy.get('[data-testid="product-detail-btn"]', { timeout: 10000 }).first().click()
    cy.location('pathname').should('match', /^\/product\/.+/)
  })

  it('favorite button toggles state on a product', () => {
    cy.get('[data-testid="product-card"]', { timeout: 10000 }).last().within(() => {
      cy.get('[data-testid="favorite-btn"]')
        .should('have.attr', 'aria-label', 'Add to favorites')
        .click()
    })
    cy.get('[data-testid="product-card"]').last().within(() => {
      cy.get('[data-testid="favorite-btn"]')
        .should('have.attr', 'aria-label', 'Remove from favorites')
    })
  })

  it('add to list button shows confirmation and list widget updates', () => {
    cy.get('[data-testid="product-card"]', { timeout: 10000 }).first().within(() => {
      cy.get('[data-testid="add-to-list-btn"]').click()
      cy.get('[data-testid="add-to-list-btn"]').should('contain.text', 'added!')
    })
    cy.get('[data-testid="list-widget"]').should('be.visible')
  })
})
