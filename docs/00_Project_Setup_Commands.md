 
# KiranaFlow Project Setup Commands

## 1. Create Root Project Structure

Created main project folders:

```text
KiranaFlow
│
├── docs
├── backend
├── frontend
└── database
```

---

# 2. Backend Setup

Move into backend folder:

```powershell
cd backend
```

---

# 3. Create Solution

Created .NET solution:

```powershell
dotnet new sln -n KiranaFlow
```

Created:

```text
KiranaFlow.sln
```

---

# 4. Create Clean Architecture Projects

Created API project:

```powershell
dotnet new webapi -n KiranaFlow.API -o src/KiranaFlow.API
```

Created Application project:

```powershell
dotnet new classlib -n KiranaFlow.Application -o src/KiranaFlow.Application
```

Created Domain project:

```powershell
dotnet new classlib -n KiranaFlow.Domain -o src/KiranaFlow.Domain
```

Created Infrastructure project:

```powershell
dotnet new classlib -n KiranaFlow.Infrastructure -o src/KiranaFlow.Infrastructure
```

---

# 5. Add Projects To Solution

```powershell
dotnet sln KiranaFlow.sln add src/KiranaFlow.API

dotnet sln KiranaFlow.sln add src/KiranaFlow.Application

dotnet sln KiranaFlow.sln add src/KiranaFlow.Domain

dotnet sln KiranaFlow.sln add src/KiranaFlow.Infrastructure
```

---

# 6. Add Project References

## API References

API depends on Application and Infrastructure.

```powershell
dotnet add src/KiranaFlow.API reference src/KiranaFlow.Application

dotnet add src/KiranaFlow.API reference src/KiranaFlow.Infrastructure
```

---

## Application References

Application depends on Domain.

```powershell
dotnet add src/KiranaFlow.Application reference src/KiranaFlow.Domain
```

---

## Infrastructure References

Infrastructure depends on Application and Domain.

```powershell
dotnet add src/KiranaFlow.Infrastructure reference src/KiranaFlow.Application

dotnet add src/KiranaFlow.Infrastructure reference src/KiranaFlow.Domain
```

---

# 7. Install Required Packages

## Infrastructure Packages

Entity Framework Core:

```powershell
dotnet add src/KiranaFlow.Infrastructure package Microsoft.EntityFrameworkCore
```

PostgreSQL provider:

```powershell
dotnet add src/KiranaFlow.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
```

EF Core Design Tools:

```powershell
dotnet add src/KiranaFlow.Infrastructure package Microsoft.EntityFrameworkCore.Design
```

BCrypt password hashing:

```powershell
dotnet add src/KiranaFlow.Infrastructure package BCrypt.Net-Next
```

JWT Token:

```powershell
dotnet add src/KiranaFlow.Infrastructure package System.IdentityModel.Tokens.Jwt
```

---

## API Packages

JWT Authentication:

```powershell
dotnet add src/KiranaFlow.API package Microsoft.AspNetCore.Authentication.JwtBearer
```

Scalar API Documentation:

```powershell
dotnet add src/KiranaFlow.API package Scalar.AspNetCore
```

---

# 8. Install EF Core CLI Tool

Check EF tool:

```powershell
dotnet ef --version
```

If not installed:

```powershell
dotnet tool install --global dotnet-ef
```

---

# 9. PostgreSQL Verification

Check PostgreSQL command:

```powershell
psql --version
```

---

# 10. Database Configuration

Created:

```text
Infrastructure
└── Persistence
    └── ApplicationDbContext.cs
```

Configured PostgreSQL connection in:

```text
API
└── appsettings.json
```

Example:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=KiranaFlowDb;Username=postgres;Password=password"
  }
}
```

---

# 11. Create Initial Migration

Run from backend folder:

```powershell
dotnet ef migrations add InitialCreate --project src/KiranaFlow.Infrastructure --startup-project src/KiranaFlow.API
```

Migration created inside:

```text
KiranaFlow.Infrastructure
└── Migrations
```

---

# 12. Apply Database Migration

```powershell
dotnet ef database update --project src/KiranaFlow.Infrastructure --startup-project src/KiranaFlow.API
```

Creates tables in PostgreSQL.

---

# 13. Remove Migration (If Needed)

If migration is not applied:

```powershell
dotnet ef migrations remove --project src/KiranaFlow.Infrastructure --startup-project src/KiranaFlow.API
```

If already applied:

Rollback database first.

---

# 14. Run Application

From backend folder:

```powershell
dotnet run --project src/KiranaFlow.API
```

---

# 15. Build Solution

```powershell
dotnet build
```

Expected:

```text
Build succeeded
```

---

# 16. API Documentation

Scalar configured using:

```csharp
builder.Services.AddOpenApi();

app.MapOpenApi();

app.MapScalarApiReference();
```

Development URL:

```text
/scalar
```

Example:

```text
http://localhost:5024/scalar
```

---

# 17. Current Installed Technologies

Backend:

* ASP.NET Core Web API
* Entity Framework Core
* PostgreSQL
* Npgsql Provider
* BCrypt.Net
* JWT Authentication
* Scalar API Documentation

Architecture:

* Clean Architecture
* Repository Pattern
* Dependency Injection

---

# Future Module Creation Pattern

For every new feature:

Example: Category

Create:

Domain:

```text
Entities/Category.cs
```

Application:

```text
Features/Categories
DTOs
Interfaces
Validators
```

Infrastructure:

```text
Repositories/CategoryRepository.cs
```

API:

```text
Controllers/CategoriesController.cs
```

---

# Project Setup Complete

Current status:

✅ Solution created
✅ Projects created
✅ References configured
✅ Packages installed
✅ PostgreSQL connected
✅ EF Core configured
✅ Migration applied
✅ Authentication implemented

