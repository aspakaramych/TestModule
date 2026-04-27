import { test, expect } from '@playwright/test';
import { DishFormPage } from './pages/DishFormPage';
import { DishFormLocators } from './locators/DishFormLocators';

test.describe('Форма Блюда - Покрытие UI', () => {
  let dishPage: DishFormPage;

  test.beforeEach(async ({ page }) => {
    dishPage = new DishFormPage(page);
    await page.route('**/api/products*', async route => {
      await route.fulfill({ json: [
        { id: 'p1', title: 'Яблоко', calories: 50, proteins: 1, fats: 0, carbohydrates: 12, flags: 7 },
        { id: 'p2', title: 'Стейк', calories: 250, proteins: 25, fats: 15, carbohydrates: 0, flags: 0 }
      ] });
    });
    await dishPage.goto();
  });

  test('КОГДА в название вводится макрос категории, ТОГДА категория устанавливается автоматически, а макрос удаляется', async ({ page }) => {
    await dishPage.fillTitle('Ужин !второе');
    await expect(dishPage.titleInput).toHaveValue('Ужин');
    await expect(dishPage.categorySelect).toContainText('Второе');
  });

  test('КОГДА добавляется ингредиент и выбирается продукт, ТОГДА КБЖУ блюда рассчитываются автоматически', async ({ page }) => {
    await dishPage.addIngredient('Яблоко', '200');
    await expect(dishPage.caloriesInput).toHaveValue('100');
    
    await dishPage.trashBtn.click();
    await expect(dishPage.caloriesInput).toHaveValue('0');
  });

  test('КОГДА КБЖУ вводятся вручную, ТОГДА появляется кнопка сброса к авто-расчету', async ({ page }) => {
    await dishPage.addIngredient('Яблоко', '200');
    await dishPage.caloriesInput.fill('150');
    
    await expect(dishPage.sparklesBtn).toBeVisible();
    await dishPage.sparklesBtn.click();
    await expect(dishPage.proteinsInput).toHaveValue('2');
  });

  test('КОГДА в блюдо добавляется не-веганский продукт, ТОГДА чекбокс "Веган" блокируется', async ({ page }) => {
    await dishPage.addIngredient('Стейк', '100');
    await expect(dishPage.veganCheckbox).toBeDisabled();
    await expect(dishPage.veganCheckbox).not.toBeChecked();
  });

  test('КОГДА плотность БЖУ равна 100.1г на 100г порции, ТОГДА форма остается валидной', async ({ page }) => {
    await dishPage.setPortionSize('100');
    await dishPage.fillProteins('100.1');
    await expect(dishPage.saveRecipeBtn).toBeEnabled();
  });

  test('КОГДА плотность БЖУ превышает 100.1г, ТОГДА выводится ошибка и сохранение блокируется', async ({ page }) => {
    await dishPage.setPortionSize('100');
    await dishPage.fillProteins('100.2');
    await expect(page.getByText(DishFormLocators.densityErrorText)).toBeVisible();
    await expect(dishPage.saveRecipeBtn).toBeDisabled();
  });
});
