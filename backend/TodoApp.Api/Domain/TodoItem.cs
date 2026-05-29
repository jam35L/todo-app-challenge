namespace TodoApp.Api.Domain;

/// <summary>A single TODO item belonging to a user.</summary>
public sealed class TodoItem
{
    public required Guid Id { get; init; }

    public required string Title { get; init; }

    /// <summary>Optional free-text notes. <c>null</c> when no description was given.</summary>
    public string? Description { get; init; }

    public required DateTimeOffset CreatedAtUtc { get; init; }
}
