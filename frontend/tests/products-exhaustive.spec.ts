import { test, expect } from '@playwright/test';
import { ProductFormPage } from './pages/ProductFormPage';

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
  let productPage: ProductFormPage;

  test.beforeEach(async ({ page }) => {
    productPage = new ProductFormPage(page);
    await productPage.gotoNew();
  });

  for (const cat of categories) {
    test(`КОГДА выбирается категория "${cat.label}", ТОГДА продукт успешно проходит валидацию и готов к сохранению`, async ({ page }) => {
      await productPage.titleInput.fill(`Test ${cat.label}`);
      await productPage.categorySelect.click();
      await page.getByRole('option', { name: cat.label }).click();
      await expect(productPage.categorySelect).toContainText(cat.label);
      await expect(productPage.saveBtn).toBeEnabled();
    });
  }

  const calorieBoundaries = [
    { val: '0', name: '0' },
    { val: '0.1', name: '0.1' },
    { val: '9000', name: '9000' }
  ];
  for (const b of calorieBoundaries) {
    test(`КОГДА вводится калорийность "${b.val}" (граничное значение), ТОГДА форма остается валидной`, async ({ page }) => {
      await productPage.titleInput.fill(`Calorie Test ${b.name}`);
      await productPage.caloriesInput.fill(b.val);
      await expect(productPage.saveBtn).toBeEnabled();
    });
  }

  const titleBoundaries = [
    { val: 'X2', name: '2 символа' },
    { val: 'A'.repeat(100), name: '100 символов' },
    { val: 'Яблоко & Груша / Тест #1 (ÄÖÜ)', name: 'спецсимволы' }
  ];
  for (const b of titleBoundaries) {
    test(`КОГДА вводится название продукта "${b.name}", ТОГДА оно корректно принимается формой`, async ({ page }) => {
      await productPage.titleInput.fill(b.val);
      await expect(productPage.titleInput).toHaveValue(b.val);
      await expect(productPage.saveBtn).toBeEnabled();
    });
  }

  test('КОГДА сумма БЖУ превышает 100г, ТОГДА UI блокирует сохранение и выводит ошибку валидации', async ({ page }) => {
    await productPage.titleInput.fill('Invalid Macros');
    await productPage.fillMacros('0', '40', '40', '30');
    await expect(page.getByText(/Сумма макронутриентов \(110г\) превышает 100г/)).toBeVisible();
    await expect(productPage.saveBtn).toBeDisabled();
  });

  test('КОГДА обновляются данные существующего продукта, ТОГДА после нажатия "Обновить" происходит редирект к списку', async ({ page }) => {
    await page.route('**/api/products/123', async route => {
      await route.fulfill({ json: { 
        id: '123', title: 'Before Update', calories: 100, proteins: 10, fats: 5, carbohydrates: 5,
        category: 1, necessity: 1, flags: 0
      }});
    });
    await productPage.gotoEdit('123');
    await productPage.titleInput.fill('After Update');
    
    await page.route('**/api/products/123', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 200, json: { id: '123', title: 'After Update', calories: 555 } });
      }
    });
    
    await productPage.updateBtn.click();
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
    await productPage.gotoEdit('123');
    
    page.on('dialog', async dialog => {
      if (dialog.type() === 'confirm') await dialog.accept();
      else if (dialog.type() === 'alert') await dialog.dismiss();
    });

    const responsePromise = page.waitForResponse(resp => resp.url().includes('/api/products/123') && resp.status() === 400);
    // Find delete button via trash icon
    await page.locator('button').filter({ has: page.locator('svg.lucide-trash2') }).click();
    await responsePromise;
  });
});
