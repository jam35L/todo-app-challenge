using TodoApp.Api.Infrastructure;
using TodoApp.Api.Repositories;
using TodoApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicyName = "frontend";

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// RFC-7807 error responses + global mapping of exceptions to ProblemDetails.
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// In-memory store is a singleton (shared, thread-safe); the service is stateless.
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<ITodoRepository, InMemoryTodoRepository>();
builder.Services.AddScoped<ITodoService, TodoService>();

builder.Services.AddCors(options =>
    options.AddPolicy(CorsPolicyName, policy =>
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()));

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(CorsPolicyName);
app.MapControllers();

app.Run();

// Exposed so the integration test project can spin up the app via WebApplicationFactory.
public partial class Program;
