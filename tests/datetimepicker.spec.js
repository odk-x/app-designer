const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000/index.html';
const DEFAULT_TIMEOUT = 30000;

const TEST_YEAR = new Date().getFullYear().toString();
const JANUARY = '0';
const AUGUST = '7';
const FIRST_DAY = '1';
const HOUR_23 = '23';
const ETHIOPIAN_DAY_7 = '7';
const ISLAMIC_DAY_9 = '9';

async function getTab1Frame(page) {
    return await page.locator('#tab1').contentFrame();
}

async function getScreenFrame(page) {
    const tab1Frame = await getTab1Frame(page);
    return await tab1Frame.locator('iframe[name="screen"]').contentFrame();
}

async function getPreviewScreenFrame(page) {
    const tab1Frame = await getTab1Frame(page);
    return await tab1Frame.locator('#previewscreen').contentFrame();
}

async function clickNext(frame) {
    await frame.getByText('Next').first().click();
}

async function selectDateTime(frame, year, month, day, hour = null, minute = null) {
    await frame.getByRole('combobox').first().selectOption(year);
    await frame.getByRole('combobox').nth(1).selectOption(month);
    await frame.getByRole('combobox').nth(2).selectOption(day);

    if (hour !== null) {
        await frame.getByRole('combobox').nth(3).selectOption(hour);
    }

    if (minute !== null) {
        await frame.getByRole('combobox').nth(4).selectOption(minute);
    }
}

test('DateTime Picker Flow', async ({ page }) => {
    page.setDefaultTimeout(DEFAULT_TIMEOUT);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const screenFrame = await getScreenFrame(page);
    const previewScreenFrame = await getPreviewScreenFrame(page);

    await screenFrame.getByRole('link', { name: 'DateTime Picker ' }).click();
    await screenFrame.getByRole('button', { name: 'Follow link' }).click();

    await previewScreenFrame.getByRole('button', { name: 'Create new instance ' }).click();
    await clickNext(previewScreenFrame);

    await selectDateTime(previewScreenFrame, TEST_YEAR, JANUARY, FIRST_DAY);
    await clickNext(previewScreenFrame);

    await selectDateTime(previewScreenFrame, TEST_YEAR, AUGUST, FIRST_DAY, FIRST_DAY, JANUARY);
    await clickNext(previewScreenFrame);

    await selectDateTime(previewScreenFrame, TEST_YEAR, AUGUST, HOUR_23);
    await clickNext(previewScreenFrame);

    await previewScreenFrame.getByRole('combobox').first().selectOption(JANUARY);
    await previewScreenFrame.getByRole('combobox').nth(1).selectOption(JANUARY);
    await clickNext(previewScreenFrame);

    await previewScreenFrame.getByRole('textbox', { name: 'Ethiopian Calendar' }).click();
    await previewScreenFrame.getByRole('link', { name: ETHIOPIAN_DAY_7, exact: true }).click();
    await clickNext(previewScreenFrame);

    await previewScreenFrame.getByRole('textbox', { name: 'Islamic Calendar' }).click();
    await previewScreenFrame.getByRole('link', { name: ISLAMIC_DAY_9, exact: true }).click();
    await clickNext(previewScreenFrame);

    await previewScreenFrame.getByRole('button', { name: 'Finalize' }).click();

    await page.waitForTimeout(2000);
});
