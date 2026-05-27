using TodoApp.Api.Domain;

namespace TodoApp.Api.Dtos;

/// <summary>The wire representation of a TODO item returned to clients.</summary>
public sealed record TodoResponse(Guid Id, string Title, DateTimeOffset CreatedAt)
{
    public static TodoResponse From(TodoItem item) => new(item.Id, item.Title, item.CreatedAt);
}
