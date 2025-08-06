const { test, expect } = require('@playwright/test');

// Constants for URLs and selectors
const CONSTANTS = {
  BASE_URL: 'http://localhost:8000/index.html',

  // Frame selectors
  SELECTORS: {
    MAIN_TAB: '#tab1',
    PREVIEW_SCREEN: '#previewscreen',
    NAVIGATION_FRAME: 'iframe[name="screen"]',
    NEXT_BUTTON: '.odk-next-btn',
  },

  // Form names
  FORMS: {
    EXAMPLE: 'exampleForm',
    AGRICULTURE: 'Agriculture',
  },

  // Button text
  BUTTONS: {
    FOLLOW_LINK: 'Follow link',
    CREATE_NEW_INSTANCE: 'Create new instance ',
    NEXT: 'Next',
    FINALIZE: 'Finalize',
  },

  // Field labels for Example Form
  EXAMPLE_FORM_FIELDS: {
    INITIAL_RATING: 'Enter an initial rating (1-10',
    COMPUTED_ASSIGNMENT: 'computed assignment of',
    COFFEE_CUPS: 'On average, how many cups of',
  },

  // Field labels for Agriculture Form
  AGRICULTURE_FORM_FIELDS: {
    CORN_VARIETY: 'Enter the name of the corn',
    PLANT_HEIGHT: 'Enter the height of the plant',
  },

  // Soil condition options
  SOIL_CONDITIONS: {
    DRY: 'Dry',
    WET: 'Wet',
    HUMID: 'Humid',
  },

  // Test data ranges
  RANGES: {
    RATING: { MIN: 1, MAX: 10 },
    COFFEE_CUPS: { MIN: 1, MAX: 8 },
    PLANT_HEIGHT: { MIN: 50, MAX: 150 },
  },

  // URL patterns for assertions
  URL_PATTERNS: {
    LOCALHOST: /.*localhost:8000.*/,
  }
};

class ODKFormPage {
  constructor(page) {
    this.page = page;
    this.baseURL = CONSTANTS.BASE_URL;
  }

  // Returns the main tab frame containing the form UI
  async getMainFrame() {
    const mainFrameLocator = this.page.locator(CONSTANTS.SELECTORS.MAIN_TAB);
    await mainFrameLocator.waitFor({ state: 'attached', timeout: 10000 });
    return await mainFrameLocator.contentFrame();
  }

  // Returns the inner screen frame showing the form fields
  async getScreenFrame() {
    const mainFrame = await this.getMainFrame();
    const screenFrameLocator = mainFrame.locator(CONSTANTS.SELECTORS.PREVIEW_SCREEN);
    await screenFrameLocator.waitFor({ state: 'attached', timeout: 10000 });
    return await screenFrameLocator.contentFrame();
  }

  // Returns the navigation frame containing form links
  async getNavigationFrame() {
    const mainFrame = await this.getMainFrame();

    // Get all screen frames
    const screenFrames = await mainFrame.locator(CONSTANTS.SELECTORS.NAVIGATION_FRAME).all();

    // Try each frame to find the one with navigation links
    for (const frame of screenFrames) {
      try {
        const frameId = await frame.getAttribute('id');
        console.log(`Checking frame with id: ${frameId}`);

        const contentFrame = await frame.contentFrame();

        // Test if this frame has navigation links by looking for any link
        const links = await contentFrame.locator('a[role="link"], a').count();
        console.log(`Frame ${frameId} has ${links} links`);

        if (links > 0) {
          return contentFrame;
        }
      } catch (error) {
        console.log(`Error checking frame:`, error.message);
        continue;
      }
    }

    // Fallback: return the first frame's content
    console.log('Using first frame as fallback');
    return await screenFrames[0].contentFrame();
  }

  // Loads the base URL of the app
  async navigateToApp() {
    await this.page.goto(this.baseURL);
  }

  // Selects a form by name and clicks through to start it
  async selectForm(formName) {
    const navFrame = await this.getNavigationFrame();

    // Wait for the form link to be available
    const formLink = navFrame.getByRole('link', { name: formName });
    await formLink.waitFor({ state: 'visible', timeout: 10000 });
    await formLink.click();

    // Wait for the follow link button to appear
    const followButton = navFrame.getByRole('button', { name: CONSTANTS.BUTTONS.FOLLOW_LINK });
    await followButton.waitFor({ state: 'visible', timeout: 10000 });
    await followButton.click();
  }

  // Clicks "Create new instance" to begin filling a form
  async createNewInstance() {
    const screenFrame = await this.getScreenFrame();
    await screenFrame.getByRole('button', { name: CONSTANTS.BUTTONS.CREATE_NEW_INSTANCE }).click();
  }

  // Clicks the "Next" button (first found)
  async clickNext() {
    const screenFrame = await this.getScreenFrame();
    await screenFrame.locator(CONSTANTS.SELECTORS.NEXT_BUTTON).first().click();
  }

  // Clicks the "Next" button using exact text match
  async clickNextByText() {
    const screenFrame = await this.getScreenFrame();
    await screenFrame.getByText(CONSTANTS.BUTTONS.NEXT, { exact: true }).click();
  }

  // Clicks the "Finalize" button to submit the form
  async finalizeForm() {
    const screenFrame = await this.getScreenFrame();
    await screenFrame.getByRole('button', { name: CONSTANTS.BUTTONS.FINALIZE }).click();
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

  // Clicks the follow link button (for Agriculture form completion)
  async clickFollowLinkButton() {
    const navFrame = await this.getNavigationFrame();
    await navFrame.getByRole('button', { name: CONSTANTS.BUTTONS.FOLLOW_LINK }).click();
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
    const testData = TestDataFactory.getExampleFormData();

    // Load and start the form
    await odkPage.selectForm(CONSTANTS.FORMS.EXAMPLE);
    await odkPage.createNewInstance();
    await odkPage.clickNext();

    // Fill numeric rating field
    await odkPage.fillNumericInputAlternative(CONSTANTS.EXAMPLE_FORM_FIELDS.INITIAL_RATING, testData.initialRating);
    await odkPage.clickNext();

    // Check a checkbox (e.g., auto-generated computation field)
    await odkPage.checkCheckbox(CONSTANTS.EXAMPLE_FORM_FIELDS.COMPUTED_ASSIGNMENT);
    await odkPage.clickNext();

    // Fill how many cups of coffee
    await odkPage.fillNumericInputAlternative(CONSTANTS.EXAMPLE_FORM_FIELDS.COFFEE_CUPS, testData.coffeeCups);
    await odkPage.clickNext();

    // Complete remaining steps
    await odkPage.clickNext();
    await odkPage.clickNext();

    // Finalize and verify
    await odkPage.finalizeForm();
    await odkPage.clickNext();

    // Basic assertion to confirm app URL
    await expect(odkPage.page).toHaveURL(CONSTANTS.URL_PATTERNS.LOCALHOST);
  });

  // Test case: Completing the "Agriculture Form"
  test('should complete Agriculture Form with corn plant data', async () => {
    const testData = TestDataFactory.getAgricultureFormData();

    // Load and start the form
    await odkPage.selectForm(CONSTANTS.FORMS.AGRICULTURE);
    await odkPage.createNewInstance();
    await odkPage.clickNextByText();

    // Fill corn variety
    await odkPage.fillTextInput(CONSTANTS.AGRICULTURE_FORM_FIELDS.CORN_VARIETY, testData.cornVariety);
    await odkPage.clickNextByText();

    // Select soil condition from radio buttons
    await odkPage.selectRadioButton(testData.soilCondition);
    await odkPage.clickNextByText();

    // Fill plant height
    await odkPage.fillTextInput(CONSTANTS.AGRICULTURE_FORM_FIELDS.PLANT_HEIGHT, testData.plantHeight);
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
      initialRating: Math.floor(Math.random() * CONSTANTS.RANGES.RATING.MAX) + CONSTANTS.RANGES.RATING.MIN,
      coffeeCups: Math.floor(Math.random() * CONSTANTS.RANGES.COFFEE_CUPS.MAX) + CONSTANTS.RANGES.COFFEE_CUPS.MIN
    };
  }

  static getAgricultureFormData() {
    const varieties = ['Corn Variety A', 'Corn Variety B', 'Corn Variety C'];
    const conditions = Object.values(CONSTANTS.SOIL_CONDITIONS);

    return {
      cornVariety: varieties[Math.floor(Math.random() * varieties.length)],
      plantHeight: (Math.floor(Math.random() * (CONSTANTS.RANGES.PLANT_HEIGHT.MAX - CONSTANTS.RANGES.PLANT_HEIGHT.MIN)) + CONSTANTS.RANGES.PLANT_HEIGHT.MIN).toString(),
      soilCondition: conditions[Math.floor(Math.random() * conditions.length)]
    };
  }
}