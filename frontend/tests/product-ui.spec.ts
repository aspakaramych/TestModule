import { test, expect } from '@playwright/test';
import { ProductFormPage } from './pages/ProductFormPage';
import { ProductFormLocators } from './locators/ProductFormLocators';

test.describe('Форма Продукта - Покрытие UI', () => {
  let productPage: ProductFormPage;

  test.beforeEach(async ({ page }) => {
    productPage = new ProductFormPage(page);
    await productPage.gotoNew();
  });

  test('КОГДА нажимается кнопка "Назад к продуктам", ТОГДА происходит переход на список продуктов', async ({ page }) => {
    await productPage.backBtn.click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('КОГДА вводится название продукта, ТОГДА оно корректно отображается в поле ввода', async ({ page }) => {
    await productPage.titleInput.fill('Банан');
    await expect(productPage.titleInput).toHaveValue('Банан');
  });

  test('КОГДА вводится описание продукта, ТОГДА оно корректно сохраняется в состоянии поля', async ({ page }) => {
    await productPage.descriptionInput.fill('Очень вкусный банан');
    await expect(productPage.descriptionInput).toHaveValue('Очень вкусный банан');
  });

  test('КОГДА вводятся числовые значения КБЖУ, ТОГДА в инфоблоке отображается актуальная сумма БЖУ', async ({ page }) => {
    await productPage.fillMacros('90', '1.1', '0.3', '22.8');
    await expect(page.getByText(ProductFormLocators.macrosInfoRegex)).toBeVisible();
  });

  test('КОГДА выбирается категория в выпадающем списке, ТОГДА выбранное значение отображается в поле', async ({ page }) => {
    await productPage.categorySelect.click();
    await page.getByRole('option', { name: 'Сладости' }).click();
    await expect(productPage.categorySelect).toContainText('Сладости');
  });

  test('КОГДА выбирается степень готовки, ТОГДА выбранное значение фиксируется в поле', async ({ page }) => {
    await productPage.necessitySelect.click();
    await page.getByRole('option', { name: 'Полуфабрикат' }).click();
    await expect(productPage.necessitySelect).toContainText('Полуфабрикат');
  });

  test('КОГДА переключаются диетические флаги, ТОГДА состояние чекбоксов меняется соответственно', async ({ page }) => {
    await productPage.veganCheckbox.check();
    await expect(productPage.veganCheckbox).toBeChecked();
    
    await productPage.glutenFreeCheckbox.check();
    await expect(productPage.glutenFreeCheckbox).toBeChecked();
    
    await productPage.sugarFreeCheckbox.check();
    await expect(productPage.sugarFreeCheckbox).toBeChecked();
    
    await productPage.veganCheckbox.uncheck();
    await expect(productPage.veganCheckbox).not.toBeChecked();
  });

  test('КОГДА сумма БЖУ равна ровно 100г, ТОГДА кнопка сохранения остается активной', async ({ page }) => {
    await productPage.titleInput.fill('Max Protein');
    await productPage.proteinsInput.fill('100');
    await expect(productPage.saveBtn).toBeEnabled();
  });

  test('КОГДА сумма БЖУ превышает 100г (100.1г), ТОГДА выводится ошибка и кнопка блокируется', async ({ page }) => {
    await productPage.titleInput.fill('Over Protein');
    await productPage.proteinsInput.fill('100.1');
    await expect(page.getByText(ProductFormLocators.macrosLimitErrorText)).toBeVisible();
    await expect(productPage.saveBtn).toBeDisabled();
  });
});
