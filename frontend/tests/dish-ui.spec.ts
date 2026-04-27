import { test, expect } from '@playwright/test';

test.describe('Форма Блюда - Покрытие UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products*', async route => {
      await route.fulfill({ json: [
        { id: 'p1', title: 'Яблоко', calories: 50, proteins: 1, fats: 0, carbohydrates: 12, flags: 7 },
        { id: 'p2', title: 'Стейк', calories: 250, proteins: 25, fats: 15, carbohydrates: 0, flags: 0 }
      ] });
    });
    await page.goto('/dishes/new');
  });

  test('КОГДА в название вводится макрос категории, ТОГДА категория устанавливается автоматически, а макрос удаляется', async ({ page }) => {
    const title = page.getByLabel('Название блюда');
    await title.fill('Ужин !второе');
    await expect(title).toHaveValue('Ужин');
    await expect(page.getByRole('combobox', { name: 'Категория' })).toContainText('Второе');
  });

  test('КОГДА добавляется ингредиент и выбирается продукт, ТОГДА КБЖУ блюда рассчитываются автоматически', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: 'Добавить ингредиент' });
    await addBtn.click();
    
    const productSelect = page.getByRole('combobox', { name: 'Продукт' });
    await productSelect.click();
    await page.getByRole('option', { name: 'Яблоко' }).click();
    
    const weightInput = page.getByLabel('Вес (г)');
    await weightInput.fill('200');
    
    await expect(page.getByLabel('Калории (ккал)')).toHaveValue('100');
    
    await page.locator('button').filter({ has: page.locator('svg.lucide-trash2') }).click();
    await expect(page.getByLabel('Калории (ккал)')).toHaveValue('0');
  });

  test('КОГДА КБЖУ вводятся вручную, ТОГДА появляется кнопка сброса к авто-расчету', async ({ page }) => {
    await page.getByLabel('Белки').fill('10');
    await expect(page.locator('button').filter({ has: page.locator('svg.lucide-sparkles') })).toBeVisible();
    
    await page.locator('button').filter({ has: page.locator('svg.lucide-sparkles') }).click();
    await expect(page.getByLabel('Белки')).toHaveValue('0');
  });

  test('КОГДА в блюдо добавляется не-веганский продукт, ТОГДА чекбокс "Веган" блокируется', async ({ page }) => {
    await page.getByRole('button', { name: 'Добавить ингредиент' }).click();
    await page.getByRole('combobox', { name: 'Продукт' }).click();
    await page.getByRole('option', { name: 'Стейк' }).click();
    
    const vegan = page.getByRole('checkbox', { name: 'Веган' });
    await expect(vegan).toBeDisabled();
    await expect(vegan).not.toBeChecked();
  });

  test('КОГДА плотность БЖУ равна 100.1г на 100г порции, ТОГДА форма остается валидной', async ({ page }) => {
    await page.getByRole('spinbutton', { name: 'Вес порции (г)' }).fill('100');
    await page.locator('input[name="proteins"]').fill('100.1');
    await expect(page.getByRole('button', { name: 'Сохранить рецепт' })).toBeEnabled();
  });

  test('КОГДА плотность БЖУ превышает 100.1г, ТОГДА выводится ошибка и сохранение блокируется', async ({ page }) => {
    await page.getByRole('spinbutton', { name: 'Вес порции (г)' }).fill('100');
    await page.locator('input[name="proteins"]').fill('100.2');
    await expect(page.getByText(/Плотность БЖУ выше 100%/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Сохранить рецепт' })).toBeDisabled();
  });
});
