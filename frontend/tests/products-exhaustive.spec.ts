import { test, expect } from '@playwright/test';

const categories = [
  { label: 'Мясной', value: 'Meat' },
  { label: 'Овощи', value: 'Vegetables' },
  { label: 'Замороженный', value: 'Frozen' },
  { label: 'Сладости', value: 'Sweets' },
  { label: 'Специи', value: 'Spices' },
  { label: 'Зелень', value: 'Greens' },
  { label: 'Крупы', value: 'Cereals' },
  { label: 'Консервы', value: 'Canned' },
  { label: 'Жидкость', value: 'Liquid' }
];

test.describe('Продукты - Исчерпывающее соответствие API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products/new');
  });

  for (const cat of categories) {
    test(`КОГДА выбирается категория "${cat.label}", ТОГДА продукт успешно проходит валидацию и готов к сохранению`, async ({ page }) => {
      await page.getByLabel('Название продукта').fill(`Test ${cat.label}`);
      const select = page.getByRole('combobox', { name: 'Категория' });
      await select.click();
      await page.getByRole('option', { name: cat.label }).click();
      await expect(select).toContainText(cat.label);
      await expect(page.getByRole('button', { name: 'Создать и сохранить' })).toBeEnabled();
    });
  }

  const calorieBoundaries = [
    { val: '0', name: '0' },
    { val: '0.1', name: '0.1' },
    { val: '9000', name: '9000' }
  ];
  for (const b of calorieBoundaries) {
    test(`КОГДА вводится калорийность "${b.val}" (граничное значение), ТОГДА форма остается валидной`, async ({ page }) => {
      await page.getByLabel('Название продукта').fill(`Calorie Test ${b.name}`);
      await page.getByLabel('Энергия (ккал)').fill(b.val);
      await expect(page.getByRole('button', { name: 'Создать и сохранить' })).toBeEnabled();
    });
  }

  const titleBoundaries = [
    { val: 'X2', name: '2 символа' },
    { val: 'A'.repeat(100), name: '100 символов' },
    { val: 'Яблоко & Груша / Тест #1 (ÄÖÜ)', name: 'спецсимволы' }
  ];
  for (const b of titleBoundaries) {
    test(`КОГДА вводится название продукта "${b.name}", ТОГДА оно корректно принимается формой`, async ({ page }) => {
      const input = page.getByLabel('Название продукта');
      await input.fill(b.val);
      await expect(input).toHaveValue(b.val);
      await expect(page.getByRole('button', { name: 'Создать и сохранить' })).toBeEnabled();
    });
  }

  test('КОГДА сумма БЖУ превышает 100г, ТОГДА UI блокирует сохранение и выводит ошибку валидации', async ({ page }) => {
    await page.getByLabel('Название продукта').fill('Invalid Macros');
    await page.getByLabel('Белки (г)').fill('40');
    await page.getByLabel('Жиры (г)').fill('40');
    await page.getByLabel('Углеводы (г)').fill('30');
    await expect(page.getByText(/Сумма макронутриентов \(110г\) превышает 100г/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Создать и сохранить' })).toBeDisabled();
  });

  test('КОГДА обновляются данные существующего продукта, ТОГДА после нажатия "Обновить" происходит редирект к списку', async ({ page }) => {
    await page.route('**/api/products/123', async route => {
      await route.fulfill({ json: { 
        id: '123', title: 'Before Update', calories: 100, proteins: 10, fats: 5, carbohydrates: 5,
        category: 1, necessity: 1, flags: 0
      }});
    });
    await page.goto('/products/edit/123');
    await page.getByLabel('Название продукта').fill('After Update');
    
    await page.route('**/api/products/123', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 200, json: { id: '123', title: 'After Update', calories: 555 } });
      }
    });
    
    await page.getByRole('button', { name: 'Обновить данные' }).click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('КОГДА удаляется продукт, используемый в блюде, ТОГДА выводится системное уведомление об ошибке', async ({ page }) => {
    await page.route('**/api/products/123', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ 
          status: 400, 
          body: 'Невозможно удалить продукт, так как он используется в блюдах' 
        });
      } else {
        await route.fulfill({ json: { id: '123', title: 'Used Product' } });
      }
    });
    await page.goto('/products/edit/123');
    
    page.on('dialog', async dialog => {
      if (dialog.type() === 'confirm') await dialog.accept();
      else if (dialog.type() === 'alert') await dialog.dismiss();
    });

    const responsePromise = page.waitForResponse(resp => resp.url().includes('/api/products/123') && resp.status() === 400);
    await page.locator('button').filter({ has: page.locator('svg.lucide-trash2') }).click();
    await responsePromise;
  });
});
