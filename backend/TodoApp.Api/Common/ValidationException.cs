namespace TodoApp.Api.Common;

/// <summary>
/// Thrown when a request fails a business-rule validation. Mapped to an HTTP 400
/// ProblemDetails response by the global exception handler.
/// </summary>
public sealed class ValidationException(string message) : Exception(message);
