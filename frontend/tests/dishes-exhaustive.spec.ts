import { test, expect } from '@playwright/test';

const dishCategories = [
  { label: 'Первое', macro: '!первое' },
  { label: 'Второе', macro: '!второе' },
  { label: 'Десерт', macro: '!десерт' },
  { label: 'Салат', macro: '!салат' },
  { label: 'Суп', macro: '!суп' },
  { label: 'Перекус', macro: '!перекус' },
  { label: 'Напиток', macro: '!напиток' }
];

test.describe('Блюда - Исчерпывающее соответствие API', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products*', async route => {
      await route.fulfill({ json: [
        { id: 'p1', title: 'Egg', calories: 100, proteins: 10, fats: 10, carbohydrates: 0, flags: 6 },
        { id: 'p2', title: 'Apple', calories: 50, proteins: 1, fats: 0, carbohydrates: 12, flags: 7 }
      ] });
    });
    await page.goto('/dishes/new');
  });

  for (const cat of dishCategories) {
    test(`КОГДА в название вводится макрос "${cat.macro}", ТОГДА категория "${cat.label}" устанавливается автоматически`, async ({ page }) => {
      const title = page.getByLabel('Название блюда');
      await title.fill(`Test Dish ${cat.macro}`);
      await expect(title).toHaveValue('Test Dish');
      await expect(page.getByRole('combobox', { name: 'Категория' })).toContainText(cat.label);
    });
  }

  test('КОГДА добавляется несколько ингредиентов, ТОГДА КБЖУ блюда суммируются автоматически', async ({ page }) => {
    await page.getByRole('button', { name: 'Добавить ингредиент' }).click();
    await page.getByRole('combobox', { name: 'Продукт' }).click();
    await page.getByRole('option', { name: 'Egg' }).click();
    await page.getByLabel('Вес (г)').fill('100');
    
    await page.getByRole('button', { name: 'Добавить ингредиент' }).click();
    await page.getByRole('combobox', { name: 'Продукт' }).nth(1).click();
    await page.getByRole('option', { name: 'Apple' }).click();
    await page.getByLabel('Вес (г)').nth(1).fill('100');
    
    await expect(page.getByLabel('Калории (ккал)')).toHaveValue('150');
    await expect(page.getByLabel('Белки')).toHaveValue('11');
    await expect(page.getByLabel('Жиры')).toHaveValue('10');
    await expect(page.getByLabel('Углев.')).toHaveValue('12');
  });

  test('КОГДА флаги блюда противоречат ингредиентам (мясо в веганском блюде), ТОГДА некорректные флаги сбрасываются', async ({ page }) => {
    await page.getByRole('button', { name: 'Добавить ингредиент' }).click();
    await page.getByRole('combobox', { name: 'Продукт' }).click();
    await page.getByRole('option', { name: 'Apple' }).click();
    
    const vegan = page.getByRole('checkbox', { name: 'Веган' });
    await expect(vegan).toBeEnabled();
    await vegan.check();
    
    await page.getByRole('button', { name: 'Добавить ингредиент' }).click();
    await page.getByRole('combobox', { name: 'Продукт' }).nth(1).click();
    await page.getByRole('option', { name: 'Egg' }).click();
    
    await expect(vegan).toBeDisabled();
    await expect(vegan).not.toBeChecked();
  });

  const portions = ['1', '500', '5000'];
  for (const p of portions) {
    test(`КОГДА устанавливается размер порции "${p}г", ТОГДА форма остается валидной и готова к сохранению`, async ({ page }) => {
      const input = page.getByLabel('Вес порции (г)');
      await input.fill(p);
      await expect(input).toHaveValue(p);
      await expect(page.getByRole('button', { name: 'Сохранить рецепт' })).toBeEnabled();
    });
  }

  test('КОГДА плотность БЖУ на граничном уровне (100.1г), ТОГДА блюдо успешно проходит валидацию', async ({ page }) => {
    await page.getByLabel('Вес порции (г)').fill('100');
    await page.locator('input[name="proteins"]').fill('100.1');
    await expect(page.getByRole('button', { name: 'Сохранить рецепт' })).toBeEnabled();
  });

  test('КОГДА плотность БЖУ превышает 100.1г, ТОГДА выводится ошибка и сохранение блокируется UI', async ({ page }) => {
    await page.getByLabel('Вес порции (г)').fill('100');
    await page.locator('input[name="proteins"]').fill('100.2');
    await expect(page.getByText(/Плотность БЖУ выше 100%/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Сохранить рецепт' })).toBeDisabled();
  });
});
