import { test, expect } from '@playwright/test';
import { DishFormPage } from './pages/DishFormPage';
import { DishFormLocators } from './locators/DishFormLocators';

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
  let dishPage: DishFormPage;

  test.beforeEach(async ({ page }) => {
    dishPage = new DishFormPage(page);
    await page.route('**/api/products*', async route => {
      await route.fulfill({ json: [
        { id: 'p1', title: 'Egg', calories: 100, proteins: 10, fats: 10, carbohydrates: 0, flags: 6 },
        { id: 'p2', title: 'Apple', calories: 50, proteins: 1, fats: 0, carbohydrates: 12, flags: 7 }
      ] });
    });
    await dishPage.goto();
  });

  for (const cat of dishCategories) {
    test(`КОГДА в название вводится макрос "${cat.macro}", ТОГДА категория "${cat.label}" устанавливается автоматически`, async ({ page }) => {
      await dishPage.fillTitle(`Test Dish ${cat.macro}`);
      await expect(dishPage.titleInput).toHaveValue('Test Dish');
      await expect(dishPage.categorySelect).toContainText(cat.label);
    });
  }

  test('КОГДА добавляется несколько ингредиентов, ТОГДА КБЖУ блюда суммируются автоматически', async ({ page }) => {
    await dishPage.addIngredient('Egg', '100', 0);
    await dishPage.addIngredient('Apple', '100', 1);
    
    await expect(dishPage.caloriesInput).toHaveValue('150');
    await expect(dishPage.proteinsInput).toHaveValue('11');
    await expect(dishPage.fatsInput).toHaveValue('10');
    await expect(dishPage.carbsInput).toHaveValue('12');
  });

  test('КОГДА флаги блюда противоречат ингредиентам (мясо в веганском блюде), ТОГДА некорректные флаги сбрасываются', async ({ page }) => {
    await dishPage.addIngredient('Apple', '100', 0);
    await expect(dishPage.veganCheckbox).toBeEnabled();
    await dishPage.veganCheckbox.check();
    
    await dishPage.addIngredient('Egg', '100', 1);
    await expect(dishPage.veganCheckbox).toBeDisabled();
    await expect(dishPage.veganCheckbox).not.toBeChecked();
  });

  const portions = ['1', '500', '5000'];
  for (const p of portions) {
    test(`КОГДА устанавливается размер порции "${p}г", ТОГДА форма остается валидной и готова к сохранению`, async ({ page }) => {
      await dishPage.setPortionSize(p);
      await expect(dishPage.portionSizeInput).toHaveValue(p);
      await expect(dishPage.saveRecipeBtn).toBeEnabled();
    });
  }

  test('КОГДА плотность БЖУ на граничном уровне (100.1г), ТОГДА блюдо успешно проходит валидацию', async ({ page }) => {
    await dishPage.setPortionSize('100');
    await dishPage.fillProteins('100.1');
    await expect(dishPage.saveRecipeBtn).toBeEnabled();
  });

  test('КОГДА плотность БЖУ превышает 100.1г, ТОГДА выводится ошибка и сохранение блокируется UI', async ({ page }) => {
    await dishPage.setPortionSize('100');
    await dishPage.fillProteins('100.2');
    await expect(page.getByText(DishFormLocators.densityErrorText)).toBeVisible();
    await expect(dishPage.saveRecipeBtn).toBeDisabled();
  });
});
