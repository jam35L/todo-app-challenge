using TodoApp.Api.Common;
using TodoApp.Api.Domain;
using TodoApp.Api.Repositories;

namespace TodoApp.Api.Services;

public sealed class TodoService(ITodoRepository repository, TimeProvider timeProvider) : ITodoService
{
    public const int MaxTitleLength = 200;

    public IReadOnlyList<TodoItem> GetTodos(string userId) =>
        repository.GetAll(userId)
            .OrderByDescending(item => item.CreatedAtUtc)
            .ToList();

    public TodoItem AddTodo(string userId, string? title)
    {
        var trimmed = (title ?? string.Empty).Trim();
        if (trimmed.Length == 0)
        {
            throw new ValidationException("Title is required.");
        }

        if (trimmed.Length > MaxTitleLength)
        {
            throw new ValidationException($"Title must be {MaxTitleLength} characters or fewer.");
        }

        var item = new TodoItem
        {
            Id = Guid.NewGuid(),
            Title = trimmed,
            CreatedAtUtc = timeProvider.GetUtcNow(),
        };
        repository.Add(userId, item);
        return item;
    }

    public bool DeleteTodo(string userId, Guid id) => repository.Delete(userId, id);
}
