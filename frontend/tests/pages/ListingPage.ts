import { Page, Locator } from '@playwright/test';
import { ListingLocators } from '../locators/ListingLocators';

export class ListingPage {
  readonly page: Page;
  readonly productSearch: Locator;
  readonly dishSearch: Locator;
  readonly categoryFilter: Locator;
  readonly sortSelect: Locator;
  readonly veganChip: Locator;
  readonly newProductBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productSearch = page.getByPlaceholder(ListingLocators.productSearchPlaceholder);
    this.dishSearch = page.getByPlaceholder(ListingLocators.dishSearchPlaceholder);
    this.categoryFilter = page.getByRole('combobox').nth(0);
    this.sortSelect = page.getByRole('combobox').nth(2);
    this.veganChip = page.getByRole('button', { name: ListingLocators.veganChipName }).first();
    this.newProductBtn = page.getByRole('button', { name: ListingLocators.newProductBtnName });
  }

  async gotoProducts() {
    await this.page.goto('/products');
  }

  async gotoDishes() {
    await this.page.goto('/dishes');
  }

  async openDetails(title: string) {
    await this.page.getByText(title).first().click();
  }
}
