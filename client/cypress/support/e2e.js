// Global support file — runs before every test suite

Cypress.Commands.add('login', (email = 'test@t.com', password = 'password') => {
  cy.visit('/')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="submit-btn"]').click()
  cy.location('pathname').should('eq', '/about')
})

Cypress.Commands.add('goToFirstStore', (zip = '92025') => {
  cy.login()
  cy.visit('/homepage/')
  cy.get('[data-testid="zipcode-input"]').type(zip)
  cy.get('[data-testid="zipcode-search-btn"]').click()
  cy.get('[data-testid="store-detail-btn"]', { timeout: 10000 }).first().click()
  cy.location('pathname').should('match', /^\/store\/.+\/$/)
})

Cypress.Commands.add('goToFirstProduct', (zip = '92025') => {
  cy.goToFirstStore(zip)
  cy.get('[data-testid="product-detail-btn"]', { timeout: 10000 }).first().click()
  cy.location('pathname').should('match', /^\/product\/.+/)
})

// Opens the drawer and deletes every item, then closes the drawer.
// Call after login to ensure a clean list state before list tests.
Cypress.Commands.add('clearListViaUI', () => {
  cy.get('[data-testid="list-widget"]').click()
  cy.get('[data-testid="grocery-drawer"]').should('be.visible')
  function deleteAll() {
    cy.get('body').then($body => {
      if ($body.find('[data-testid="item-delete"]').length > 0) {
        cy.get('[data-testid="item-delete"]').first().click()
        deleteAll()
      } else {
        cy.get('[data-testid="drawer-close-btn"]').click()
      }
    })
  }
  deleteAll()
})
