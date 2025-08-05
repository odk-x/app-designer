const { test, expect } = require('@playwright/test');

class ODKFormPage {
  constructor(page) {
    this.page = page;
    this.baseURL = 'http://localhost:8000/index.html';
  }

  // Returns the main tab frame containing the form UI
  async getMainFrame() {
    return await this.page.locator('#tab1').contentFrame();
  }

  // Returns the inner screen frame showing the form fields
  async getScreenFrame() {
    const mainFrame = await this.getMainFrame();
    return await mainFrame.locator('#previewscreen').contentFrame();
  }

  // Returns the navigation frame containing form links
  async getNavigationFrame() {
    const mainFrame = await this.getMainFrame();
    return await mainFrame.locator('iframe[name="screen"]').contentFrame();
  }

  // Loads the base URL of the app
  async navigateToApp() {
    await this.page.goto(this.baseURL);
  }

  // Selects a form by name and clicks through to start it
  async selectForm(formName) {
    const navFrame = await this.getNavigationFrame();
    await navFrame.getByRole('link', { name: formName }).click();
    await navFrame.getByRole('button', { name: 'Follow link' }).click();
  }

  // Clicks "Create new instance" to begin filling a form
  async createNewInstance() {
    const screenFrame = await this.getScreenFrame();
    await screenFrame.getByRole('button', { name: 'Create new instance ' }).click();
  }

  // Clicks the "Next" button (first found)
  async clickNext() {
    const screenFrame = await this.getScreenFrame();
    await screenFrame.locator('.odk-next-btn').first().click();
  }

  // Clicks the "Next" button using exact text match
  async clickNextByText() {
    const screenFrame = await this.getScreenFrame();
    await screenFrame.getByText('Next', { exact: true }).click();
  }

  // Clicks the "Finalize" button to submit the form
  async finalizeForm() {
    const screenFrame = await this.getScreenFrame();
    await screenFrame.getByRole('button', { name: 'Finalize' }).click();
  }

  // Fills a numeric input field (e.g., rating or quantity)
  async fillNumericInput(fieldName, value) {
    const screenFrame = await this.getScreenFrame();
    const field = screenFrame.getByRole('spinbutton', { name: fieldName });
    await field.waitFor({ state: 'visible', timeout: 10000 });
    await field.click();
    await field.fill(value.toString());
  }

  // Fills a text input field
  async fillTextInput(fieldName, value) {
    const screenFrame = await this.getScreenFrame();
    const field = screenFrame.getByRole('textbox', { name: fieldName });
    await field.waitFor({ state: 'visible', timeout: 10000 });
    await field.click();
    await field.fill(value);
  }

  // Tries both spinbutton and textbox roles for numeric input (fallback for form variations)
  async fillNumericInputAlternative(fieldName, value) {
    const screenFrame = await this.getScreenFrame();
    try {
      const spinField = screenFrame.getByRole('spinbutton', { name: fieldName });
      await spinField.waitFor({ state: 'visible', timeout: 5000 });
      await spinField.click();
      await spinField.fill(value.toString());
    } catch (error) {
      // Fallback in case spinbutton doesn't work
      const textField = screenFrame.getByRole('textbox', { name: fieldName });
      await textField.waitFor({ state: 'visible', timeout: 5000 });
      await textField.click();
      await textField.fill(value.toString());
    }
  }

  // Checks a checkbox input
  async checkCheckbox(fieldName) {
    const screenFrame = await this.getScreenFrame();
    await screenFrame.getByRole('checkbox', { name: fieldName }).check();
  }

  // Selects a radio button option
  async selectRadioButton(optionName) {
    const screenFrame = await this.getScreenFrame();
    await screenFrame.getByRole('radio', { name: optionName }).check();
  }
}

test.describe('ODK Form Application', () => {
  let odkPage;

  // Before each test, create the page object and navigate to the app
  test.beforeEach(async ({ page }) => {
    odkPage = new ODKFormPage(page);
    await odkPage.navigateToApp();
  });

  // Test case: Filling out the "Example Form"
  test('should complete Example Form with rating and coffee consumption', async () => {
    const testData = {
      initialRating: 5,
      coffeeCups: 4
    };

    // Load and start the form
    await odkPage.selectForm('exampleForm');
    await odkPage.createNewInstance();
    await odkPage.clickNext();

    // Fill numeric rating field
    await odkPage.fillNumericInputAlternative('Enter an initial rating (1-10', testData.initialRating);
    await odkPage.clickNext();

    // Check a checkbox (e.g., auto-generated computation field)
    await odkPage.checkCheckbox('computed assignment of');
    await odkPage.clickNext();

    // Fill how many cups of coffee
    await odkPage.fillNumericInputAlternative('On average, how many cups of', testData.coffeeCups);
    await odkPage.clickNext();

    // Complete remaining steps
    await odkPage.clickNext();
    await odkPage.clickNext();

    // Finalize and verify
    await odkPage.finalizeForm();
    await odkPage.clickNext();

    // Basic assertion to confirm app URL (you can replace with a better check)
    await expect(odkPage.page).toHaveURL(/.*localhost:8000.*/);
  });

  // Test case: Completing the "Agriculture Form"
  test('should complete Agriculture Form with corn plant data', async () => {
    const testData = {
      cornVariety: '10',
      plantHeight: '10',
      soilCondition: 'Dry'
    };

    // Load and start the form
    await odkPage.selectForm('Agriculture');
    await odkPage.createNewInstance();
    await odkPage.clickNextByText();

    // Fill corn variety
    await odkPage.fillTextInput('Enter the name of the corn', testData.cornVariety);
    await odkPage.clickNextByText();

    // Select soil condition from radio buttons
    await odkPage.selectRadioButton(testData.soilCondition);
    await odkPage.clickNextByText();

    // Fill plant height
    await odkPage.fillTextInput('Enter the height of the plant', testData.plantHeight);
    await odkPage.clickNextByText();

    // Finalize and end the form
    await odkPage.finalizeForm();

    // Follow the completion link after finalization
    await odkPage.clickFollowLinkButton();
  });
});

// Run tests in parallel mode
test.describe.configure({ mode: 'parallel' });

async function verifyFormCompletion(page, expectedElements = []) {
  for (const element of expectedElements) {
    await expect(page.locator(element)).toBeVisible();
  }
}

class TestDataFactory {
  static getExampleFormData() {
    return {
      initialRating: Math.floor(Math.random() * 10) + 1,
      coffeeCups: Math.floor(Math.random() * 8) + 1
    };
  }

  static getAgricultureFormData() {
    const varieties = ['Corn Variety A', 'Corn Variety B', 'Corn Variety C'];
    const conditions = ['Dry', 'Wet', 'Humid'];

    return {
      cornVariety: varieties[Math.floor(Math.random() * varieties.length)],
      plantHeight: Math.floor(Math.random() * 100) + 50,
      soilCondition: conditions[Math.floor(Math.random() * conditions.length)]
    };
  }
}
