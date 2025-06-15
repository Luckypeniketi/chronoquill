import { test } from '@playwright/test';
import fs from 'fs';

test('homepage screenshot', async ({ page }) => {
  // Ensure the screenshots directory exists
  fs.mkdirSync('docs/screenshots', { recursive: true });
  await page.goto('http://localhost:3000');
  await page.screenshot({ path: 'docs/screenshots/homepage.png', fullPage: true });
}); 