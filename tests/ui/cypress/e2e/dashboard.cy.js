describe('Dashboard Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads the dashboard page', () => {
    cy.contains('Dashboard').should('be.visible');
  });

  it('displays navigation links', () => {
    cy.contains('Dashboard').should('exist');
    cy.contains('Account').should('exist');
    cy.contains('Transfer').should('exist');
  });

  it('shows account summary cards', () => {
    cy.get('[data-testid="account-card"]').should('have.length.at.least', 1);
  });
});
