namespace TodoApp.Api.Domain;

/// <summary>A single TODO item belonging to a user.</summary>
public sealed class TodoItem
{
    public required Guid Id { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }
}
