// Favorites Page Suite
// NOTE: The empty state test assumes test@t.com has no existing favorites.
// If other suites have run first and left favorites behind, run this suite
// in isolation or clear favorites via the Django shell:
//   docker compose exec backend python manage.py shell -c "
//     from users_app.models import AppUser
//     from list_app.models import Favorite
//     user = AppUser.objects.get(email='test@t.com')
//     Favorite.objects.filter(user=user).delete()
//   "

const ZIP = '92025'

describe('Favorites Page', () => {
  beforeEach(() => {
    cy.clearCookies()
  })

  it('shows empty state message in both sections when there are no favorites', () => {
    cy.login()
    cy.visit('/favorites/')
    cy.get('[data-testid="product-favorites-section"]').within(() => {
      cy.get('[data-testid="favorites-empty-msg"]').should('be.visible')
    })
    cy.get('[data-testid="store-favorites-section"]').within(() => {
      cy.get('[data-testid="favorites-empty-msg"]').should('be.visible')
    })
  })

  it('favorited store appears in the store favorites section', () => {
    cy.login()
    cy.visit('/homepage/')
    cy.get('[data-testid="zipcode-input"]').type(ZIP)
    cy.get('[data-testid="zipcode-search-btn"]').click()
    cy.get('[data-testid="store-card"]', { timeout: 10000 }).first().within(() => {
      cy.get('[data-testid="favorite-btn"]').click()
    })
    cy.visit('/favorites/')
    cy.get('[data-testid="store-favorites-section"]').within(() => {
      cy.get('[data-testid="store-card"]', { timeout: 15000 }).should('have.length.greaterThan', 0)
    })
  })

  it('favorited product appears in the product favorites section', () => {
    cy.goToFirstProduct()
    cy.get('[data-testid="favorite-btn"]').click()
    cy.visit('/favorites/')
    cy.get('[data-testid="product-favorites-section"]').within(() => {
      cy.get('[data-testid="product-card"]', { timeout: 15000 }).should('have.length.greaterThan', 0)
    })
  })

  it('unfavoriting a store removes it from the favorites list', () => {
    // Add a store favorite
    cy.login()
    cy.visit('/homepage/')
    cy.get('[data-testid="zipcode-input"]').type(ZIP)
    cy.get('[data-testid="zipcode-search-btn"]').click()
    cy.get('[data-testid="store-card"]', { timeout: 10000 }).first().within(() => {
      cy.get('[data-testid="favorite-btn"]').click()
    })
    cy.visit('/favorites/')
    cy.get('[data-testid="store-favorites-section"]').within(() => {
      // Confirm the store card is there, then unfavorite it
      cy.get('[data-testid="store-card"]', { timeout: 15000 }).should('have.length.greaterThan', 0)
      cy.get('[data-testid="favorite-btn"]').first().click()
      // Section should return to empty state
      cy.get('[data-testid="favorites-empty-msg"]', { timeout: 10000 }).should('be.visible')
    })
  })
})
