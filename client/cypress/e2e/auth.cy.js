// Auth Suite
// NOTE: The signup test creates test@t.com on first run.
// To re-run cleanly, delete the user first:
//   docker compose exec backend python manage.py shell -c "from users_app.models import AppUser; AppUser.objects.filter(email='test@t.com').delete()"

const EMAIL = 'test@t.com'
const PASSWORD = 'password'

describe('Authentication', () => {
  beforeEach(() => {
    cy.clearCookies()
  })

  it('renders the login page with Log In tab active by default', () => {
    cy.visit('/')
    cy.get('[data-testid="submit-btn"]').should('contain.text', 'Log In')
    cy.get('[data-testid="email-input"]').should('be.visible')
    cy.get('[data-testid="password-input"]').should('be.visible')
  })

  it('switches between Log In and Create Account tabs', () => {
    cy.visit('/')
    cy.get('[data-testid="submit-btn"]').should('contain.text', 'Log In')
    cy.get('[data-testid="tab-signup"]').click()
    cy.get('[data-testid="submit-btn"]').should('contain.text', 'Create Account')
    cy.get('[data-testid="tab-login"]').click()
    cy.get('[data-testid="submit-btn"]').should('contain.text', 'Log In')
  })

  it('creates a new account and redirects to /about', () => {
    cy.visit('/')
    cy.get('[data-testid="tab-signup"]').click()
    cy.get('[data-testid="email-input"]').type(EMAIL)
    cy.get('[data-testid="password-input"]').type(PASSWORD)
    cy.get('[data-testid="submit-btn"]').click()
    cy.location('pathname').should('eq', '/about')
  })

  it('shows error when signing up with an already registered email', () => {
    cy.visit('/')
    cy.get('[data-testid="tab-signup"]').click()
    cy.get('[data-testid="email-input"]').type(EMAIL)
    cy.get('[data-testid="password-input"]').type(PASSWORD)
    cy.get('[data-testid="submit-btn"]').click()
    cy.get('[data-testid="auth-error"]').should('be.visible')
    cy.location('pathname').should('eq', '/')
  })

  it('logs in with valid credentials and redirects to /about', () => {
    cy.visit('/')
    cy.get('[data-testid="email-input"]').type(EMAIL)
    cy.get('[data-testid="password-input"]').type(PASSWORD)
    cy.get('[data-testid="submit-btn"]').click()
    cy.location('pathname').should('eq', '/about')
  })

  it('shows error with an incorrect password', () => {
    cy.visit('/')
    cy.get('[data-testid="email-input"]').type(EMAIL)
    cy.get('[data-testid="password-input"]').type('wrongpassword')
    cy.get('[data-testid="submit-btn"]').click()
    cy.get('[data-testid="auth-error"]').should('be.visible')
    cy.location('pathname').should('eq', '/')
  })

  it('logs out and returns to the login page', () => {
    cy.visit('/')
    cy.get('[data-testid="email-input"]').type(EMAIL)
    cy.get('[data-testid="password-input"]').type(PASSWORD)
    cy.get('[data-testid="submit-btn"]').click()
    cy.location('pathname').should('eq', '/about')

    cy.get('[data-testid="menu-btn"]').click()
    cy.get('[data-testid="logout-btn"]').should('be.visible').click()

    cy.location('pathname').should('eq', '/')
    cy.get('[data-testid="email-input"]').should('be.visible')
  })

  it('shows authenticated nav links and hides login/signup after logging in', () => {
    cy.visit('/')
    cy.get('[data-testid="email-input"]').type(EMAIL)
    cy.get('[data-testid="password-input"]').type(PASSWORD)
    cy.get('[data-testid="submit-btn"]').click()
    cy.location('pathname').should('eq', '/about')

    cy.get('[data-testid="menu-btn"]').click()
    cy.get('[data-testid="nav-home"]').should('be.visible')
    cy.get('[data-testid="nav-compare"]').should('be.visible')
    cy.get('[data-testid="nav-favorites"]').should('be.visible')
    cy.get('[data-testid="logout-btn"]').should('be.visible')
    cy.get('[data-testid="nav-login"]').should('not.exist')
    cy.get('[data-testid="nav-signup"]').should('not.exist')
  })

  it('shows login/signup nav links when not authenticated', () => {
    cy.visit('/')
    cy.get('[data-testid="menu-btn"]').click()
    cy.get('[data-testid="nav-login"]').should('be.visible')
    cy.get('[data-testid="nav-signup"]').should('be.visible')
    cy.get('[data-testid="logout-btn"]').should('not.exist')
  })
})
