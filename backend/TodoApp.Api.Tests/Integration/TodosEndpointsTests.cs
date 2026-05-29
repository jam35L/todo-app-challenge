using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using TodoApp.Api.Dtos;

namespace TodoApp.Api.Tests.Integration;

/// <summary>
/// End-to-end tests over the real HTTP pipeline. The in-memory store is a singleton
/// shared across the fixture, so each test uses a unique user id to stay isolated.
/// </summary>
public class TodosEndpointsTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private HttpClient CreateClient(string? userId)
    {
        var client = factory.CreateClient();
        if (userId is not null)
        {
            client.DefaultRequestHeaders.Add("X-User-Id", userId);
        }

        return client;
    }

    private HttpClient CreateClientForNewUser() => CreateClient(Guid.NewGuid().ToString());

    [Fact]
    public async Task Get_returns_an_empty_list_initially()
    {
        var client = CreateClientForNewUser();

        var todos = await client.GetFromJsonAsync<List<TodoResponse>>("/api/todos");

        Assert.NotNull(todos);
        Assert.Empty(todos);
    }

    [Fact]
    public async Task Post_creates_a_todo_and_it_appears_in_the_list()
    {
        var client = CreateClientForNewUser();

        var response = await client.PostAsJsonAsync("/api/todos", new { title = "buy milk" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var created = await response.Content.ReadFromJsonAsync<TodoResponse>();
        Assert.NotNull(created);
        Assert.Equal("buy milk", created!.Title);
        Assert.NotEqual(Guid.Empty, created.Id);

        var todos = await client.GetFromJsonAsync<List<TodoResponse>>("/api/todos");
        Assert.Contains(todos!, t => t.Id == created.Id);
    }

    [Fact]
    public async Task Post_echoes_the_description_when_provided()
    {
        var client = CreateClientForNewUser();

        var response = await client.PostAsJsonAsync(
            "/api/todos",
            new { title = "buy milk", description = "from the corner shop" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<TodoResponse>();
        Assert.Equal("from the corner shop", created!.Description);
    }

    [Fact]
    public async Task Post_without_a_description_succeeds_with_null_description()
    {
        var client = CreateClientForNewUser();

        var response = await client.PostAsJsonAsync("/api/todos", new { title = "buy milk" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<TodoResponse>();
        Assert.Null(created!.Description);
    }

    [Fact]
    public async Task Post_with_a_too_long_description_returns_400()
    {
        var client = CreateClientForNewUser();

        var response = await client.PostAsJsonAsync(
            "/api/todos",
            new { title = "buy milk", description = new string('a', 201) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Post_with_an_empty_title_returns_400()
    {
        var client = CreateClientForNewUser();

        var response = await client.PostAsJsonAsync("/api/todos", new { title = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Post_with_a_too_long_title_returns_400()
    {
        var client = CreateClientForNewUser();

        var response = await client.PostAsJsonAsync(
            "/api/todos",
            new { title = new string('a', 201) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Post_without_a_title_field_returns_400()
    {
        var client = CreateClientForNewUser();

        var response = await client.PostAsJsonAsync("/api/todos", new { });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Delete_removes_an_existing_todo_and_returns_204()
    {
        var client = CreateClientForNewUser();
        var created = await (await client.PostAsJsonAsync("/api/todos", new { title = "doomed" }))
            .Content.ReadFromJsonAsync<TodoResponse>();

        var deleteResponse = await client.DeleteAsync($"/api/todos/{created!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        var todos = await client.GetFromJsonAsync<List<TodoResponse>>("/api/todos");
        Assert.DoesNotContain(todos!, t => t.Id == created.Id);
    }

    [Fact]
    public async Task Delete_of_an_unknown_id_returns_404()
    {
        var client = CreateClientForNewUser();

        var response = await client.DeleteAsync($"/api/todos/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Todos_are_isolated_per_user()
    {
        var alice = CreateClientForNewUser();
        var bob = CreateClientForNewUser();
        await alice.PostAsJsonAsync("/api/todos", new { title = "alice's task" });

        var bobTodos = await bob.GetFromJsonAsync<List<TodoResponse>>("/api/todos");

        Assert.Empty(bobTodos!);
    }

    [Fact]
    public async Task Missing_user_id_header_returns_400()
    {
        var client = CreateClient(userId: null);

        var response = await client.GetAsync("/api/todos");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
