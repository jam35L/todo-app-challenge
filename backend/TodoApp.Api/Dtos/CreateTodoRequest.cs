namespace TodoApp.Api.Dtos;

/// <summary>Request body for creating a TODO. Field rules are enforced by the service.</summary>
public sealed record CreateTodoRequest(string? Title, string? Description);
