// Product Page Suite
// Uses cy.goToFirstProduct() which logs in, searches zip 92025, clicks
// the first store, then clicks the first product card.

describe('Product Page', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.goToFirstProduct()
  })

  it('renders product name, brand, and price', () => {
    cy.get('[data-testid="product-name"]').should('not.be.empty')
    cy.get('[data-testid="product-brand"]').should('not.be.empty')
    cy.get('[data-testid="product-price"]').should('be.visible')
  })

  it('clicking a thumbnail updates the main image', () => {
    cy.get('[data-testid="main-image"]').invoke('attr', 'src').then(initialSrc => {
      cy.get('[data-testid="thumbnail"]').then($thumbs => {
        const withImage = [...$thumbs].filter(btn => btn.querySelector('img') && btn.querySelector('img').src !== initialSrc)
        if (withImage.length > 0) {
          cy.wrap(withImage[0]).click()
          cy.get('[data-testid="main-image"]').invoke('attr', 'src').should('not.eq', initialSrc)
        } else {
          // Product only has one image — verify thumbnail renders without error
          cy.get('[data-testid="thumbnail"]').first().should('be.visible')
        }
      })
    })
  })

  it('vegan badge button is visible on the product image', () => {
    cy.get('[data-testid="vegan-badge-btn"]').should('be.visible')
  })

  it('add to list button shows confirmation feedback', () => {
    cy.get('[data-testid="add-to-list-btn"]').click()
    cy.get('[data-testid="add-to-list-btn"]').should('contain.text', 'added!')
  })

  it('favorite button toggles state', () => {
    cy.get('[data-testid="favorite-btn"]')
      .should('have.attr', 'aria-label', 'Add to favorites')
      .click()
    cy.get('[data-testid="favorite-btn"]')
      .should('have.attr', 'aria-label', 'Remove from favorites')
  })
})
