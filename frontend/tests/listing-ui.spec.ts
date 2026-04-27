import { test, expect } from '@playwright/test';
import { ListingPage } from './pages/ListingPage';
import { ListingLocators } from './locators/ListingLocators';

test.describe('Списки - Покрытие UI', () => {
  let listingPage: ListingPage;

  const mockProducts = [
    { id: '1', title: 'Яблоко', calories: 50, proteins: 1, fats: 0, carbohydrates: 12, category: 1, necessity: 1, flags: 7 }
  ];
  const mockDishes = [
    { id: 'd1', title: 'Салат', calories: 100, proteins: 2, fats: 5, carbohydrates: 10, category: 4, flags: 7, portionSize: 200 }
  ];

  test.beforeEach(async ({ page }) => {
    listingPage = new ListingPage(page);
    await page.route('**/api/products*', async route => route.fulfill({ json: mockProducts }));
    await page.route('**/api/dishes*', async route => route.fulfill({ json: mockDishes }));
  });

  test('КОГДА вводятся фильтры или текст поиска, ТОГДА UI корректно передает состояние фильтрации', async ({ page }) => {
    await listingPage.gotoProducts();
    await listingPage.productSearch.fill('Яблоко');
    
    await listingPage.categoryFilter.click();
    await page.getByRole('option', { name: 'Овощи' }).click();
    
    await listingPage.veganChip.click();
    await expect(listingPage.veganChip).toHaveClass(ListingLocators.activeChipClassRegex);
  });

  const sortOptions = [
    { label: 'По алфавиту', value: 'title' },
    { label: 'По калориям', value: 'calories' },
    { label: 'Белки', value: 'proteins' },
    { label: 'Жиры', value: 'fats' },
    { label: 'Углеводы', value: 'carbohydrates' }
  ];

  for (const opt of sortOptions) {
    test(`КОГДА выбирается сортировка "${opt.label}", ТОГДА список продуктов перестраивается соответственно`, async ({ page }) => {
      await listingPage.gotoProducts();
      await listingPage.sortSelect.click();
      await page.getByRole('option', { name: opt.label }).click();
      await expect(listingPage.sortSelect).toContainText(opt.label);
    });
  }

  test('КОГДА нажимается кнопка "Новый продукт", ТОГДА происходит навигация на форму создания', async ({ page }) => {
    await listingPage.gotoProducts();
    await listingPage.newProductBtn.click();
    await expect(page).toHaveURL(/\/products\/new/);
  });

  test('КОГДА кликается карточка блюда, ТОГДА открывается модальное окно с деталями, которое закрывается по Escape', async ({ page }) => {
    await listingPage.gotoDishes();
    await listingPage.dishSearch.fill('Салат');
    
    await listingPage.openDetails('Салат');
    await expect(page.locator('h3').filter({ hasText: 'Салат' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('h3').filter({ hasText: 'Салат' })).toBeHidden();
  });
});
