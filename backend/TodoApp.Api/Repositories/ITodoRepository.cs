using TodoApp.Api.Domain;

namespace TodoApp.Api.Repositories;

/// <summary>
/// Persistence boundary for TODO items, partitioned by user id. The in-memory
/// implementation can be swapped for a database-backed one without touching callers.
/// </summary>
public interface ITodoRepository
{
    IReadOnlyList<TodoItem> GetAll(string userId);

    /// <returns>The item, or <c>null</c> if the user has no item with that id.</returns>
    TodoItem? Find(string userId, Guid id);

    void Add(string userId, TodoItem item);

    /// <summary>Replaces an existing item in place. Never inserts.</summary>
    /// <returns><c>true</c> if an item was replaced; <c>false</c> if it did not exist.</returns>
    bool Update(string userId, TodoItem item);

    /// <returns><c>true</c> if an item was removed; <c>false</c> if it did not exist.</returns>
    bool Delete(string userId, Guid id);
}
