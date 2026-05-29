using TodoApp.Api.Domain;

namespace TodoApp.Api.Services;

/// <summary>Business logic for managing a user's TODO items.</summary>
public interface ITodoService
{
    /// <summary>Returns the user's items, newest first.</summary>
    IReadOnlyList<TodoItem> GetTodos(string userId);

    /// <summary>Validates the input, creates the item, and stores it.</summary>
    /// <exception cref="Common.ValidationException">The title is empty or too long, or the description is too long.</exception>
    TodoItem AddTodo(string userId, string? title, string? description);

    /// <summary>
    /// Validates the input and replaces the item's title/description, preserving its id and
    /// creation time.
    /// </summary>
    /// <returns>The updated item, or <c>null</c> if the user has no item with that id.</returns>
    /// <exception cref="Common.ValidationException">The title is empty or too long, or the description is too long.</exception>
    TodoItem? UpdateTodo(string userId, Guid id, string? title, string? description);

    /// <returns><c>true</c> if an item was deleted; <c>false</c> if it did not exist.</returns>
    bool DeleteTodo(string userId, Guid id);
}
