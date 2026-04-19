using System.Net;
using System.Text.Json;
using Domain.DTOs;
using TestModule.Backend.IntegrationTests.Fixtures;
using TestModule.Backend.IntegrationTests.TestData;
using Xunit;

namespace TestModule.Backend.IntegrationTests.ApiTests;

public class DishesApiTests : IClassFixture<ApiFixture>
{
    private readonly ApiFixture _fixture;
    private const string DishUrl = "/api/dishes";

    public DishesApiTests(ApiFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact(DisplayName = "КОГДА создаётся валидное блюдо, ТОГДА API возвращает 201 Created")]
    public async Task CreateDish_WithValidData_ReturnsCreated()
    {
        using var client = _fixture.Factory.CreateClient();
        var dto = DishTestDataFactory.CreateValidDish("Standard Dish");
        var result = await CreateAndDeserialize(client, dto);
        Assert.NotEqual(Guid.Empty, result!.Id);
    }

    [Fact(DisplayName = "КОГДА Calories=0 и Proteins=0, ТОГДА система рассчитывает КБЖУ по ингредиентам")]
    public async Task CreateDish_WithZeroMacrosAndIngredients_MacrosAreRecalculated()
    {
        using var client = _fixture.Factory.CreateClient();
        var seedProductId = new Guid("a1000000-0000-0000-0000-000000000005");
        var dto = new DishCreateDto
        {
            Title = "Recalc Dish",
            PortionSize = 100,
            Calories = 0, Proteins = 0, Fats = 0, Carbohydrates = 0,
            Ingredients = new List<DishIngredientDto> { new() { ProductId = seedProductId, AmountInGrams = 100 } }
        };
        var result = await CreateAndDeserialize(client, dto);
        Assert.InRange(result!.Calories, 99.99m, 100.01m);
    }

    [Fact(DisplayName = "КОГДА выполняется поиск по названию из seed.sql, ТОГДА возвращается блюдо")]
    public async Task GetDishes_WithQueryMatchingTitle_ReturnsMatchingDish()
    {
        using var client = _fixture.Factory.CreateClient();
        var response = await client.GetAsync($"{DishUrl}?query={Uri.EscapeDataString("Seed Тирамису")}");
        var result = await response.Content.ReadFromJsonAsync<List<DishViewDto>>();
        Assert.Contains(result!, d => d.Title.Contains("Seed Тирамису"));
    }

    [Fact(DisplayName = "КОГДА сумма БЖУ на 100г превышает 100г, ТОГДА API возвращает 400 Bad Request")]
    public async Task CreateDish_WithMacrosSumExceedingLimit_ReturnsBadRequest()
    {
        using var client = _fixture.Factory.CreateClient();
        var dto = DishTestDataFactory.CreateMacrosTooHighDish();
        var response = await client.PostAsJsonAsync(DishUrl, dto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private async Task<DishViewDto?> CreateAndDeserialize(HttpClient client, DishCreateDto dto)
    {
        var response = await client.PostAsJsonAsync(DishUrl, dto);
        var body = await response.Content.ReadAsStringAsync();
        if (response.StatusCode != HttpStatusCode.Created)
        {
            throw new Exception($"Body: {body}");
        }
        return JsonSerializer.Deserialize<DishViewDto>(body, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
    }
}
