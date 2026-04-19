using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Domain.DTOs;
using Domain.Models;
using TestModule.Backend.IntegrationTests.Fixtures;
using TestModule.Backend.IntegrationTests.TestData;
using Xunit;

namespace TestModule.Backend.IntegrationTests.ApiTests;

public class ProductsApiTests : IClassFixture<ApiFixture>
{
    private readonly ApiFixture _fixture;
    private const string BaseUrl = "/api/products";

    public ProductsApiTests(ApiFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact(DisplayName = "КОГДА создается продукт со всеми валидными полями, ТОГДА API возвращает 201 Created")]
    public async Task CreateProduct_WithValidData_ReturnsCreated()
    {
        using var client = _fixture.Factory.CreateClient();
        var dto = ProductTestDataFactory.CreateValidProduct("Apple");
        var result = await CreateAndDeserialize(client, dto);
        Assert.Equal("Apple", result!.Title);
    }

    [Fact(DisplayName = "КОГДА создается продукт только с обязательными полями, ТОГДА он успешно создается с нулевыми КБЖУ")]
    public async Task CreateProduct_WithMinimalData_ReturnsCreated()
    {
        using var client = _fixture.Factory.CreateClient();
        var dto = ProductTestDataFactory.CreateMinimalProduct();
        var result = await CreateAndDeserialize(client, dto);
        Assert.Equal(0m, result!.Calories);
    }

    [Fact(DisplayName = "КОГДА запрашивается список без фильтров, ТОГДА возвращаются все продукты")]
    public async Task GetAllProducts_NoFilters_ReturnsNonEmptyList()
    {
        using var client = _fixture.Factory.CreateClient();
        var response = await client.GetAsync(BaseUrl);
        var result = await response.Content.ReadFromJsonAsync<List<ProductViewDto>>();
        Assert.NotNull(result);
        Assert.True(result.Count >= 3);
    }

    [Fact(DisplayName = "КОГДА выполняется поиск по названию из seed.sql, ТОГДА соответствующий продукт найден")]
    public async Task GetProducts_WithQueryMatchingTitle_ReturnsMatchingProduct()
    {
        using var client = _fixture.Factory.CreateClient();
        var response = await client.GetAsync($"{BaseUrl}?query={Uri.EscapeDataString("Seed Шоколадный торт")}");
        var result = await response.Content.ReadFromJsonAsync<List<ProductViewDto>>();
        Assert.Contains(result!, p => p.Title.Contains("Seed Шоколадный торт"));
    }

    [Fact(DisplayName = "КОГДА применяется фильтр по категории Sweets, ТОГДА возвращаются только сладости")]
    public async Task GetProducts_FilteredByCategory_ReturnsOnlyCategoryProducts()
    {
        using var client = _fixture.Factory.CreateClient();
        var response = await client.GetAsync($"{BaseUrl}?category=Sweets");
        var result = await response.Content.ReadFromJsonAsync<List<ProductViewDto>>();
        Assert.All(result!, p => Assert.Equal(ProductCategory.Sweets, p.Category));
    }

    [Fact(DisplayName = "КОГДА продукт обновляется валидными данными, ТОГДА изменения сохраняются")]
    public async Task UpdateProduct_WithValidData_ChangesArePersisted()
    {
        using var client = _fixture.Factory.CreateClient();
        var created = await CreateAndDeserialize(client, ProductTestDataFactory.CreateValidProduct("Original"));
        var updateDto = new ProductUpdateDto { Id = created!.Id, Title = "Updated", Calories = 200, Category = ProductCategory.Meat };
        var response = await client.PutAsJsonAsync($"{BaseUrl}/{created.Id}", updateDto);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = JsonSerializer.Deserialize<ProductViewDto>(body, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        Assert.Equal("Updated", result!.Title);
    }

    [Fact(DisplayName = "КОГДА удаляется существующий продукт, ТОГДА он становится недоступен")]
    public async Task DeleteProduct_WithValidId_RemovesProduct()
    {
        using var client = _fixture.Factory.CreateClient();
        var created = await CreateAndDeserialize(client, ProductTestDataFactory.CreateValidProduct("ToDelete"));
        await client.DeleteAsync($"{BaseUrl}/{created!.Id}");
        var response = await client.GetAsync($"{BaseUrl}/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<ProductViewDto?> CreateAndDeserialize(HttpClient client, ProductCreateDto dto)
    {
        var response = await client.PostAsJsonAsync(BaseUrl, dto);
        var body = await response.Content.ReadAsStringAsync();
        if (response.StatusCode != HttpStatusCode.Created)
        {
            throw new Exception($"Body: {body}");
        }
        return JsonSerializer.Deserialize<ProductViewDto>(body, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
    }
}
