using Domain.DTOs;
using Domain.Models;

namespace TestModule.Backend.IntegrationTests.TestData;

/// <summary>
/// Тестовые данные для Products.
///
/// Эквивалентные классы:
///   EC1 — валидный продукт (все поля), EC2 — минимальный (нули/null),
///   EC3 — Unicode/спецсимволы в Title, EC4 — все ProductCategory и CookingNecessity,
///   EC5 — комбинации DietaryFlags.
///
/// Граничные значения:
///   BV1 Calories=0, BV2 Calories=0.01, BV3 Calories=9000,
///   BV4 Title длиной 1 символ, BV5 Title > 100 символов,
///   BV6 decimal precision 0.01 для КБЖУ.
/// </summary>
public static class ProductTestDataFactory
{
    /// <summary>EC1: валидный продукт со всеми полями.</summary>
    public static ProductCreateDto CreateValidProduct(string title = "Test Product") =>
        new()
        {
            Title = title,
            Photos = new List<byte[]>(),
            Calories = 100m,
            Proteins = 10m,
            Fats = 5m,
            Carbohydrates = 15m,
            Description = "A standard test product.",
            Category = ProductCategory.Vegetables,
            Necessity = CookingNecessity.RequiresCooking,
            Flags = DietaryFlags.None
        };

    /// <summary>EC2: минимальный продукт — нулевые КБЖУ, Description=null.</summary>
    public static ProductCreateDto CreateMinimalProduct() =>
        new()
        {
            Title = "Minimal",
            Photos = new List<byte[]>(),
            Calories = 0,
            Proteins = 0,
            Fats = 0,
            Carbohydrates = 0,
            Description = null,
            Category = ProductCategory.Frozen,
            Necessity = CookingNecessity.ReadyToEat,
            Flags = DietaryFlags.None
        };

    /// <summary>EC3: Title с Unicode и спецсимволами.</summary>
    public static ProductCreateDto CreateSpecialCharacterTitleProduct() =>
        new()
        {
            Title = "Яблоко & Груша / Тест #1 (ÄÖÜ)",
            Calories = 52m,
            Proteins = 0.3m,
            Fats = 0.2m,
            Carbohydrates = 14m,
            Category = ProductCategory.Vegetables,
            Necessity = CookingNecessity.ReadyToEat,
            Flags = DietaryFlags.Vegan
        };

    /// <summary>EC4: продукт заданной категории.</summary>
    public static ProductCreateDto CreateProductInCategory(ProductCategory category) =>
        new()
        {
            Title = $"Product [{category}]",
            Calories = 100,
            Proteins = 10,
            Fats = 5,
            Carbohydrates = 15,
            Category = category,
            Necessity = CookingNecessity.RequiresCooking,
            Flags = DietaryFlags.None
        };

    /// <summary>EC4: продукт с заданным уровнем необходимости приготовления.</summary>
    public static ProductCreateDto CreateProductWithNecessity(CookingNecessity necessity) =>
        new()
        {
            Title = $"Product [necessity={necessity}]",
            Calories = 100,
            Proteins = 10,
            Fats = 5,
            Carbohydrates = 15,
            Category = ProductCategory.Meat,
            Necessity = necessity,
            Flags = DietaryFlags.None
        };

    /// <summary>EC5: флаг Vegan.</summary>
    public static ProductCreateDto CreateVeganProduct() =>
        new()
        {
            Title = "Vegan Product",
            Calories = 150,
            Proteins = 8,
            Fats = 3,
            Carbohydrates = 20,
            Description = "Plant-based.",
            Category = ProductCategory.Vegetables,
            Necessity = CookingNecessity.RequiresCooking,
            Flags = DietaryFlags.Vegan
        };

    /// <summary>EC5: флаг GlutenFree.</summary>
    public static ProductCreateDto CreateGlutenFreeProduct() =>
        new()
        {
            Title = "Gluten Free Product",
            Calories = 200,
            Proteins = 12,
            Fats = 4,
            Carbohydrates = 30,
            Category = ProductCategory.Cereals,
            Necessity = CookingNecessity.RequiresCooking,
            Flags = DietaryFlags.GlutenFree
        };

    /// <summary>EC5: все три флага сразу — Vegan | GlutenFree | SugarFree.</summary>
    public static ProductCreateDto CreateComplexDietaryFlagsProduct() =>
        new()
        {
            Title = "Complex Dietary Product",
            Calories = 120,
            Proteins = 6,
            Fats = 2,
            Carbohydrates = 15,
            Category = ProductCategory.Greens,
            Necessity = CookingNecessity.ReadyToEat,
            Flags = DietaryFlags.Vegan | DietaryFlags.GlutenFree | DietaryFlags.SugarFree
        };

    /// <summary>BV1: Calories=0 (нижняя граница).</summary>
    public static ProductCreateDto CreateZeroCalorieProduct() =>
        new()
        {
            Title = "Zero Calorie Product",
            Calories = 0m,
            Proteins = 0m,
            Fats = 0m,
            Carbohydrates = 0m,
            Category = ProductCategory.Liquid,
            Necessity = CookingNecessity.ReadyToEat,
            Flags = DietaryFlags.None
        };

    /// <summary>BV2: Calories=0.01 (чуть выше нижней границы).</summary>
    public static ProductCreateDto CreateJustAboveZeroCalorieProduct() =>
        new()
        {
            Title = "Nearly Zero Calorie Product",
            Calories = 0.01m,
            Proteins = 0m,
            Fats = 0m,
            Carbohydrates = 0m,
            Category = ProductCategory.Liquid,
            Necessity = CookingNecessity.ReadyToEat,
            Flags = DietaryFlags.None
        };

    /// <summary>BV3: Calories=9000 (верхняя практическая граница).</summary>
    public static ProductCreateDto CreateHighCalorieProduct() =>
        new()
        {
            Title = "High Calorie Product",
            Calories = 9000m,
            Proteins = 50m,
            Fats = 90m,
            Carbohydrates = 0m,
            Category = ProductCategory.Sweets,
            Necessity = CookingNecessity.ReadyToEat,
            Flags = DietaryFlags.None
        };

    /// <summary>BV4: Title длиной 1 символ (минимальная длина).</summary>
    public static ProductCreateDto CreateMinLengthTitleProduct() =>
        new()
        {
            Title = "X",
            Calories = 50m,
            Proteins = 5m,
            Fats = 2m,
            Carbohydrates = 8m,
            Category = ProductCategory.Greens,
            Necessity = CookingNecessity.ReadyToEat,
            Flags = DietaryFlags.None
        };

    /// <summary>BV5: Title длиннее 100 символов.</summary>
    public static ProductCreateDto CreateLongTitleProduct() =>
        new()
        {
            Title = "Very Long Product Title That Contains Many Characters " +
                    "And Tests The Boundary Of String Length Validation " +
                    "With Multiple Sentences And Punctuation!!!",
            Calories = 50m,
            Proteins = 5m,
            Fats = 2m,
            Carbohydrates = 8m,
            Category = ProductCategory.Greens,
            Necessity = CookingNecessity.ReadyToEat,
            Flags = DietaryFlags.None
        };
}

/// <summary>
/// Тестовые данные для Dishes.
///
/// Эквивалентные классы:
///   EC1 — валидное блюдо с ингредиентами, EC2 — без ингредиентов,
///   EC3 — макро-ключевые слова в Title ("!салат", "!десерт" …),
///   EC4 — все DishCategory, EC5 — комбинации DietaryFlags.
///
/// Граничные значения:
///   BV1 PortionSize=1000g, BV2 PortionSize=0.1g, BV3 PortionSize=0 (невалидно),
///   BV6 сумма БЖУ/100g ровно = 100, BV7 сумма БЖУ/100g > 100 (невалидно).
/// </summary>
public static class DishTestDataFactory
{
    /// <summary>EC1: валидное блюдо без ингредиентов.</summary>
    public static DishCreateDto CreateValidDish(string title = "Test Dish") =>
        new()
        {
            Title = title,
            Photos = new List<byte[]>(),
            PortionSize = 200m,
            Category = DishCategory.SecondCourse,
            Ingredients = new List<DishIngredientDto>(),
            Calories = 300m,
            Proteins = 25m,
            Fats = 10m,
            Carbohydrates = 40m,
            Flags = DietaryFlags.None
        };

    /// <summary>EC2: минимальное блюдо — нулевые КБЖУ, пустой список ингредиентов.</summary>
    public static DishCreateDto CreateMinimalDish() =>
        new()
        {
            Title = "Minimal Dish",
            Photos = new List<byte[]>(),
            PortionSize = 100m,
            Category = DishCategory.Snack,
            Ingredients = new List<DishIngredientDto>(),
            Calories = 0m,
            Proteins = 0m,
            Fats = 0m,
            Carbohydrates = 0m,
            Flags = DietaryFlags.None
        };

    /// <summary>EC3: Title с макросом "!салат" — сервис должен установить Category=Salad.</summary>
    public static DishCreateDto CreateDishWithSaladMacroInTitle() =>
        new()
        {
            Title = "Летний !салат",
            PortionSize = 180m,
            Category = DishCategory.Snack,
            Ingredients = new List<DishIngredientDto>(),
            Calories = 150m,
            Proteins = 5m,
            Fats = 8m,
            Carbohydrates = 12m,
            Flags = DietaryFlags.Vegan
        };

    /// <summary>EC3: Title с макросом "!десерт" — сервис должен установить Category=Dessert.</summary>
    public static DishCreateDto CreateDishWithDessertMacroInTitle() =>
        new()
        {
            Title = "Шоколадный !десерт мусс",
            PortionSize = 120m,
            Category = DishCategory.Snack,
            Ingredients = new List<DishIngredientDto>(),
            Calories = 280m,
            Proteins = 6m,
            Fats = 15m,
            Carbohydrates = 32m,
            Flags = DietaryFlags.None
        };

    /// <summary>EC4: блюдо заданной категории.</summary>
    public static DishCreateDto CreateDishInCategory(DishCategory category) =>
        new()
        {
            Title = $"Dish [{category}]",
            PortionSize = 200m,
            Category = category,
            Ingredients = new List<DishIngredientDto>(),
            Calories = 300m,
            Proteins = 20m,
            Fats = 10m,
            Carbohydrates = 40m,
            Flags = DietaryFlags.None
        };

    /// <summary>EC5: флаг Vegan.</summary>
    public static DishCreateDto CreateVeganDish() =>
        new()
        {
            Title = "Vegan Dish",
            PortionSize = 250m,
            Category = DishCategory.Salad,
            Ingredients = new List<DishIngredientDto>(),
            Calories = 200m,
            Proteins = 8m,
            Fats = 5m,
            Carbohydrates = 30m,
            Flags = DietaryFlags.Vegan
        };

    /// <summary>BV1: PortionSize=1000g (верхняя граница).</summary>
    public static DishCreateDto CreateLargePortionDish() =>
        new()
        {
            Title = "Large Portion Dish",
            PortionSize = 1000m,
            Category = DishCategory.FirstCourse,
            Ingredients = new List<DishIngredientDto>(),
            Calories = 500m,
            Proteins = 40m,
            Fats = 20m,
            Carbohydrates = 60m,
            Flags = DietaryFlags.None
        };

    /// <summary>BV2: PortionSize=0.1g (нижняя валидная граница).</summary>
    public static DishCreateDto CreateSmallPortionDish() =>
        new()
        {
            Title = "Small Portion Dish",
            PortionSize = 0.1m,
            Category = DishCategory.Dessert,
            Ingredients = new List<DishIngredientDto>(),
            Calories = 10m,
            Proteins = 1m,
            Fats = 0.5m,
            Carbohydrates = 2m,
            Flags = DietaryFlags.None
        };

    /// <summary>BV3: PortionSize=0 — невалидная нижняя граница, должна вернуть 400.</summary>
    public static DishCreateDto CreateZeroPortionDish() =>
        new()
        {
            Title = "Zero Portion Dish",
            PortionSize = 0m,
            Category = DishCategory.Snack,
            Ingredients = new List<DishIngredientDto>(),
            Calories = 100m,
            Proteins = 5m,
            Fats = 5m,
            Carbohydrates = 10m,
            Flags = DietaryFlags.None
        };

    /// <summary>BV7: (Proteins+Fats+Carbs)/PortionSize*100 > 100 — невалидно, должно вернуть 400.</summary>
    public static DishCreateDto CreateMacrosTooHighDish() =>
        new()
        {
            Title = "Too High Macros Dish",
            PortionSize = 100m,
            Category = DishCategory.Snack,
            Ingredients = new List<DishIngredientDto>(),
            Calories = 700m,
            Proteins = 50m,
            Fats = 40m,
            Carbohydrates = 30m,
            Flags = DietaryFlags.None
        };

    /// <summary>BV6: (Proteins+Fats+Carbs)/PortionSize*100 ровно = 100 — граница включительно, должно пройти.</summary>
    public static DishCreateDto CreateMacrosAtExactLimitDish() =>
        new()
        {
            Title = "Exact Limit Macros Dish",
            PortionSize = 100m,
            Category = DishCategory.SecondCourse,
            Ingredients = new List<DishIngredientDto>(),
            Calories = 590m,
            Proteins = 40m,
            Fats = 30m,
            Carbohydrates = 30m,
            Flags = DietaryFlags.None
        };
}
