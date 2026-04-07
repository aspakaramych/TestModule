using System;
using System.Collections.Generic;
using Domain.Models;
using Xunit;

namespace Domain.UnitTests;

public class DishMacrosCalculationTests 
{
    private Dish _dish;

    public DishMacrosCalculationTests()
    {
        _dish = new Dish();
    }

    private Product CreateProductStub(decimal calories, decimal proteins, decimal fats, decimal carbs)
    {
        return new Product
        {
            Id = Guid.NewGuid(),
            Calories = calories,
            Proteins = proteins,
            Fats = fats,
            Carbohydrates = carbs
        };
    }

    [Theory(DisplayName = "КОГДА подаются граничные значения для веса ингредиента, ТОГДА расчет КБЖУ блюда выполняется корректно")]
    [InlineData(-100, 0)]
    [InlineData(-1, 0)]
    [InlineData(0, 0)]
    [InlineData(1, 1)]
    [InlineData(50, 50)]
    [InlineData(100, 100)]
    [InlineData(10000, 10000)]
    public void RecalculateMacros_BoundaryValuesForAmount_IsCorrect(int amountInGrams, int expectedMultiplierFactor)
    {
        // Arrange
        var productStub = CreateProductStub(100m, 10m, 5m, 20m);
        _dish.Ingredients = new List<DishProductItem>
        {
            new DishProductItem { Product = productStub, AmountInGrams = amountInGrams }
        };

        // Act
        _dish.RecalculateMacrosFromIngredients();

        // Assert
        var expectedRatio = expectedMultiplierFactor / 100m;
        Assert.Equal(100m * expectedRatio, _dish.Calories);
        Assert.Equal(10m * expectedRatio, _dish.Proteins);
        Assert.Equal(5m * expectedRatio, _dish.Fats);
        Assert.Equal(20m * expectedRatio, _dish.Carbohydrates);
    }

    [Fact(DisplayName = "КОГДА ингредиент имеет экстремально малую дробную граммовку, ТОГДА КБЖУ рассчитывается без ошибок")]
    public void RecalculateMacros_FractionalBoundaryAmount_IsCorrect()
    {
        // Arrange
        var productStub = CreateProductStub(100m, 10m, 5m, 20m);
        _dish.Ingredients = new List<DishProductItem>
        {
            new DishProductItem { Product = productStub, AmountInGrams = 0.01m }
        };

        // Act
        _dish.RecalculateMacrosFromIngredients();

        // Assert
        var ratio = 0.01m / 100m;
        Assert.Equal(100m * ratio, _dish.Calories);
        Assert.Equal(10m * ratio, _dish.Proteins);
    }

    [Fact(DisplayName = "КОГДА блюдо содержит несколько ингредиентов с положительным весом, ТОГДА КБЖУ блюда равно сумме КБЖУ ингредиентов")]
    public void RecalculateMacros_MultipleIngredients_CalculatesSumCorrectly()
    {
        // Arrange
        var meatStub = CreateProductStub(250m, 26m, 15m, 0m);
        var potatoStub = CreateProductStub(77m, 2m, 0.4m, 17m);

        _dish.Ingredients = new List<DishProductItem>
        {
            new DishProductItem { Product = meatStub, AmountInGrams = 200m },
            new DishProductItem { Product = potatoStub, AmountInGrams = 150m }
        };

        // Act
        _dish.RecalculateMacrosFromIngredients();

        // Assert
        Assert.Equal((250m * 2.0m) + (77m * 1.5m), _dish.Calories);
        Assert.Equal((26m * 2.0m) + (2m * 1.5m), _dish.Proteins);
        Assert.Equal((15m * 2.0m) + (0.4m * 1.5m), _dish.Fats);
        Assert.Equal((0m * 2.0m) + (17m * 1.5m), _dish.Carbohydrates);
    }

    [Fact(DisplayName = "КОГДА список ингредиентов пуст или равен null, ТОГДА все макронутриенты блюда равны 0")]
    public void RecalculateMacros_EmptyOrNullIngredients_ReturnsZero()
    {
        // Arrange
        _dish.Ingredients = null!;

        // Act
        _dish.RecalculateMacrosFromIngredients();

        // Assert
        Assert.Equal(0m, _dish.Calories);
        Assert.Equal(0m, _dish.Proteins);
        Assert.Equal(0m, _dish.Fats);
        Assert.Equal(0m, _dish.Carbohydrates);
    }

    [Fact(DisplayName = "КОГДА в блюде есть ингредиент без продукта (Product == null), ТОГДА этот ингредиент игнорируется при расчёте")]
    public void RecalculateMacros_IngredientWithNullProduct_IsIgnored()
    {
        // Arrange
        var validProduct = CreateProductStub(100m, 10m, 10m, 10m);
        _dish.Ingredients = new List<DishProductItem>
        {
            new DishProductItem { Product = validProduct, AmountInGrams = 100m },
            new DishProductItem { Product = null!, AmountInGrams = 500m }
        };

        // Act
        _dish.RecalculateMacrosFromIngredients();

        // Assert
        Assert.Equal(100m, _dish.Calories);
        Assert.Equal(10m, _dish.Proteins);
    }
}
