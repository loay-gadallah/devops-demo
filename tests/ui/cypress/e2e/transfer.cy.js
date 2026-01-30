describe('Transfer Page', () => {
  beforeEach(() => {
    cy.visit('/transfer');
  });

  it('displays the transfer form', () => {
    cy.contains('Fund Transfer').should('be.visible');
  });

  it('has required form fields', () => {
    cy.get('[name="fromAccount"], label').contains('From Account');
    cy.get('[name="toAccount"], label').contains('To Account');
    cy.get('[name="amount"], label').contains('Amount');
  });

  it('shows validation error on empty submit', () => {
    cy.contains('Submit Transfer').click();
    cy.get('[role="alert"]').should('be.visible');
  });
});
