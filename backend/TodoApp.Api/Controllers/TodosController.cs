using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using TodoApp.Api.Dtos;
using TodoApp.Api.Services;

namespace TodoApp.Api.Controllers;

/// <summary>
/// Thin HTTP layer over <see cref="ITodoService"/>. The caller identifies itself with an
/// <c>X-User-Id</c> header (no authentication for this exercise); a missing header yields 400.
/// </summary>
[ApiController]
[Route("api/todos")]
public sealed class TodosController(ITodoService todoService) : ControllerBase
{
    private const string UserIdHeaderName = "X-User-Id";

    [HttpGet]
    public ActionResult<IEnumerable<TodoResponse>> GetAll(
        [FromHeader(Name = UserIdHeaderName)][Required] string userId)
    {
        var todos = todoService.GetTodos(userId).Select(TodoResponse.From);
        return Ok(todos);
    }

    [HttpPost]
    public ActionResult<TodoResponse> Create(
        [FromHeader(Name = UserIdHeaderName)][Required] string userId,
        [FromBody] CreateTodoRequest request)
    {
        var created = todoService.AddTodo(userId, request.Title);
        var response = TodoResponse.From(created);
        return Created($"/api/todos/{created.Id}", response);
    }

    [HttpDelete("{id:guid}")]
    public IActionResult Delete(
        [FromHeader(Name = UserIdHeaderName)][Required] string userId,
        Guid id)
    {
        return todoService.DeleteTodo(userId, id) ? NoContent() : NotFound();
    }
}
