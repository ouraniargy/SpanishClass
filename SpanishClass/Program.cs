using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SpanishClass.Models;
using SpanishClass.Npgsql;
using SpanishClass.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactCorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<SpanishClassDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services
    .AddIdentity<ApplicationUser, IdentityRole<Guid>>()
    .AddEntityFrameworkStores<SpanishClassDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication()
    .AddGoogle(options =>
    {
        options.ClientId = "311751176999-v6i6inu9cd0dbbb7ecb0rric64fr33qs.apps.googleusercontent.com";
        options.ClientSecret = "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";
        options.CallbackPath = "/signin-google";
    });

builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Events.OnRedirectToLogin = ctx =>
    {
        if (ctx.Request.Path.StartsWithSegments("/api"))
        {
            ctx.Response.StatusCode = 401;
        }
        else
        {
            ctx.Response.Redirect(ctx.RedirectUri);
        }
        return Task.CompletedTask;
    };
});

builder.Services.AddAuthentication(options => {
    options.DefaultScheme = IdentityConstants.ApplicationScheme;
})
.AddCookie();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseStaticFiles();

app.UseRouting();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SpanishClass API V1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.UseCors("ReactCorsPolicy");

app.UseSession();

app.MapControllers();

app.Run();
