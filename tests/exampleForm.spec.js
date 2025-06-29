const { test, expect } = require('@playwright/test');

test('test', async ({ page }) => {
  await page.goto('http://localhost:8000/index.html');

  // Using consistent iframe selector throughout
  const mainFrame = page.locator('#tab1').contentFrame();
  const screenFrame = mainFrame.locator('#previewscreen').contentFrame();

  // Initial navigation
  await mainFrame.locator('iframe[name="screen"]').contentFrame().getByRole('link', { name: 'exampleForm ' }).click();
  await mainFrame.locator('iframe[name="screen"]').contentFrame().getByRole('button', { name: 'Follow link' }).click();

  // Form interactions - using specific selectors for Next buttons
  await screenFrame.getByRole('button', { name: 'Create new instance ' }).click();

  await screenFrame.locator('.odk-next-btn').first().click();

  await screenFrame.getByRole('spinbutton', { name: 'Enter an initial rating (1-10' }).click();
  await screenFrame.getByRole('spinbutton', { name: 'Enter an initial rating (1-10' }).fill('5');

  await screenFrame.locator('.odk-next-btn').first().click();

  await screenFrame.getByRole('checkbox', { name: 'computed assignment of' }).check();

  await screenFrame.locator('.odk-next-btn').first().click();

  await screenFrame.getByRole('spinbutton', { name: 'On average, how many cups of' }).click();
  await screenFrame.getByRole('spinbutton', { name: 'On average, how many cups of' }).fill('4');

  await screenFrame.locator('.odk-next-btn').first().click();
  await screenFrame.locator('.odk-next-btn').first().click();
  await screenFrame.locator('.odk-next-btn').first().click();

  await screenFrame.getByRole('button', { name: 'Finalize' }).click();

  await screenFrame.locator('.odk-next-btn').first().click();
});