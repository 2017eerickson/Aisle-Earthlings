// Compare Page Suite
// Zip 92025 is used for all store searches.
// Store searches are needed to populate the panel store-selection lists.

const ZIP = '92025'

function loginAndVisitCompare() {
  cy.login()
  cy.visit('/compare/')
}

function searchZipAndOpenPanels() {
  cy.get('[data-testid="zipcode-input"]').type(ZIP)
  cy.get('[data-testid="zipcode-search-btn"]').click()
  // Searching zip puts all 4 panels into editing mode
  cy.get('[data-testid="store-option"]', { timeout: 10000 }).should('have.length.greaterThan', 0)
}

function addStoreToPanel(panelIndex, storeOptionIndex = 0) {
  cy.get('[data-testid="store-panel"]').eq(panelIndex).within(() => {
    cy.get('[data-testid="store-option"]').eq(storeOptionIndex).click()
  })
}

describe('Compare Page', () => {
  beforeEach(() => {
    cy.clearCookies()
  })

  it('renders 4 empty panels on load', () => {
    loginAndVisitCompare()
    cy.get('[data-testid="store-panel"]').should('have.length', 4)
    cy.get('[data-testid="select-store-btn"]').should('have.length', 4)
  })

  it('adding a store to a panel exits editing mode and shows the store name', () => {
    loginAndVisitCompare()
    searchZipAndOpenPanels()
    addStoreToPanel(0, 0)
    cy.get('[data-testid="store-panel"]').eq(0).within(() => {
      cy.get('[data-testid="panel-store-name"]').should('not.have.text', 'NO STORE')
    })
  })

  it('clicking the edit button on a populated panel returns it to editing mode', () => {
    loginAndVisitCompare()
    searchZipAndOpenPanels()
    addStoreToPanel(0, 0)
    // Panel 0 is now populated — click the pencil to re-enter editing
    cy.get('[data-testid="store-panel"]').eq(0).within(() => {
      cy.get('[data-testid="panel-edit-btn"]').click()
      // Editing mode shows store options again
      cy.get('[data-testid="store-option"]', { timeout: 10000 }).should('have.length.greaterThan', 0)
    })
  })

  it('individual panel search filters products within that panel only', () => {
    loginAndVisitCompare()
    searchZipAndOpenPanels()
    addStoreToPanel(0, 0)
    cy.get('[data-testid="store-panel"]').eq(0).within(() => {
      cy.get('[data-testid="product-card"]', { timeout: 15000 }).should('have.length.greaterThan', 0)
      cy.get('[data-testid="panel-search-input"]').type('apple')
      cy.get('[data-testid="panel-search-btn"]').click()
      cy.get('[data-testid="product-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0)
    })
    // Other panels are unaffected — panel 1 still shows no store
    cy.get('[data-testid="store-panel"]').eq(1).within(() => {
      cy.get('[data-testid="product-card"]').should('not.exist')
    })
  })

  it('global search triggers product refresh across all panels with stores', () => {
    loginAndVisitCompare()
    searchZipAndOpenPanels()
    addStoreToPanel(0, 0)
    addStoreToPanel(1, 1)
    cy.get('[data-testid="store-panel"]').eq(0).within(() => {
      cy.get('[data-testid="product-card"]', { timeout: 15000 }).should('have.length.greaterThan', 0)
    })
    cy.get('[data-testid="store-panel"]').eq(1).within(() => {
      cy.get('[data-testid="product-card"]', { timeout: 15000 }).should('have.length.greaterThan', 0)
    })
    cy.get('[data-testid="global-search-input"]').type('milk')
    cy.get('[data-testid="global-search-btn"]').click()
    // Both panels reload with filtered results
    cy.get('[data-testid="store-panel"]').eq(0).within(() => {
      cy.get('[data-testid="product-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0)
    })
    cy.get('[data-testid="store-panel"]').eq(1).within(() => {
      cy.get('[data-testid="product-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0)
    })
  })

  it('products appear side-by-side in multiple populated panels', () => {
    loginAndVisitCompare()
    searchZipAndOpenPanels()
    addStoreToPanel(0, 0)
    addStoreToPanel(1, 1)
    cy.get('[data-testid="store-panel"]').eq(0).within(() => {
      cy.get('[data-testid="product-card"]', { timeout: 15000 }).should('have.length.greaterThan', 0)
    })
    cy.get('[data-testid="store-panel"]').eq(1).within(() => {
      cy.get('[data-testid="product-card"]', { timeout: 15000 }).should('have.length.greaterThan', 0)
    })
  })
})
