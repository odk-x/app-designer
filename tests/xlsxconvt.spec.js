const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test('XLSX Converter should upload XLSX and download JSON formDef', async ({ page }) => {
    await page.goto('http://localhost:8000/index.html', { waitUntil: 'networkidle' });

    const converterButton = page.getByRole('button', { name: /XLSX Converter/i });
    await converterButton.waitFor({ state: 'visible', timeout: 60000 });
    await converterButton.click();

    await page.waitForSelector('#tab3', { timeout: 30000 });
    const outerFrame = page.frameLocator('#tab3');

    await outerFrame.locator('#xlsxscreen').waitFor({ state: 'attached', timeout: 30000 });
    const innerFrame = outerFrame.frameLocator('#xlsxscreen');

    await page.waitForTimeout(3000);

    const filePath = path.join(__dirname, 'assets', 'census.xlsx');

    const fileInputs = await innerFrame.locator('input[type="file"]').count({ timeout: 10000 });

    if (fileInputs > 0) {
        const fileInput = innerFrame.locator('input[type="file"]').first();
        await fileInput.setInputFiles(filePath);
    } else {
        const chooseFileButton = innerFrame.getByRole('button', { name: 'Choose File' });
        await chooseFileButton.waitFor({ state: 'visible', timeout: 10000 });
        await chooseFileButton.setInputFiles(filePath);
    }

    page.once('dialog', async dialog => {
        await dialog.dismiss().catch(() => { });
    });

    await page.waitForTimeout(2000);

    const saveToFileSystemButton = innerFrame.getByRole('button', { name: /Save to File System/i });
    await saveToFileSystemButton.waitFor({ state: 'visible', timeout: 15000 });
    await saveToFileSystemButton.click();

    const downloadPromise = page.waitForEvent('download');

    const saveButton = innerFrame.getByRole('button', { name: /^Save$/i });
    await saveButton.waitFor({ state: 'visible', timeout: 10000 });
    await saveButton.click();

    const download = await downloadPromise;

    const outputsDir = path.join(__dirname, 'outputs');
    if (!fs.existsSync(outputsDir)) {
        fs.mkdirSync(outputsDir);
    }

    const savePath = path.join(outputsDir, 'census_converted_formDef.json');
    await download.saveAs(savePath);

    expect(download.suggestedFilename()).toMatch(/\.json$/);
});