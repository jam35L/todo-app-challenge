using TodoApp.Api.Domain;

namespace TodoApp.Api.Repositories;

/// <summary>
/// Persistence boundary for TODO items, partitioned by user id. The in-memory
/// implementation can be swapped for a database-backed one without touching callers.
/// </summary>
public interface ITodoRepository
{
    IReadOnlyList<TodoItem> GetAll(string userId);

    void Add(string userId, TodoItem item);

    /// <returns><c>true</c> if an item was removed; <c>false</c> if it did not exist.</returns>
    bool Delete(string userId, Guid id);
}
