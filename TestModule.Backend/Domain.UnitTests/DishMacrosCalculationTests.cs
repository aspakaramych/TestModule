using System;
using System.Collections.Generic;
using Domain.Models;
using Xunit;

namespace Domain.UnitTests
{
    public class DishMacrosCalculationTests
    {
        private Product MakeProduct(decimal cal, decimal pro, decimal fat, decimal carb)
            => new Product { Calories = cal, Proteins = pro, Fats = fat, Carbohydrates = carb };
        private DishProductItem MakeIngredient(Product p, decimal amount)
            => new DishProductItem { Product = p, AmountInGrams = amount };

        [Fact(DisplayName = "КОГДА блюдо содержит два ингредиента с разными КБЖУ, ТОГДА расчет КБЖУ блюда корректен")]
        public void RecalculateMacros_StandardCase_CorrectResult()
        {
            // Arrange
            var p1 = MakeProduct(100, 10, 5, 20); 
            var p2 = MakeProduct(200, 20, 10, 40);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 100), 
                    MakeIngredient(p2, 50)   
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(100 + 200*0.5m, dish.Calories);
            Assert.Equal(10 + 20*0.5m, dish.Proteins);
            Assert.Equal(5 + 10*0.5m, dish.Fats);
            Assert.Equal(20 + 40*0.5m, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с 0 грамм, ТОГДА КБЖУ блюда равны 0")]
        public void RecalculateMacros_ZeroAmountIngredient_ResultIgnoresZero()
        {
            // Arrange
            var p1 = MakeProduct(100, 10, 5, 20);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 0)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(0, dish.Calories);
            Assert.Equal(0, dish.Proteins);
            Assert.Equal(0, dish.Fats);
            Assert.Equal(0, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с 100 грамм, ТОГДА КБЖУ блюда совпадают с продуктом")]
        public void RecalculateMacros_100gIngredient_EqualsProduct()
        {
            // Arrange
            var p1 = MakeProduct(123, 11, 22, 33);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 100)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(p1.Calories, dish.Calories);
            Assert.Equal(p1.Proteins, dish.Proteins);
            Assert.Equal(p1.Fats, dish.Fats);
            Assert.Equal(p1.Carbohydrates, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо не содержит ингредиентов, ТОГДА КБЖУ блюда равны 0")]
        public void RecalculateMacros_NoIngredients_AllZero()
        {
            // Arrange
            var dish = new Dish();
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(0, dish.Calories);
            Assert.Equal(0, dish.Proteins);
            Assert.Equal(0, dish.Fats);
            Assert.Equal(0, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с максимальными значениями, ТОГДА расчет КБЖУ блюда корректен")]
        public void RecalculateMacros_MaxValues_CorrectResult()
        {
            // Arrange
            var max = decimal.MaxValue/1000; 
            var p1 = MakeProduct(max, max, max, max);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 100)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(max, dish.Calories);
            Assert.Equal(max, dish.Proteins);
            Assert.Equal(max, dish.Fats);
            Assert.Equal(max, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с null Product, ТОГДА такой ингредиент игнорируется при расчёте КБЖУ блюда")]
        public void RecalculateMacros_NullProductIngredient_IgnoresNull()
        {
            // Arrange
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    new DishProductItem { Product = null, AmountInGrams = 100 }
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(0, dish.Calories);
            Assert.Equal(0, dish.Proteins);
            Assert.Equal(0, dish.Fats);
            Assert.Equal(0, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с отрицательной массой, ТОГДА такой ингредиент игнорируется при расчёте КБЖУ блюда")]
        public void RecalculateMacros_NegativeAmountIngredient_IgnoresNegative()
        {
            // Arrange
            var p1 = MakeProduct(100, 10, 5, 20);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, -50)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(0, dish.Calories);
            Assert.Equal(0, dish.Proteins);
            Assert.Equal(0, dish.Fats);
            Assert.Equal(0, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с дробной массой, ТОГДА расчет КБЖУ блюда корректен")]
        public void RecalculateMacros_FractionalAmountIngredient_CorrectResult()
        {
            // Arrange
            var p1 = MakeProduct(100, 10, 5, 20);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 12.5m)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(100 * 0.125m, dish.Calories);
            Assert.Equal(10 * 0.125m, dish.Proteins);
            Assert.Equal(5 * 0.125m, dish.Fats);
            Assert.Equal(20 * 0.125m, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с нулевыми КБЖУ, ТОГДА КБЖУ блюда равны 0")]
        public void RecalculateMacros_ZeroMacrosProduct_ResultZero()
        {
            // Arrange
            var p1 = MakeProduct(0, 0, 0, 0);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 100)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(0, dish.Calories);
            Assert.Equal(0, dish.Proteins);
            Assert.Equal(0, dish.Fats);
            Assert.Equal(0, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с очень маленькой положительной массой, ТОГДА расчет КБЖУ блюда корректен")]
        public void RecalculateMacros_VerySmallAmount_CorrectResult()
        {
            // Arrange
            var p1 = MakeProduct(100, 10, 5, 20);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 0.001m)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(100 * 0.00001m, dish.Calories);
            Assert.Equal(10 * 0.00001m, dish.Proteins);
            Assert.Equal(5 * 0.00001m, dish.Fats);
            Assert.Equal(20 * 0.00001m, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с большой массой, ТОГДА расчет КБЖУ блюда корректен")]
        public void RecalculateMacros_LargeAmount_CorrectResult()
        {
            // Arrange
            var p1 = MakeProduct(100, 10, 5, 20);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 1000)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(100 * 10, dish.Calories);
            Assert.Equal(10 * 10, dish.Proteins);
            Assert.Equal(5 * 10, dish.Fats);
            Assert.Equal(20 * 10, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с очень маленькой отрицательной массой, ТОГДА такой ингредиент игнорируется при расчёте КБЖУ блюда")]
        public void RecalculateMacros_VerySmallNegativeAmount_Ignores()
        {
            // Arrange
            var p1 = MakeProduct(100, 10, 5, 20);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, -0.0001m)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(0, dish.Calories);
            Assert.Equal(0, dish.Proteins);
            Assert.Equal(0, dish.Fats);
            Assert.Equal(0, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с отрицательной массой, ТОГДА такой ингредиент игнорируется при расчёте КБЖУ блюда")]
        public void RecalculateMacros_NegativeAmountBoundary_Ignores()
        {
            // Arrange
            var p1 = MakeProduct(100, 10, 5, 20);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, -1)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(0, dish.Calories);
            Assert.Equal(0, dish.Proteins);
            Assert.Equal(0, dish.Fats);
            Assert.Equal(0, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с нулевой массой, ТОГДА такой ингредиент игнорируется при расчёте КБЖУ блюда")]
        public void RecalculateMacros_ZeroAmountBoundary_Ignores()
        {
            // Arrange
            var p1 = MakeProduct(100, 10, 5, 20);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 0)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(0, dish.Calories);
            Assert.Equal(0, dish.Proteins);
            Assert.Equal(0, dish.Fats);
            Assert.Equal(0, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с минимальной положительной массой, ТОГДА расчет КБЖУ блюда корректен")]
        public void RecalculateMacros_MinPositiveAmountBoundary_Correct()
        {
            // Arrange
            var p1 = MakeProduct(100, 10, 5, 20);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 0.0001m)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(100 * 0.000001m, dish.Calories);
            Assert.Equal(10 * 0.000001m, dish.Proteins);
            Assert.Equal(5 * 0.000001m, dish.Fats);
            Assert.Equal(20 * 0.000001m, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с стандартной массой, ТОГДА расчет КБЖУ блюда корректен")]
        public void RecalculateMacros_StandardAmountBoundary_Correct()
        {
            // Arrange
            var p1 = MakeProduct(100, 10, 5, 20);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 100)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(100, dish.Calories);
            Assert.Equal(10, dish.Proteins);
            Assert.Equal(5, dish.Fats);
            Assert.Equal(20, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с большой массой, ТОГДА расчет КБЖУ блюда корректен")]
        public void RecalculateMacros_LargeAmountBoundary_Correct()
        {
            // Arrange
            var p1 = MakeProduct(100, 10, 5, 20);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 1000)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(1000, dish.Calories);
            Assert.Equal(100, dish.Proteins);
            Assert.Equal(50, dish.Fats);
            Assert.Equal(200, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с нулевыми макронутриентами, ТОГДА КБЖУ блюда нулевые")]
        public void RecalculateMacros_ZeroMacrosBoundary_Zero()
        {
            // Arrange
            var p1 = MakeProduct(0, 0, 0, 0);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 100)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(0, dish.Calories);
            Assert.Equal(0, dish.Proteins);
            Assert.Equal(0, dish.Fats);
            Assert.Equal(0, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с минимальными положительными макронутриентами, ТОГДА расчет КБЖУ блюда корректен")]
        public void RecalculateMacros_MinPositiveMacrosBoundary_Correct()
        {
            // Arrange
            var p1 = MakeProduct(0.0001m, 0.0001m, 0.0001m, 0.0001m);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 100)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(0.0001m, dish.Calories);
            Assert.Equal(0.0001m, dish.Proteins);
            Assert.Equal(0.0001m, dish.Fats);
            Assert.Equal(0.0001m, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент со стандартными макронутриентами, ТОГДА расчет КБЖУ блюда корректен")]
        public void RecalculateMacros_StandardMacrosBoundary_Correct()
        {
            // Arrange
            var p1 = MakeProduct(100, 10, 5, 20);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 100)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(100, dish.Calories);
            Assert.Equal(10, dish.Proteins);
            Assert.Equal(5, dish.Fats);
            Assert.Equal(20, dish.Carbohydrates);
        }

        [Fact(DisplayName = "КОГДА блюдо содержит ингредиент с отрицательными макронутриентами, ТОГДА расчет КБЖУ блюда корректен")]
        public void RecalculateMacros_NegativeMacrosBoundary_Correct()
        {
            // Arrange
            var p1 = MakeProduct(-10, -1, -0.5m, -2);
            var dish = new Dish {
                Ingredients = new List<DishProductItem> {
                    MakeIngredient(p1, 100)
                }
            };
            // Act
            dish.RecalculateMacrosFromIngredients();
            // Assert
            Assert.Equal(-10, dish.Calories);
            Assert.Equal(-1, dish.Proteins);
            Assert.Equal(-0.5m, dish.Fats);
            Assert.Equal(-2, dish.Carbohydrates);
        }
    }
}
