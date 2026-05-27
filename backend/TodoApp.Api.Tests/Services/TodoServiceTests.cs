using TodoApp.Api.Common;
using TodoApp.Api.Repositories;
using TodoApp.Api.Services;

namespace TodoApp.Api.Tests.Services;

public class TodoServiceTests
{
    private static TodoService CreateService(TimeProvider? clock = null) =>
        new(new InMemoryTodoRepository(), clock ?? new MutableClock(DateTimeOffset.UtcNow));

    [Fact]
    public void AddTodo_stores_and_returns_the_item()
    {
        var clock = new MutableClock(DateTimeOffset.Parse("2026-01-01T00:00:00Z"));
        var service = CreateService(clock);

        var created = service.AddTodo("user-1", "buy milk");

        Assert.NotEqual(Guid.Empty, created.Id);
        Assert.Equal("buy milk", created.Title);
        Assert.Equal(clock.GetUtcNow(), created.CreatedAt);
        Assert.Single(service.GetTodos("user-1"));
    }

    [Fact]
    public void AddTodo_trims_the_title()
    {
        var service = CreateService();

        var created = service.AddTodo("user-1", "  buy milk  ");

        Assert.Equal("buy milk", created.Title);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void AddTodo_rejects_missing_or_blank_titles(string? title)
    {
        var service = CreateService();

        Assert.Throws<ValidationException>(() => service.AddTodo("user-1", title));
    }

    [Fact]
    public void AddTodo_rejects_titles_longer_than_the_limit()
    {
        var service = CreateService();
        var tooLong = new string('a', TodoService.MaxTitleLength + 1);

        Assert.Throws<ValidationException>(() => service.AddTodo("user-1", tooLong));
    }

    [Fact]
    public void AddTodo_accepts_a_title_at_the_limit()
    {
        var service = CreateService();
        var atLimit = new string('a', TodoService.MaxTitleLength);

        var created = service.AddTodo("user-1", atLimit);

        Assert.Equal(atLimit, created.Title);
    }

    [Fact]
    public void GetTodos_returns_items_newest_first()
    {
        var clock = new MutableClock(DateTimeOffset.Parse("2026-01-01T00:00:00Z"));
        var service = CreateService(clock);

        var first = service.AddTodo("user-1", "first");
        clock.Advance(TimeSpan.FromMinutes(1));
        var second = service.AddTodo("user-1", "second");

        var todos = service.GetTodos("user-1");

        Assert.Equal(second.Id, todos[0].Id);
        Assert.Equal(first.Id, todos[1].Id);
    }

    [Fact]
    public void DeleteTodo_delegates_to_the_repository()
    {
        var service = CreateService();
        var created = service.AddTodo("user-1", "buy milk");

        Assert.True(service.DeleteTodo("user-1", created.Id));
        Assert.False(service.DeleteTodo("user-1", Guid.NewGuid()));
    }
}

/// <summary>Controllable <see cref="TimeProvider"/> for deterministic ordering tests.</summary>
file sealed class MutableClock(DateTimeOffset start) : TimeProvider
{
    private DateTimeOffset _now = start;

    public override DateTimeOffset GetUtcNow() => _now;

    public void Advance(TimeSpan by) => _now = _now.Add(by);
}
