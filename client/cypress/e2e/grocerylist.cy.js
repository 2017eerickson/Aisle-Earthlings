// Grocery List Suite
// Each test clears the list first via cy.clearListViaUI() to ensure clean state,
// then adds an item via the product page before opening the drawer.

describe('Grocery List', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.login()
    cy.clearListViaUI()
  })

  it('no count badge on the list widget when list is empty', () => {
    cy.get('[data-testid="list-widget-count"]').should('not.exist')
    cy.get('[data-testid="list-widget"]').click()
    cy.get('[data-testid="list-empty-msg"]').should('be.visible')
    cy.get('[data-testid="list-item-count"]').should('contain', '(0)')
  })

  it('count badge appears and updates after adding an item', () => {
    cy.goToFirstProduct()
    cy.get('[data-testid="add-to-list-btn"]').click()
    cy.get('[data-testid="list-widget-count"]').should('be.visible').and('contain', '1')
    cy.get('[data-testid="list-widget"]').click()
    cy.get('[data-testid="list-item-count"]').should('contain', '(1)')
    cy.get('[data-testid="list-item"]').should('have.length', 1)
  })

  it('quantity increase and decrease update the displayed count', () => {
    cy.goToFirstProduct()
    cy.get('[data-testid="add-to-list-btn"]').click()
    cy.get('[data-testid="list-widget"]').click()
    cy.get('[data-testid="list-item"]').first().within(() => {
      cy.get('[data-testid="qty-display"]').should('contain', '1')
      cy.get('[data-testid="qty-increase"]').click()
      cy.get('[data-testid="qty-display"]', { timeout: 5000 }).should('contain', '2')
      cy.get('[data-testid="qty-decrease"]').click()
      cy.get('[data-testid="qty-display"]', { timeout: 5000 }).should('contain', '1')
    })
  })

  it('checking an item marks it and reveals the clear checked button', () => {
    cy.goToFirstProduct()
    cy.get('[data-testid="add-to-list-btn"]').click()
    cy.get('[data-testid="list-widget"]').click()
    cy.get('[data-testid="clear-checked-btn"]').should('not.exist')
    cy.get('[data-testid="item-checkbox"]').first().click()
    cy.get('[data-testid="list-item"]').first().should('have.class', 'opacity-50')
    cy.get('[data-testid="clear-checked-btn"]').should('be.visible')
  })

  it('clear checked button removes only checked items', () => {
    cy.goToFirstProduct()
    cy.get('[data-testid="add-to-list-btn"]').click()
    cy.get('[data-testid="list-widget"]').click()
    cy.get('[data-testid="item-checkbox"]').first().click()
    cy.get('[data-testid="clear-checked-btn"]').click()
    cy.get('[data-testid="list-item"]').should('not.exist')
    cy.get('[data-testid="list-empty-msg"]').should('be.visible')
  })

  it('delete button removes the item from the list', () => {
    cy.goToFirstProduct()
    cy.get('[data-testid="add-to-list-btn"]').click()
    cy.get('[data-testid="list-widget"]').click()
    cy.get('[data-testid="item-delete"]').first().click()
    cy.get('[data-testid="list-item"]').should('not.exist')
    cy.get('[data-testid="list-empty-msg"]').should('be.visible')
  })

  it('clicking the product name link navigates to the product page', () => {
    cy.goToFirstProduct()
    cy.get('[data-testid="add-to-list-btn"]').click()
    cy.get('[data-testid="list-widget"]').click()
    cy.get('[data-testid="item-product-link"]').first().click()
    cy.location('pathname').should('match', /^\/product\/.+/)
  })
})
