/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Create a task via the API (bypasses UI for faster test setup).
       */
      createTaskViaApi(title: string): Chainable<void>;

      /**
       * Delete every task via the API. Call in beforeEach for test isolation.
       */
      clearAllTasksViaApi(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('createTaskViaApi', (title: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/tasks`,
    body: { title },
    headers: { 'Content-Type': 'application/json' },
  });
});

Cypress.Commands.add('clearAllTasksViaApi', () => {
  cy.request<{ id: string }[]>({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/api/tasks`,
  }).then((response) => {
    response.body.forEach((task) => {
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('apiUrl')}/api/tasks/${task.id}`,
        failOnStatusCode: false,
      });
    });
  });
});

export {};
