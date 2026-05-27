namespace TodoApp.Api.Dtos;

/// <summary>Request body for creating a TODO. Title rules are enforced by the service.</summary>
public sealed record CreateTodoRequest(string? Title);
