using TodoApp.Api.Domain;
using TodoApp.Api.Repositories;

namespace TodoApp.Api.Tests.Repositories;

public class InMemoryTodoRepositoryTests
{
    private static TodoItem NewItem(string title = "task") => new()
    {
        Id = Guid.NewGuid(),
        Title = title,
        CreatedAtUtc = DateTimeOffset.UtcNow,
    };

    [Fact]
    public void GetAll_returns_empty_for_unknown_user()
    {
        var repo = new InMemoryTodoRepository();

        Assert.Empty(repo.GetAll("user-1"));
    }

    [Fact]
    public void Add_then_GetAll_returns_the_item()
    {
        var repo = new InMemoryTodoRepository();
        var item = NewItem();

        repo.Add("user-1", item);

        var all = repo.GetAll("user-1");
        Assert.Single(all);
        Assert.Equal(item.Id, all[0].Id);
    }

    [Fact]
    public void Items_are_isolated_per_user()
    {
        var repo = new InMemoryTodoRepository();

        repo.Add("user-1", NewItem("a"));

        Assert.Single(repo.GetAll("user-1"));
        Assert.Empty(repo.GetAll("user-2"));
    }

    [Fact]
    public void Delete_removes_existing_item_and_returns_true()
    {
        var repo = new InMemoryTodoRepository();
        var item = NewItem();
        repo.Add("user-1", item);

        var deleted = repo.Delete("user-1", item.Id);

        Assert.True(deleted);
        Assert.Empty(repo.GetAll("user-1"));
    }

    [Fact]
    public void Delete_returns_false_for_unknown_id()
    {
        var repo = new InMemoryTodoRepository();

        Assert.False(repo.Delete("user-1", Guid.NewGuid()));
    }

    [Fact]
    public void Find_returns_the_item_when_present()
    {
        var repo = new InMemoryTodoRepository();
        var item = NewItem();
        repo.Add("user-1", item);

        Assert.Equal(item.Id, repo.Find("user-1", item.Id)?.Id);
    }

    [Fact]
    public void Find_returns_null_for_unknown_id_or_user()
    {
        var repo = new InMemoryTodoRepository();
        var item = NewItem();
        repo.Add("user-1", item);

        Assert.Null(repo.Find("user-1", Guid.NewGuid()));
        Assert.Null(repo.Find("user-2", item.Id));
    }

    [Fact]
    public void Update_replaces_existing_item_and_returns_true()
    {
        var repo = new InMemoryTodoRepository();
        var item = NewItem("before");
        repo.Add("user-1", item);

        var replacement = new TodoItem
        {
            Id = item.Id,
            Title = "after",
            Description = "notes",
            CreatedAtUtc = item.CreatedAtUtc,
        };
        var updated = repo.Update("user-1", replacement);

        Assert.True(updated);
        Assert.Equal("after", repo.Find("user-1", item.Id)?.Title);
        Assert.Single(repo.GetAll("user-1"));
    }

    [Fact]
    public void Update_returns_false_for_unknown_id_and_does_not_insert()
    {
        var repo = new InMemoryTodoRepository();

        var updated = repo.Update("user-1", NewItem());

        Assert.False(updated);
        Assert.Empty(repo.GetAll("user-1"));
    }

    [Fact]
    public async Task Concurrent_adds_are_all_persisted()
    {
        var repo = new InMemoryTodoRepository();
        const int count = 200;

        await Parallel.ForEachAsync(
            Enumerable.Range(0, count),
            async (_, _) =>
            {
                await Task.Yield();
                repo.Add("user-1", NewItem());
            });

        Assert.Equal(count, repo.GetAll("user-1").Count);
    }
}
