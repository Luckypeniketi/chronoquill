import { test, expect } from '@playwright/test';

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should add a new todo', async ({ page }) => {
    // Take screenshot of initial state
    await page.screenshot({ path: 'docs/assets/v1.0.0/initial-state.png' });

    // Add a new todo
    await page.fill('input[type="text"]', 'Test todo item');
    await page.click('button:has-text("Add")');

    // Take screenshot after adding todo
    await page.screenshot({ path: 'docs/assets/v1.0.0/after-adding-todo.png' });

    // Verify the todo was added
    const todoText = await page.textContent('li:first-child span');
    expect(todoText).toBe('Test todo item');
  });

  test('should toggle todo completion', async ({ page }) => {
    // Add a todo first
    await page.fill('input[type="text"]', 'Test todo item');
    await page.click('button:has-text("Add")');

    // Toggle the todo
    await page.click('input[type="checkbox"]');

    // Take screenshot after toggling
    await page.screenshot({ path: 'docs/assets/v1.0.0/after-toggling-todo.png' });

    // Verify the todo is completed
    const todoItem = await page.locator('li:first-child span');
    await expect(todoItem).toHaveClass(/line-through/);
  });

  test('should delete a todo', async ({ page }) => {
    // Add a todo first
    await page.fill('input[type="text"]', 'Test todo item');
    await page.click('button:has-text("Add")');

    // Delete the todo
    await page.click('button:has-text("Delete")');

    // Take screenshot after deletion
    await page.screenshot({ path: 'docs/assets/v1.0.0/after-deleting-todo.png' });

    // Verify the todo was deleted
    const todoCount = await page.locator('li').count();
    expect(todoCount).toBe(0);
  });
}); 