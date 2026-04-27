import { Page, Locator } from '@playwright/test';
import { ProductFormLocators } from '../locators/ProductFormLocators';

export class ProductFormPage {
  readonly page: Page;
  readonly backBtn: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly caloriesInput: Locator;
  readonly proteinsInput: Locator;
  readonly fatsInput: Locator;
  readonly carbsInput: Locator;
  readonly categorySelect: Locator;
  readonly necessitySelect: Locator;
  readonly veganCheckbox: Locator;
  readonly glutenFreeCheckbox: Locator;
  readonly sugarFreeCheckbox: Locator;
  readonly saveBtn: Locator;
  readonly updateBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backBtn = page.getByRole('button', { name: ProductFormLocators.backBtnName });
    this.titleInput = page.getByLabel(ProductFormLocators.titleLabel);
    this.descriptionInput = page.getByLabel(ProductFormLocators.descriptionLabel);
    this.caloriesInput = page.getByLabel(ProductFormLocators.caloriesLabel);
    this.proteinsInput = page.getByLabel(ProductFormLocators.proteinsLabel);
    this.fatsInput = page.getByLabel(ProductFormLocators.fatsLabel);
    this.carbsInput = page.getByLabel(ProductFormLocators.carbsLabel);
    this.categorySelect = page.getByRole('combobox', { name: ProductFormLocators.categoryName });
    this.necessitySelect = page.getByRole('combobox', { name: ProductFormLocators.necessityName });
    this.veganCheckbox = page.getByLabel(ProductFormLocators.veganLabel);
    this.glutenFreeCheckbox = page.getByLabel(ProductFormLocators.glutenFreeLabel);
    this.sugarFreeCheckbox = page.getByLabel(ProductFormLocators.sugarFreeLabel);
    this.saveBtn = page.getByRole('button', { name: ProductFormLocators.saveBtnName });
    this.updateBtn = page.getByRole('button', { name: ProductFormLocators.updateBtnName });
  }

  async gotoNew() {
    await this.page.goto('/products/new');
  }

  async gotoEdit(id: string) {
    await this.page.goto(`/products/edit/${id}`);
  }

  async fillBasicInfo(title: string, description: string) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
  }

  async fillMacros(calories: string, proteins: string, fats: string, carbs: string) {
    await this.caloriesInput.fill(calories);
    await this.proteinsInput.fill(proteins);
    await this.fatsInput.fill(fats);
    await this.carbsInput.fill(carbs);
  }
}
