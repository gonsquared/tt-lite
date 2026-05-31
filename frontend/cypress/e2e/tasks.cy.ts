/// <reference types="cypress" />

/**
 * E2E tests for Task Tracker Lite — covers the 6 critical user flows.
 *
 * Selector strategy:
 *   - data-testid="task-input"      → TaskForm text input
 *   - data-testid="add-task-btn"    → TaskForm submit button
 *   - aria-label selectors          → filter buttons, checkbox, title button, delete button
 *
 * Each test starts with a clean task list via clearAllTasksViaApi().
 */

describe('Task Tracker Lite — Critical User Flows', () => {
  beforeEach(() => {
    cy.clearAllTasksViaApi();
    cy.visit('/');
  });

  // ─────────────────────────────────────────────────────────────────
  // Flow 1: Create a task via the UI form
  // ─────────────────────────────────────────────────────────────────
  describe('1. Create a task', () => {
    it('adds a new task and displays it in the list', () => {
      const title = 'Buy oat milk';

      cy.get('[data-testid="task-input"]').type(title);
      cy.get('[data-testid="add-task-btn"]').click();

      // Input is cleared after submit
      cy.get('[data-testid="task-input"]').should('have.value', '');

      // Task appears with the correct title
      cy.get('button[aria-label="Edit task: Buy oat milk"]').should(
        'contain.text',
        title,
      );
    });

    it('does not add a task when the input is empty and shows a validation error', () => {
      cy.get('[data-testid="add-task-btn"]').click();

      cy.get('[role="alert"]').should('contain.text', 'Task title cannot be empty');
      cy.get('ul').should('not.exist');
    });

    it('trims whitespace and does not create a blank task', () => {
      cy.get('[data-testid="task-input"]').type('   ');
      cy.get('[data-testid="add-task-btn"]').click();

      cy.get('[role="alert"]').should('contain.text', 'Task title cannot be empty');
    });

    it('submits the form when Enter is pressed in the input', () => {
      cy.get('[data-testid="task-input"]').type('Press enter task{enter}');

      cy.get('button[aria-label="Edit task: Press enter task"]').should(
        'contain.text',
        'Press enter task',
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // Flow 2: Edit a task inline
  // ─────────────────────────────────────────────────────────────────
  describe('2. Edit a task', () => {
    beforeEach(() => {
      cy.createTaskViaApi('Original title');
      cy.reload();
    });

    it('enters edit mode when the task title is clicked', () => {
      cy.get('button[aria-label="Edit task: Original title"]').click();

      cy.get('input[aria-label="Edit task: Original title"]').should('be.visible');
    });

    it('saves the updated title on Enter and exits edit mode', () => {
      cy.get('button[aria-label="Edit task: Original title"]').click();
      cy.get('input[aria-label="Edit task: Original title"]')
        .clear()
        .type('Updated title{enter}');

      // The new title button is shown; old one is gone
      cy.get('button[aria-label="Edit task: Updated title"]').should(
        'contain.text',
        'Updated title',
      );
      cy.get('button[aria-label="Edit task: Original title"]').should('not.exist');
    });

    it('saves the updated title on blur', () => {
      cy.get('button[aria-label="Edit task: Original title"]').click();
      cy.get('input[aria-label="Edit task: Original title"]')
        .clear()
        .type('Blurred title');
      // Blur by clicking away
      cy.get('[data-testid="task-input"]').click();

      cy.get('button[aria-label="Edit task: Blurred title"]').should(
        'contain.text',
        'Blurred title',
      );
    });

    it('cancels the edit on Escape and restores the original title', () => {
      cy.get('button[aria-label="Edit task: Original title"]').click();
      cy.get('input[aria-label="Edit task: Original title"]')
        .clear()
        .type('Discarded{esc}');

      // Original title button is back; no inline input remains
      cy.get('button[aria-label="Edit task: Original title"]').should(
        'contain.text',
        'Original title',
      );
      cy.get('input[aria-label="Edit task: Original title"]').should('not.exist');
    });

    it('does not save when the input is cleared to blank (reverts to original)', () => {
      cy.get('button[aria-label="Edit task: Original title"]').click();
      cy.get('input[aria-label="Edit task: Original title"]')
        .clear()
        .type('{enter}');

      cy.get('button[aria-label="Edit task: Original title"]').should(
        'contain.text',
        'Original title',
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // Flow 3: Mark a task as completed
  // ─────────────────────────────────────────────────────────────────
  describe('3. Mark task as completed', () => {
    beforeEach(() => {
      cy.createTaskViaApi('Finish report');
      cy.reload();
    });

    it('checks the checkbox and shows the title with strikethrough', () => {
      cy.get('input[aria-label="Mark \'Finish report\' as complete"]').check();

      // The title button should now carry the completed style class
      cy.get('button[aria-label="Edit task: Finish report"]').should(
        'have.css',
        'text-decoration-line',
        'line-through',
      );

      // Checkbox is now checked
      cy.get('input[aria-label="Mark \'Finish report\' as active"]').should(
        'be.checked',
      );
    });

    it('unchecks a completed task and removes the strikethrough', () => {
      // Mark as complete via API so the UI renders it completed
      cy.createTaskViaApi('Completed already');
      cy.reload();
      // Toggle to complete via UI
      cy.get('input[aria-label="Mark \'Completed already\' as complete"]').check();

      // Now uncheck
      cy.get(
        'input[aria-label="Mark \'Completed already\' as active"]',
      ).uncheck();

      cy.get('button[aria-label="Edit task: Completed already"]').should(
        'not.have.css',
        'text-decoration-line',
        'line-through',
      );
    });

    it('completed task appears under the Completed filter', () => {
      cy.get('input[aria-label="Mark \'Finish report\' as complete"]').check();

      cy.get('button[aria-pressed="false"]').contains('Completed').click();

      cy.get('button[aria-label="Edit task: Finish report"]').should('exist');
    });

    it('completed task is hidden under the Active filter', () => {
      cy.get('input[aria-label="Mark \'Finish report\' as complete"]').check();

      cy.get('button[aria-pressed="false"]').contains('Active').click();

      cy.get('button[aria-label="Edit task: Finish report"]').should('not.exist');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // Flow 4: Delete a task
  // ─────────────────────────────────────────────────────────────────
  describe('4. Delete a task', () => {
    beforeEach(() => {
      cy.createTaskViaApi('Task to delete');
      cy.reload();
    });

    it('removes the task from the list when Delete is clicked', () => {
      cy.get('button[aria-label="Delete task: Task to delete"]').click();

      cy.get('button[aria-label="Edit task: Task to delete"]').should('not.exist');
    });

    it('shows empty state after the last task is deleted', () => {
      cy.get('button[aria-label="Delete task: Task to delete"]').click();

      // After deleting the only task the list should be gone or show empty state
      cy.get('button[aria-label="Edit task: Task to delete"]').should('not.exist');
      cy.get('ul').should('not.exist');
    });

    it('only removes the targeted task when multiple tasks exist', () => {
      cy.createTaskViaApi('Keep me');
      cy.reload();

      cy.get('button[aria-label="Delete task: Task to delete"]').click();

      cy.get('button[aria-label="Edit task: Task to delete"]').should('not.exist');
      cy.get('button[aria-label="Edit task: Keep me"]').should('exist');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // Flow 5: Filter tasks (All / Active / Completed)
  // ─────────────────────────────────────────────────────────────────
  describe('5. Filter tasks', () => {
    beforeEach(() => {
      cy.createTaskViaApi('Active task');
      cy.createTaskViaApi('Done task');
      cy.reload();

      // Mark "Done task" as completed via the UI
      cy.get('input[aria-label="Mark \'Done task\' as complete"]').check();
    });

    it('All filter shows every task', () => {
      // All is the default; both tasks should be visible
      cy.get('button[aria-label="Edit task: Active task"]').should('exist');
      cy.get('button[aria-label="Edit task: Done task"]').should('exist');
    });

    it('Active filter shows only incomplete tasks', () => {
      cy.get('button[aria-pressed="false"]').contains('Active').click();

      cy.get('button[aria-label="Edit task: Active task"]').should('exist');
      cy.get('button[aria-label="Edit task: Done task"]').should('not.exist');
    });

    it('Completed filter shows only completed tasks', () => {
      cy.get('button[aria-pressed="false"]').contains('Completed').click();

      cy.get('button[aria-label="Edit task: Done task"]').should('exist');
      cy.get('button[aria-label="Edit task: Active task"]').should('not.exist');
    });

    it('switching back to All shows both tasks again', () => {
      cy.get('button[aria-pressed="false"]').contains('Active').click();
      cy.get('button[aria-pressed="false"]').contains('All').click();

      cy.get('button[aria-label="Edit task: Active task"]').should('exist');
      cy.get('button[aria-label="Edit task: Done task"]').should('exist');
    });

    it('active filter button is marked as pressed', () => {
      cy.get('button').contains('Active').click();

      cy.get('button').contains('Active').should('have.attr', 'aria-pressed', 'true');
      cy.get('button').contains('All').should('have.attr', 'aria-pressed', 'false');
      cy.get('button').contains('Completed').should('have.attr', 'aria-pressed', 'false');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // Flow 6: Persistence — tasks survive a page reload
  // ─────────────────────────────────────────────────────────────────
  describe('6. Persistence across page reload', () => {
    it('a task created via the UI is still present after reload', () => {
      const title = 'Persisted task';

      cy.get('[data-testid="task-input"]').type(title);
      cy.get('[data-testid="add-task-btn"]').click();
      cy.get('button[aria-label="Edit task: Persisted task"]').should('exist');

      cy.reload();

      cy.get('button[aria-label="Edit task: Persisted task"]').should(
        'contain.text',
        title,
      );
    });

    it('completed state persists after reload', () => {
      cy.createTaskViaApi('Persistent completed');
      cy.reload();

      cy.get(
        'input[aria-label="Mark \'Persistent completed\' as complete"]',
      ).check();

      cy.reload();

      // After reload the checkbox should still be checked
      cy.get(
        'input[aria-label="Mark \'Persistent completed\' as active"]',
      ).should('be.checked');
      cy.get('button[aria-label="Edit task: Persistent completed"]').should(
        'have.css',
        'text-decoration-line',
        'line-through',
      );
    });

    it('deleted task does not reappear after reload', () => {
      cy.createTaskViaApi('Gone after reload');
      cy.reload();

      cy.get('button[aria-label="Delete task: Gone after reload"]').click();
      cy.reload();

      cy.get('button[aria-label="Edit task: Gone after reload"]').should(
        'not.exist',
      );
    });
  });
});
