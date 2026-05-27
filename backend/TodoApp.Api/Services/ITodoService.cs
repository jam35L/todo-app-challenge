using TodoApp.Api.Domain;

namespace TodoApp.Api.Services;

/// <summary>Business logic for managing a user's TODO items.</summary>
public interface ITodoService
{
    /// <summary>Returns the user's items, newest first.</summary>
    IReadOnlyList<TodoItem> GetTodos(string userId);

    /// <summary>Validates the title, creates the item, and stores it.</summary>
    /// <exception cref="Common.ValidationException">The title is empty or too long.</exception>
    TodoItem AddTodo(string userId, string? title);

    /// <returns><c>true</c> if an item was deleted; <c>false</c> if it did not exist.</returns>
    bool DeleteTodo(string userId, Guid id);
}
