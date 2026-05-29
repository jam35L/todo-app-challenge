using TodoApp.Api.Common;
using TodoApp.Api.Domain;
using TodoApp.Api.Repositories;

namespace TodoApp.Api.Services;

public sealed class TodoService(ITodoRepository repository, TimeProvider timeProvider) : ITodoService
{
    public const int MaxTitleLength = 200;
    public const int MaxDescriptionLength = 200;

    public IReadOnlyList<TodoItem> GetTodos(string userId) =>
        repository.GetAll(userId)
            .OrderByDescending(item => item.CreatedAtUtc)
            .ToList();

    public TodoItem AddTodo(string userId, string? title, string? description)
    {
        var (trimmedTitle, trimmedDescription) = Normalize(title, description);
        var item = new TodoItem
        {
            Id = Guid.NewGuid(),
            Title = trimmedTitle,
            Description = trimmedDescription,
            CreatedAtUtc = timeProvider.GetUtcNow(),
        };
        repository.Add(userId, item);
        return item;
    }

    public TodoItem? UpdateTodo(string userId, Guid id, string? title, string? description)
    {
        // Validate first so bad input is a 400 regardless of whether the id exists.
        var (trimmedTitle, trimmedDescription) = Normalize(title, description);

        var existing = repository.Find(userId, id);
        if (existing is null)
        {
            return null;
        }

        var updated = new TodoItem
        {
            Id = existing.Id,
            Title = trimmedTitle,
            Description = trimmedDescription,
            CreatedAtUtc = existing.CreatedAtUtc, // creation time is immutable
        };
        repository.Update(userId, updated);
        return updated;
    }

    public bool DeleteTodo(string userId, Guid id) => repository.Delete(userId, id);

    /// <summary>
    /// Trims and validates the title (required, max length) and the optional description
    /// (blank becomes null, otherwise max length). Throws <see cref="ValidationException"/>.
    /// </summary>
    private static (string Title, string? Description) Normalize(string? title, string? description)
    {
        var trimmedTitle = (title ?? string.Empty).Trim();
        if (trimmedTitle.Length == 0)
        {
            throw new ValidationException("Title is required.");
        }

        if (trimmedTitle.Length > MaxTitleLength)
        {
            throw new ValidationException($"Title must be {MaxTitleLength} characters or fewer.");
        }

        // Description is optional: blank/whitespace becomes null; otherwise it is length-checked.
        var trimmedDescription = description?.Trim();
        if (string.IsNullOrEmpty(trimmedDescription))
        {
            trimmedDescription = null;
        }
        else if (trimmedDescription.Length > MaxDescriptionLength)
        {
            throw new ValidationException($"Description must be {MaxDescriptionLength} characters or fewer.");
        }

        return (trimmedTitle, trimmedDescription);
    }
}
