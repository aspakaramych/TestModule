import { test, expect } from '@playwright/test';

test.describe('Форма Продукта - Покрытие UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products/new');
  });

  test('КОГДА нажимается кнопка "Назад к продуктам", ТОГДА происходит переход на список продуктов', async ({ page }) => {
    await page.getByRole('button', { name: 'Назад к продуктам' }).click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('КОГДА вводится название продукта, ТОГДА оно корректно отображается в поле ввода', async ({ page }) => {
    const title = page.getByLabel('Название продукта');
    await title.fill('Банан');
    await expect(title).toHaveValue('Банан');
  });

  test('КОГДА вводится описание продукта, ТОГДА оно корректно сохраняется в состоянии поля', async ({ page }) => {
    const desc = page.getByLabel('Описание или Состав');
    await desc.fill('Очень вкусный банан');
    await expect(desc).toHaveValue('Очень вкусный банан');
  });

  test('КОГДА вводятся числовые значения КБЖУ, ТОГДА в инфоблоке отображается актуальная сумма БЖУ', async ({ page }) => {
    await page.getByLabel('Энергия (ккал)').fill('90');
    await page.getByLabel('Белки (г)').fill('1.1');
    await page.getByLabel('Жиры (г)').fill('0.3');
    await page.getByLabel('Углеводы (г)').fill('22.8');
    await expect(page.getByText(/Сумма БЖУ не должна превышать 100г\. Сейчас: 24\.2г/)).toBeVisible();
  });

  test('КОГДА выбирается категория в выпадающем списке, ТОГДА выбранное значение отображается в поле', async ({ page }) => {
    const category = page.getByRole('combobox', { name: 'Категория' });
    await category.click();
    await page.getByRole('option', { name: 'Сладости' }).click();
    await expect(category).toContainText('Сладости');
  });

  test('КОГДА выбирается степень готовки, ТОГДА выбранное значение фиксируется в поле', async ({ page }) => {
    const necessity = page.getByRole('combobox', { name: 'Степень готовки' });
    await necessity.click();
    await page.getByRole('option', { name: 'Полуфабрикат' }).click();
    await expect(necessity).toContainText('Полуфабрикат');
  });

  test('КОГДА переключаются диетические флаги, ТОГДА состояние чекбоксов меняется соответственно', async ({ page }) => {
    const vegan = page.getByLabel('Веганский');
    const glutenFree = page.getByLabel('Без Глютена');
    const sugarFree = page.getByLabel('Без Сахара');
    
    await vegan.check();
    await expect(vegan).toBeChecked();
    
    await glutenFree.check();
    await expect(glutenFree).toBeChecked();
    
    await sugarFree.check();
    await expect(sugarFree).toBeChecked();
    
    await vegan.uncheck();
    await expect(vegan).not.toBeChecked();
  });

  test('КОГДА сумма БЖУ равна ровно 100г, ТОГДА кнопка сохранения остается активной', async ({ page }) => {
    await page.getByLabel('Название продукта').fill('Max Protein');
    await page.getByLabel('Белки (г)').fill('100');
    await expect(page.getByRole('button', { name: 'Создать и сохранить' })).toBeEnabled();
  });

  test('КОГДА сумма БЖУ превышает 100г (100.1г), ТОГДА выводится ошибка и кнопка блокируется', async ({ page }) => {
    await page.getByLabel('Название продукта').fill('Over Protein');
    await page.getByLabel('Белки (г)').fill('100.1');
    await expect(page.getByText('Ошибка: Сумма макронутриентов (100.1г) превышает 100г!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Создать и сохранить' })).toBeDisabled();
  });
});
