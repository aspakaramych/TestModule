using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Domain.DTOs;
using Domain.Models;
using TestModule.Backend.IntegrationTests.Fixtures;
using TestModule.Backend.IntegrationTests.TestData;
using Xunit;

namespace TestModule.Backend.IntegrationTests.ApiTests;

[Collection("ApiCollection")]
public class DishesApiTests
{
    private readonly ApiFixture _fixture;
    private const string DishUrl = "/api/dishes";
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public DishesApiTests(ApiFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact(DisplayName = "ЛОГИКА: Автоматический расчет КБЖУ по ингредиентам")]
    public async Task CreateDish_WithZeroMacros_RecalculatesFromIngredients()
    {
        var client = _fixture.Client;
        var eggId = new Guid("a1000000-0000-0000-0000-000000000005");
        var dto = DishTestDataFactory.CreateMinimalDish();
        dto.Title = "Egg Omelette";
        dto.PortionSize = 100;
        dto.Ingredients = new List<DishIngredientDto> { new() { ProductId = eggId, AmountInGrams = 100 } };

        var response = await client.PostAsJsonAsync(DishUrl, dto);
        var result = await response.Content.ReadFromJsonAsync<DishViewDto>(_jsonOptions);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.InRange(result!.Calories, 99.9m, 100.1m);
        Assert.InRange(result.Proteins, 9.9m, 10.1m);
    }

    [Theory(DisplayName = "ЛОГИКА: Изменение категории на основе макроса в названии")]
    [InlineData("Весенний !салат", DishCategory.Salad)]
    [InlineData("Шоколадный !десерт", DishCategory.Dessert)]
    public async Task CreateDish_WithMacroInTitle_SetsCorrectCategory(string title, DishCategory expectedCategory)
    {
        var client = _fixture.Client;
        var dto = DishTestDataFactory.CreateValidDish(title);
        dto.Category = 0;

        var response = await client.PostAsJsonAsync(DishUrl, dto);
        var result = await response.Content.ReadFromJsonAsync<DishViewDto>(_jsonOptions);

        Assert.Equal(expectedCategory, result!.Category);
        Assert.DoesNotContain("!", result.Title);
    }

    [Theory(DisplayName = "УСПЕХ: Валидные граничные значения (PortionSize, Exact Macros)")]
    [MemberData(nameof(GetValidBoundaryDishTestData))]
    public async Task CreateDish_ValidBoundaryValues_ReturnsCreated(DishCreateDto dto)
    {
        var client = _fixture.Client;
        var response = await client.PostAsJsonAsync(DishUrl, dto);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    public static IEnumerable<object[]> GetValidBoundaryDishTestData()
    {
        yield return new object[] { DishTestDataFactory.CreateSmallPortionDish() }; // 0.1g
        yield return new object[] { DishTestDataFactory.CreateLargePortionDish() }; // 1000g
        yield return new object[] { DishTestDataFactory.CreateMacrosAtExactLimitDish() }; // 100g/100g
    }

    [Theory(DisplayName = "УСПЕХ: Создание блюда для всех категорий")]
    [InlineData(DishCategory.FirstCourse)]
    [InlineData(DishCategory.SecondCourse)]
    [InlineData(DishCategory.Dessert)]
    [InlineData(DishCategory.Salad)]
    [InlineData(DishCategory.Soup)]
    [InlineData(DishCategory.Snack)]
    [InlineData(DishCategory.Drink)]
    public async Task CreateDish_AllCategories_ReturnsCreated(DishCategory category)
    {
        var client = _fixture.Client;
        var dto = DishTestDataFactory.CreateDishInCategory(category);

        var response = await client.PostAsJsonAsync(DishUrl, dto);
        var result = await response.Content.ReadFromJsonAsync<DishViewDto>(_jsonOptions);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal(category, result!.Category);
    }

    [Theory(DisplayName = "ВАЛИДАЦИЯ: Проверка некорректных данных (BV3, BV7)")]
    [MemberData(nameof(GetInvalidDishTestData))]
    public async Task CreateDish_InvalidData_ReturnsBadRequest(DishCreateDto dto, string expectedError)
    {
        var client = _fixture.Client;

        var response = await client.PostAsJsonAsync(DishUrl, dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var error = await response.Content.ReadAsStringAsync();
        Assert.Contains(expectedError, error);
    }

    [Fact(DisplayName = "ЛОГИКА: Фильтрация некорректных диетических флагов по ингредиентам")]
    public async Task CreateDish_WithConflictingFlags_FlagsAreFiltered()
    {
        var client = _fixture.Client;
        var chickenId = new Guid("a1000000-0000-0000-0000-000000000004");
        var dto = DishTestDataFactory.CreateValidDish("Fake Vegan Dish");
        dto.Flags = DietaryFlags.Vegan;
        dto.Ingredients = new List<DishIngredientDto> { new() { ProductId = chickenId, AmountInGrams = 100 } };

        var response = await client.PostAsJsonAsync(DishUrl, dto);
        var result = await response.Content.ReadFromJsonAsync<DishViewDto>(_jsonOptions);

        Assert.False(result!.Flags.HasFlag(DietaryFlags.Vegan));
    }

    public static IEnumerable<object[]> GetInvalidDishTestData()
    {
        yield return new object[] { DishTestDataFactory.CreateZeroPortionDish(), "Portion size must be greater than 0" };
        yield return new object[] { DishTestDataFactory.CreateMacrosTooHighDish(), "Sum of proteins, fats, and carbohydrates per 100g cannot exceed 100g" };
    }

    [Fact(DisplayName = "СПИСОК: Получение блюд с фильтрацией по категории и флагам")]
    public async Task GetDishes_WithFilters_ReturnsCorrectDishes()
    {
        var client = _fixture.Client;
        var url = $"{DishUrl}?category=Dessert";

        var response = await client.GetAsync(url);
        var result = await response.Content.ReadFromJsonAsync<List<DishViewDto>>(_jsonOptions);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.All(result!, d => Assert.Equal(DishCategory.Dessert, d.Category));
    }

    [Fact(DisplayName = "ПОИСК: Поиск блюда по названию из начальных данных")]
    public async Task GetDishes_SearchByTitle_ReturnsExpectedDish()
    {
        var client = _fixture.Client;
        var response = await client.GetAsync($"{DishUrl}?query={Uri.EscapeDataString("Тирамису")}");
        var result = await response.Content.ReadFromJsonAsync<List<DishViewDto>>(_jsonOptions);

        Assert.NotEmpty(result!);
        Assert.Contains(result!, d => d.Title.Contains("Тирамису"));
    }

    [Fact(DisplayName = "ОБНОВЛЕНИЕ: Изменение существующего блюда")]
    public async Task UpdateDish_ValidUpdate_StoredCorrectly()
    {
        var client = _fixture.Client;
        var createdDto = DishTestDataFactory.CreateValidDish("Before Update Dish");
        var createResponse = await client.PostAsJsonAsync(DishUrl, createdDto);
        var created = await createResponse.Content.ReadFromJsonAsync<DishViewDto>(_jsonOptions);

        var updateDto = new DishUpdateDto 
        { 
            Id = created!.Id, 
            Title = "After Update Dish", 
            PortionSize = 333,
            Category = DishCategory.Dessert 
        };

        var updateResponse = await client.PutAsJsonAsync($"{DishUrl}/{created.Id}", updateDto);
        var updated = await updateResponse.Content.ReadFromJsonAsync<DishViewDto>(_jsonOptions);

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        Assert.Equal("After Update Dish", updated!.Title);
        Assert.Equal(333, updated.PortionSize);
    }

    [Fact(DisplayName = "ОШИБКА: Обновление блюда с невалидным размером порции")]
    public async Task UpdateDish_InvalidPortion_ReturnsBadRequest()
    {
        var client = _fixture.Client;
        var createdDto = DishTestDataFactory.CreateValidDish("To Update Invalid Dish");
        var createResponse = await client.PostAsJsonAsync(DishUrl, createdDto);
        var created = await createResponse.Content.ReadFromJsonAsync<DishViewDto>(_jsonOptions);

        var updateDto = new DishUpdateDto 
        { 
            Id = created!.Id, 
            Title = created.Title,
            PortionSize = 0 // Invalid
        };

        var response = await client.PutAsJsonAsync($"{DishUrl}/{created.Id}", updateDto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact(DisplayName = "УДАЛЕНИЕ: Удаление блюда и проверка его отсутствия")]
    public async Task DeleteDish_Exists_RemovedSuccessfully()
    {
        var client = _fixture.Client;
        var createdDto = DishTestDataFactory.CreateValidDish("To Delete Dish");
        var createResponse = await client.PostAsJsonAsync(DishUrl, createdDto);
        var created = await createResponse.Content.ReadFromJsonAsync<DishViewDto>(_jsonOptions);

        var deleteResponse = await client.DeleteAsync($"{DishUrl}/{created!.Id}");
        var getResponse = await client.GetAsync($"{DishUrl}/{created.Id}");

        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }
}
