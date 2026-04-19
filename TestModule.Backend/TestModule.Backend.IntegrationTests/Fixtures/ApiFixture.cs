using Microsoft.AspNetCore.Mvc.Testing;
using AppHost;
using Xunit;

namespace TestModule.Backend.IntegrationTests.Fixtures;

public class ApiFixture : IAsyncLifetime
{
    private WebApplicationFactory<Program>? _factory;

    public WebApplicationFactory<Program> Factory => _factory ?? throw new InvalidOperationException("Fixture not initialized");

    public async Task InitializeAsync()
    {
        await DatabaseFixture.SeedAsync();

        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseSetting("ConnectionStrings:DefaultConnection", DatabaseFixture.ConnectionString);
            });
    }

    public async Task DisposeAsync()
    {
        if (_factory != null) await _factory.DisposeAsync();
        await DatabaseFixture.CleanSeedAsync();
    }
}
