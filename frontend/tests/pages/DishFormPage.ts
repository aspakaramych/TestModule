import { Page, Locator } from '@playwright/test';
import { DishFormLocators } from '../locators/DishFormLocators';

export class DishFormPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly categorySelect: Locator;
  readonly addIngredientBtn: Locator;
  readonly productSelect: Locator;
  readonly weightInput: Locator;
  readonly caloriesInput: Locator;
  readonly proteinsInput: Locator;
  readonly fatsInput: Locator;
  readonly carbsInput: Locator;
  readonly portionSizeInput: Locator;
  readonly proteinsField: Locator;
  readonly saveRecipeBtn: Locator;
  readonly veganCheckbox: Locator;
  readonly trashBtn: Locator;
  readonly sparklesBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByLabel(DishFormLocators.titleInputLabel);
    this.categorySelect = page.getByRole('combobox', { name: DishFormLocators.categoryName });
    this.addIngredientBtn = page.getByRole('button', { name: DishFormLocators.addIngredientBtnName });
    this.productSelect = page.getByRole('combobox', { name: DishFormLocators.productName });
    this.weightInput = page.getByLabel(DishFormLocators.weightInputLabel);
    this.caloriesInput = page.getByLabel(DishFormLocators.caloriesInputLabel);
    this.proteinsInput = page.getByLabel(DishFormLocators.proteinsInputLabel);
    this.fatsInput = page.getByLabel(DishFormLocators.fatsInputLabel);
    this.carbsInput = page.getByLabel(DishFormLocators.carbsInputLabel);
    this.portionSizeInput = page.getByLabel(DishFormLocators.portionSizeLabel);
    this.proteinsField = page.locator(`input[name="${DishFormLocators.proteinsInputName}"]`);
    this.saveRecipeBtn = page.getByRole('button', { name: DishFormLocators.saveRecipeBtnName });
    this.veganCheckbox = page.getByRole('checkbox', { name: DishFormLocators.veganCheckboxName });
    this.trashBtn = page.locator('button').filter({ has: page.locator(DishFormLocators.trashIcon) });
    this.sparklesBtn = page.locator('button').filter({ has: page.locator(DishFormLocators.sparklesIcon) });
  }

  async goto() {
    await this.page.goto('/dishes/new');
  }

  async fillTitle(title: string) {
    await this.titleInput.fill(title);
  }

  async addIngredient(productName: string, weight: string, index: number = 0) {
    await this.addIngredientBtn.click();
    const currentProductSelect = this.page.getByRole('combobox', { name: DishFormLocators.productName }).nth(index);
    await currentProductSelect.click();
    await this.page.getByRole('option', { name: productName }).click();
    const currentWeightInput = this.page.getByLabel(DishFormLocators.weightInputLabel).nth(index);
    await currentWeightInput.fill(weight);
  }

  async setPortionSize(size: string) {
    await this.portionSizeInput.fill(size);
  }

  async fillProteins(value: string) {
    await this.proteinsField.fill(value);
  }
}
