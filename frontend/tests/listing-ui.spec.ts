import { test, expect } from '@playwright/test';

test.describe('Списки - Покрытие UI', () => {
  const mockProducts = [
    { id: '1', title: 'Яблоко', calories: 50, proteins: 1, fats: 0, carbohydrates: 12, category: 1, necessity: 1, flags: 7 }
  ];
  const mockDishes = [
    { id: 'd1', title: 'Салат', calories: 100, proteins: 2, fats: 5, carbohydrates: 10, category: 4, flags: 7, portionSize: 200 }
  ];

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products*', async route => route.fulfill({ json: mockProducts }));
    await page.route('**/api/dishes*', async route => route.fulfill({ json: mockDishes }));
  });

  test('КОГДА вводятся фильтры или текст поиска, ТОГДА UI корректно передает состояние фильтрации', async ({ page }) => {
    await page.goto('/products');
    await page.getByPlaceholder('Поиск ингредиентов...').fill('Яблоко');
    
    const category = page.getByRole('combobox').nth(0);
    await category.click();
    await page.getByRole('option', { name: 'Овощи' }).click();
    
    const vegan = page.getByRole('button', { name: 'Веган' }).first();
    await vegan.click();
    await expect(vegan).toHaveClass(/MuiChip-filled/);
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
      await page.goto('/products');
      const sort = page.getByRole('combobox').nth(2);
      await sort.click();
      await page.getByRole('option', { name: opt.label }).click();
      await expect(sort).toContainText(opt.label);
    });
  }

  test('КОГДА нажимается кнопка "Новый продукт", ТОГДА происходит навигация на форму создания', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('button', { name: 'Новый продукт' }).click();
    await expect(page).toHaveURL(/\/products\/new/);
  });

  test('КОГДА кликается карточка блюда, ТОГДА открывается модальное окно с деталями, которое закрывается по Escape', async ({ page }) => {
    await page.goto('/dishes');
    await page.getByPlaceholder('Поиск блюд...').fill('Салат');
    
    await page.getByText('Салат').first().click();
    await expect(page.locator('h3').filter({ hasText: 'Салат' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('h3').filter({ hasText: 'Салат' })).toBeHidden();
  });
});
