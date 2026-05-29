using System.Collections.Concurrent;
using TodoApp.Api.Domain;

namespace TodoApp.Api.Repositories;

/// <summary>
/// Thread-safe, process-lifetime in-memory store. Each user's items live in their own
/// concurrent map, so the repository is safe to register as a singleton and to hit from
/// concurrent requests. Data is lost on restart — by design for this exercise.
/// </summary>
public sealed class InMemoryTodoRepository : ITodoRepository
{
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<Guid, TodoItem>> _byUser = new();

    public IReadOnlyList<TodoItem> GetAll(string userId) =>
        _byUser.TryGetValue(userId, out var items)
            ? items.Values.ToList()
            : [];

    public TodoItem? Find(string userId, Guid id) =>
        _byUser.TryGetValue(userId, out var items) && items.TryGetValue(id, out var item)
            ? item
            : null;

    public void Add(string userId, TodoItem item)
    {
        var items = _byUser.GetOrAdd(userId, _ => new ConcurrentDictionary<Guid, TodoItem>());
        items[item.Id] = item;
    }

    public bool Update(string userId, TodoItem item)
    {
        // Replace only if the id already exists, so this never resurrects a deleted item.
        if (_byUser.TryGetValue(userId, out var items) && items.ContainsKey(item.Id))
        {
            items[item.Id] = item;
            return true;
        }

        return false;
    }

    public bool Delete(string userId, Guid id) =>
        _byUser.TryGetValue(userId, out var items) && items.TryRemove(id, out _);
}
