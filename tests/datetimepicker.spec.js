const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000/index.html';

test('DateTime Picker Flow', async ({ page }) => {
    page.setDefaultTimeout(30000);

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    await page.locator('#tab1').contentFrame().locator('iframe[name="screen"]').contentFrame().getByRole('link', { name: 'DateTime Picker ' }).click();
    await page.locator('#tab1').contentFrame().locator('iframe[name="screen"]').contentFrame().getByRole('button', { name: 'Follow link' }).click();

    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('button', { name: 'Create new instance ' }).click();
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByText('Next').first().click();

    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('combobox').first().selectOption('2025');
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('combobox').nth(1).selectOption('0');
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('combobox').nth(2).selectOption('1');
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByText('Next').first().click();

    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('combobox').first().selectOption('2025');
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('combobox').nth(1).selectOption('7');
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('combobox').nth(2).selectOption('1');
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('combobox').nth(3).selectOption('1');
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('combobox').nth(4).selectOption('0');
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByText('Next').first().click();

    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('combobox').first().selectOption('2025');
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('combobox').nth(1).selectOption('7');
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('combobox').nth(2).selectOption('23');
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByText('Next').first().click();

    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('combobox').first().selectOption('0');
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('combobox').nth(1).selectOption('0');
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByText('Next').first().click();

    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('textbox', { name: 'Ethiopian Calendar' }).click();
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('link', { name: '7', exact: true }).click();
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByText('Next').first().click();

    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('textbox', { name: 'Islamic Calendar' }).click();
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('link', { name: '9', exact: true }).click();
    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByText('Next').first().click();

    await page.locator('#tab1').contentFrame().locator('#previewscreen').contentFrame().getByRole('button', { name: 'Finalize' }).click();

    console.log('Test completed successfully!');
});